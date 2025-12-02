/**
 * API Configuration for Admin Panel
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  import.meta.env.REACT_APP_API_URL || 
  'https://bmi-server-eight.vercel.app';

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Dashboard
  DASHBOARD: {
    STATS: '/api/admin-dashboard-stats',
    TOP_PERFORMERS: '/api/admin-top-performers',
  },

  // Screen/Player Management
  SCREENS: {
    REGISTER: '/api/adscape/register',
    GET_ALL: '/api/adscape/players',
    GET_BY_ID: (screenId: string) => `/api/adscape/player/${screenId}`,
    UPDATE_FLOW_TYPE: (screenId: string) => `/api/adscape/player/${screenId}/flow-type`,
    UPDATE_CONFIG: (screenId: string) => `/api/adscape/player/${screenId}/config`,
    DELETE: (screenId: string) => `/api/adscape/player/${screenId}`,
  },

  // BMI Analytics
  ANALYTICS: {
    BMI_STATS: '/api/admin/bmi-stats',
    USER_ACTIVITY: '/api/admin/user-activity',
    WEIGHT_CLASSIFICATION: '/api/admin/weight-classification',
  },

  // Media
  MEDIA: {
    UPLOAD: '/api/media/upload',
    GET_ALL: '/api/media',
    DELETE: '/api/media/delete',
  },

  // Playlists
  PLAYLISTS: {
    GET_ALL: '/api/playlists',
    GET_BY_ID: (id: string) => `/api/playlists/${id}`,
    CREATE: '/api/playlists',
    UPDATE: (id: string) => `/api/playlists/${id}`,
    DELETE: (id: string) => `/api/playlists/${id}`,
  },

  // Schedules
  SCHEDULES: {
    GET_ALL: '/api/schedules',
    GET_BY_ID: (id: string) => `/api/schedules/${id}`,
    CREATE: '/api/schedules',
    UPDATE: (id: string) => `/api/schedules/${id}`,
    DELETE: (id: string) => `/api/schedules/${id}`,
  },

  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
    REGISTER_ADMIN: '/api/auth/admin/register',
    GET_ALL_ADMINS: '/api/auth/admins',
    UPDATE_ADMIN: (id: string) => `/api/auth/admin/${id}`,
    DELETE_ADMIN: (id: string) => `/api/auth/admin/${id}`,
    ASSIGN_SCREENS: (id: string) => `/api/auth/admin/${id}/assign-screens`,
    GET_ADMIN_SCREENS: (id: string) => `/api/auth/admin/${id}/screens`,
  },
};

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('bmi_admin_token');
}

/**
 * Check if user is authenticated before making API calls
 */
function checkAuthBeforeRequest(): boolean {
  const token = getAuthToken();
  if (!token) {
    console.warn('API call attempted without authentication token');
    return false;
  }
  return true;
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
 * Generic API fetch function with auth
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  // Check if token exists before making request
  if (!token) {
    const error = new Error('Access token required');
    (error as any).status = 401;
    (error as any).isAuthError = true;
    throw error;
  }
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Handle 401 (Unauthorized) errors
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({ error: 'Unauthorized' }));
        const authError = new Error(errorData.error || 'Access token required');
        (authError as any).status = 401;
        (authError as any).isAuthError = true;
        
        // Clear invalid token and redirect to login
        handleUnauthorized();
        
        throw authError;
      }
      
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error: any) {
    // Re-throw auth errors as-is
    if (error.isAuthError) {
      throw error;
    }
    
    // Handle network errors that might be auth-related
    if (error.message && error.message.includes('token')) {
      handleUnauthorized();
    }
    
    // Only log non-401 errors to reduce console noise
    if (error.status !== 401) {
      console.error(`API Error [${endpoint}]:`, error);
    }
    throw error;
  }
}

/**
 * API Functions
 */
