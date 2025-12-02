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

// Token expiration: 60 days for all tokens
const TOKEN_EXPIRY_DAYS = 60;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if token is expired
  const isTokenExpired = (): boolean => {
    try {
      const tokenExpiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
      if (!tokenExpiry) return true;
      
      const expiryDate = new Date(tokenExpiry);
      const now = new Date();
      return expiryDate <= now;
    } catch (error) {
      return true;
    }
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const tokenExpiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);

        if (storedToken && storedUser && tokenExpiry) {
          // Check if token is still valid based on expiry date
          if (!isTokenExpired()) {
            // Token exists and hasn't expired locally, set auth state
            // Server-side validation will happen on first API call
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token expired based on expiry date, clear storage and logout
            clearAuthData();
            // Redirect to login if not already there
            if (window.location.pathname !== '/') {
              window.location.href = '/';
            }
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

  // Periodic check for token expiration (every 5 minutes)
  useEffect(() => {
    if (!token) return;

    const checkTokenExpiry = () => {
      if (isTokenExpired()) {
        console.log('Token expired, logging out automatically');
        clearAuthData();
        // Redirect to login if not already there
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Set up interval to check every 5 minutes
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token]);

  const clearAuthData = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
    setToken(null);
    setUser(null);
  };

  const saveAuthData = (authToken: string, userData: User, rememberMe: boolean = false) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + TOKEN_EXPIRY_DAYS);

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
    // Redirect to login page
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
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

