/**
 * Unified Axios Instance for Admin App
 */
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// const API_BASE_URL = 'https://bmi-server-eight.vercel.app';

// const API_BASE_URL = 'http://localhost:4000';
// const API_BASE_URL = 'http://103.118.158.165';
const API_BASE_URL = 'https://api.well2day.in';

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('bmi_admin_token');
}

/**
 * Handle 401 errors by clearing auth and redirecting to login
 */
function handleUnauthorized() {
  // Clear all auth-related storage
  localStorage.removeItem('bmi_admin_token');
  localStorage.removeItem('bmi_admin_user');
  localStorage.removeItem('bmi_admin_token_expiry');
  localStorage.removeItem('bmi_admin_remember');
  
  // Redirect to login page if we're not already there
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  }
}

/**
 * Create axios instance
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request interceptor - Add auth token to all requests
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors globally
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data as any;
      const errorMessage = errorData?.error || error.message || `HTTP error! status: ${status}`;
      
      // Handle 401 (Unauthorized) errors
      if (status === 401) {
        handleUnauthorized();
        const authError = new Error(errorMessage);
        (authError as any).status = 401;
        (authError as any).isAuthError = true;
        return Promise.reject(authError);
      }
      
      // Handle 500 errors that might be authentication-related
      if (status === 500 && (
        errorMessage.toLowerCase().includes('authentication') || 
        errorMessage.toLowerCase().includes('token')
      )) {
        handleUnauthorized();
        const authError = new Error('Authentication failed. Please log in again.');
        (authError as any).status = 500;
        (authError as any).isAuthError = true;
        return Promise.reject(authError);
      }
      
      // Create error with status and message
      const apiError = new Error(errorMessage);
      (apiError as any).status = status;
      (apiError as any).response = error.response;
      return Promise.reject(apiError);
    }
    
    // Network errors
    if (error.request) {
      const networkError = new Error('Network error. Please check your connection.');
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { API_BASE_URL };