export const api = {
  // Dashboard
  getDashboardStats: () => fetchAPI(API_ENDPOINTS.DASHBOARD.STATS),
  getTopPerformers: () => fetchAPI(API_ENDPOINTS.DASHBOARD.TOP_PERFORMERS),

  // Screens
  getAllPlayers: () => fetchAPI(API_ENDPOINTS.SCREENS.GET_ALL),
  getPlayer: (screenId: string) => fetchAPI(API_ENDPOINTS.SCREENS.GET_BY_ID(screenId)),
  updateFlowType: (screenId: string, flowType: string) =>
    fetchAPI(API_ENDPOINTS.SCREENS.UPDATE_FLOW_TYPE(screenId), {
      method: 'PUT',
      body: JSON.stringify({ flowType }),
    }),
  updateScreenConfig: (screenId: string, config: {
    deviceName?: string;
    location?: string;
    flowType?: string | null;
    isActive?: boolean;
    playlistId?: string | null;
    playlistStartDate?: string | null;
    playlistEndDate?: string | null;
  }) =>
    fetchAPI(API_ENDPOINTS.SCREENS.UPDATE_CONFIG(screenId), {
      method: 'PUT',
      body: JSON.stringify(config),
    }),
  deletePlayer: (screenId: string) =>
    fetchAPI(API_ENDPOINTS.SCREENS.DELETE(screenId), {
      method: 'DELETE',
    }),

  // Analytics
  getBMIStats: () => fetchAPI(API_ENDPOINTS.ANALYTICS.BMI_STATS),
  getUserActivity: () => fetchAPI(API_ENDPOINTS.ANALYTICS.USER_ACTIVITY),
  getWeightClassification: () => fetchAPI(API_ENDPOINTS.ANALYTICS.WEIGHT_CLASSIFICATION),

  // Users
  getAllUsers: () => fetchAPI('/api/admin/users'),

  // Media
  uploadMedia: async (formData: FormData) => {
    const url = `${API_BASE_URL}${API_ENDPOINTS.MEDIA.UPLOAD}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let browser set it with boundary
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },
  getAllMedia: () => fetchAPI(API_ENDPOINTS.MEDIA.GET_ALL),
  deleteMedia: async (id: string, publicId: string, resourceType?: string) => {
    return fetchAPI(API_ENDPOINTS.MEDIA.DELETE, {
      method: 'DELETE',
      body: JSON.stringify({ publicId, resourceType }),
    });
  },

  // Playlists
  getAllPlaylists: () => fetchAPI(API_ENDPOINTS.PLAYLISTS.GET_ALL),
  getPlaylistById: (id: string) => fetchAPI(API_ENDPOINTS.PLAYLISTS.GET_BY_ID(id)),
  getPlaylist: (id: string) => fetchAPI(API_ENDPOINTS.PLAYLISTS.GET_BY_ID(id)), // Alias for getPlaylistById
  createPlaylist: (playlist: any) =>
    fetchAPI(API_ENDPOINTS.PLAYLISTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(playlist),
    }),
  updatePlaylist: (id: string, playlist: any) =>
    fetchAPI(API_ENDPOINTS.PLAYLISTS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(playlist),
    }),
  deletePlaylist: (id: string) =>
    fetchAPI(API_ENDPOINTS.PLAYLISTS.DELETE(id), {
      method: 'DELETE',
    }),

  // Schedules
  getAllSchedules: () => fetchAPI(API_ENDPOINTS.SCHEDULES.GET_ALL),
  getScheduleById: (id: string) => fetchAPI(API_ENDPOINTS.SCHEDULES.GET_BY_ID(id)),
  createSchedule: (schedule: any) =>
    fetchAPI(API_ENDPOINTS.SCHEDULES.CREATE, {
      method: 'POST',
      body: JSON.stringify(schedule),
    }),
  updateSchedule: (id: string, schedule: any) =>
    fetchAPI(API_ENDPOINTS.SCHEDULES.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(schedule),
    }),
  deleteSchedule: (id: string) =>
    fetchAPI(API_ENDPOINTS.SCHEDULES.DELETE(id), {
      method: 'DELETE',
    }),

  // Auth
  login: async (email: string, password: string) => {
    const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },
  getCurrentUser: () => fetchAPI(API_ENDPOINTS.AUTH.ME),
  registerAdmin: (adminData: any) =>
    fetchAPI(API_ENDPOINTS.AUTH.REGISTER_ADMIN, {
      method: 'POST',
      body: JSON.stringify(adminData),
    }),
  getAllAdmins: () => fetchAPI(API_ENDPOINTS.AUTH.GET_ALL_ADMINS),
  updateAdmin: (id: string, adminData: any) =>
    fetchAPI(API_ENDPOINTS.AUTH.UPDATE_ADMIN(id), {
      method: 'PUT',
      body: JSON.stringify(adminData),
    }),
  deleteAdmin: (id: string) =>
    fetchAPI(API_ENDPOINTS.AUTH.DELETE_ADMIN(id), {
      method: 'DELETE',
    }),
  assignScreens: (id: string, screenIds: string[]) =>
    fetchAPI(API_ENDPOINTS.AUTH.ASSIGN_SCREENS(id), {
      method: 'POST',
      body: JSON.stringify({ screenIds }),
    }),
  getAdminScreens: (id: string) => fetchAPI(API_ENDPOINTS.AUTH.GET_ADMIN_SCREENS(id)),
};

export default api;

