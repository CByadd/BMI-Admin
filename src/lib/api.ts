/**
 * API Configuration for Admin Panel
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 
  import.meta.env.REACT_APP_API_URL || 
  'http://localhost:4000';

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
    GET_BY_CODE: (code: string) => `/api/adscape/player-by-code/${code}`,
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

  // Users
  USERS: {
    GET_ALL: '/api/admin/users',
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
};

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('bmi_admin_token');
}

/**
 * Generic API fetch function
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('bmi_admin_token');
      localStorage.removeItem('bmi_admin_user');
      localStorage.removeItem('bmi_admin_token_expiry');
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
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
  getPlayerByCode: (code: string) => fetchAPI(API_ENDPOINTS.SCREENS.GET_BY_CODE(code)),
  updateFlowType: (screenId: string, flowType: string) =>
    fetchAPI(API_ENDPOINTS.SCREENS.UPDATE_FLOW_TYPE(screenId), {
      method: 'PUT',
      body: JSON.stringify({ flowType }),
    }),
  updateScreenConfig: (screenId: string, config: { name?: string; displayName?: string; address?: string; location?: string; flowType?: string; isEnabled?: boolean; playlistId?: string | null; playlistStartDate?: string | null; playlistEndDate?: string | null }) =>
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
  getAllUsers: () => fetchAPI(API_ENDPOINTS.USERS.GET_ALL),

  // Media
  uploadMedia: async (formData: FormData) => {
    const url = `${API_BASE_URL}${API_ENDPOINTS.MEDIA.UPLOAD}`;
    const token = getAuthToken();
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type header - let browser set it with boundary for FormData
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('bmi_admin_token');
      localStorage.removeItem('bmi_admin_user');
      localStorage.removeItem('bmi_admin_token_expiry');
      window.location.href = '/';
      throw new Error('Session expired. Please login again.');
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  },
  getAllMedia: () => fetchAPI(API_ENDPOINTS.MEDIA.GET_ALL),
  deleteMedia: async (id: string, publicId: string) => {
    return fetchAPI(API_ENDPOINTS.MEDIA.DELETE, {
      method: 'DELETE',
      body: JSON.stringify({ publicId }),
    });
  },

  // Playlists
  getAllPlaylists: () => fetchAPI(API_ENDPOINTS.PLAYLISTS.GET_ALL),
  getPlaylist: (id: string) => fetchAPI(API_ENDPOINTS.PLAYLISTS.GET_BY_ID(id)),
  createPlaylist: (data: { name: string; description?: string; tags?: string | string[] }) =>
    fetchAPI(API_ENDPOINTS.PLAYLISTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePlaylist: (id: string, data: { name?: string; description?: string; tags?: string | string[]; slots?: any[] }) =>
    fetchAPI(API_ENDPOINTS.PLAYLISTS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePlaylist: (id: string) =>
    fetchAPI(API_ENDPOINTS.PLAYLISTS.DELETE(id), {
      method: 'DELETE',
    }),

  // Schedules
  getAllSchedules: () => fetchAPI(API_ENDPOINTS.SCHEDULES.GET_ALL),
  getSchedule: (id: string) => fetchAPI(API_ENDPOINTS.SCHEDULES.GET_BY_ID(id)),
  createSchedule: (data: { name: string; description?: string; events?: any[] }) =>
    fetchAPI(API_ENDPOINTS.SCHEDULES.CREATE, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSchedule: (id: string, data: { name?: string; description?: string; events?: any[]; status?: string }) =>
    fetchAPI(API_ENDPOINTS.SCHEDULES.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSchedule: (id: string) =>
    fetchAPI(API_ENDPOINTS.SCHEDULES.DELETE(id), {
      method: 'DELETE',
    }),
};

export default api;

