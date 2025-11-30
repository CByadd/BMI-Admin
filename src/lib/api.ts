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
    DELETE: (id: string) => `/api/media/${id}`,
  },
};

/**
 * Generic API fetch function
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
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
  deleteMedia: async (id: string, publicId: string) => {
    return fetchAPI(API_ENDPOINTS.MEDIA.DELETE(id), {
      method: 'DELETE',
      body: JSON.stringify({ publicId }),
    });
  },
};

export default api;

