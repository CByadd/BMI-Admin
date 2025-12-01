import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'bmi_admin_token',
  USER: 'bmi_admin_user',
  TOKEN_EXPIRY: 'bmi_admin_token_expiry',
  REMEMBER_ME: 'bmi_admin_remember',
};

// Token expiration: 30 days for "remember me", 7 days otherwise
const TOKEN_EXPIRY_DAYS = {
  REMEMBER: 30,
  DEFAULT: 7,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const tokenExpiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

        if (storedToken && storedUser && tokenExpiry) {
          const expiryDate = new Date(tokenExpiry);
          const now = new Date();

          // Check if token is still valid
          if (expiryDate > now) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token expired, clear storage
            clearAuthData();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    setToken(null);
    setUser(null);
  };

  const saveAuthData = (authToken: string, userData: User, rememberMe: boolean = false) => {
    const expiryDays = rememberMe ? TOKEN_EXPIRY_DAYS.REMEMBER : TOKEN_EXPIRY_DAYS.DEFAULT;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    localStorage.setItem(STORAGE_KEYS.TOKEN, authToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryDate.toISOString());
    
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    }

    setToken(authToken);
    setUser(userData);
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const { api } = await import('@/lib/api');
      const response = await api.login(email, password);

      if (response.token && response.user) {
        const userData: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
        };

        saveAuthData(response.token, userData, rememberMe);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    clearAuthData();
    // Navigation will be handled by the component calling logout
  };

  const refreshToken = async () => {
    try {
      const { api } = await import('@/lib/api');
      const response = await api.getCurrentUser();
      
      if (response.user) {
        const userData: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
        };
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

