/**
 * API Configuration for Admin Panel
 */
import axiosInstance from './axios';
import { useApiStore } from '../stores/apiStore';

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
    UPLOAD_LOGO: (screenId: string) => `/api/adscape/player/${screenId}/logo`,
    GET_LOGO: (screenId: string) => `/api/adscape/player/${screenId}/logo`,
    DELETE_LOGO: (screenId: string) => `/api/adscape/player/${screenId}/logo`,
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
 * Generic API function using axios
 */
async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  config?: any
): Promise<T> {
  const { setLoading, setError } = useApiStore.getState();
  
  try {
    setLoading(true);
    setError(null);
    
    let response;
    switch (method) {
      case 'GET':
        response = await axiosInstance.get<T>(endpoint, config);
        break;
      case 'POST':
        response = await axiosInstance.post<T>(endpoint, data, config);
        break;
      case 'PUT':
        response = await axiosInstance.put<T>(endpoint, data, config);
        break;
      case 'DELETE':
        response = await axiosInstance.delete<T>(endpoint, config);
        break;
    }
    
    return response.data;
  } catch (error: any) {
    const errorMessage = error.message || 'An error occurred';
    setError(errorMessage);
    throw error;
  } finally {
    setLoading(false);
  }
}

/**
 * API Functions
 */
export const api = {
  // Dashboard
  getDashboardStats: () => apiRequest('GET', API_ENDPOINTS.DASHBOARD.STATS),
  getTopPerformers: () => apiRequest('GET', API_ENDPOINTS.DASHBOARD.TOP_PERFORMERS),

  // Screens
  getAllPlayers: () => apiRequest('GET', API_ENDPOINTS.SCREENS.GET_ALL),
  getPlayer: (screenId: string) => apiRequest('GET', API_ENDPOINTS.SCREENS.GET_BY_ID(screenId)),
  updateFlowType: (screenId: string, flowType: string) =>
    apiRequest('PUT', API_ENDPOINTS.SCREENS.UPDATE_FLOW_TYPE(screenId), { flowType }),
  updateScreenConfig: (screenId: string, config: {
    deviceName?: string;
    location?: string;
    flowType?: string | null;
    isActive?: boolean;
    playlistId?: string | null;
    playlistStartDate?: string | null;
    playlistEndDate?: string | null;
    heightCalibration?: number;
    paymentAmount?: number | null;
    logoUrl?: string | null;
  }) =>
    apiRequest('PUT', API_ENDPOINTS.SCREENS.UPDATE_CONFIG(screenId), config),
  uploadLogo: async (screenId: string, file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const { setLoading, setError } = useApiStore.getState();
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.post(API_ENDPOINTS.SCREENS.UPLOAD_LOGO(screenId), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  },
  getLogo: (screenId: string) => apiRequest('GET', API_ENDPOINTS.SCREENS.GET_LOGO(screenId)),
  deleteLogo: (screenId: string) => apiRequest('DELETE', API_ENDPOINTS.SCREENS.DELETE_LOGO(screenId)),
  deletePlayer: (screenId: string) => apiRequest('DELETE', API_ENDPOINTS.SCREENS.DELETE(screenId)),

  // Analytics
  getBMIStats: () => apiRequest('GET', API_ENDPOINTS.ANALYTICS.BMI_STATS),
  getUserActivity: () => apiRequest('GET', API_ENDPOINTS.ANALYTICS.USER_ACTIVITY),
  getWeightClassification: () => apiRequest('GET', API_ENDPOINTS.ANALYTICS.WEIGHT_CLASSIFICATION),
  getScreenBMIRecords: (screenId: string, dateFilter?: string, startDate?: string, endDate?: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (dateFilter) params.append('dateFilter', dateFilter);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (page !== undefined) params.append('page', page.toString());
    if (limit !== undefined) params.append('limit', limit.toString());
    const queryString = params.toString();
    return apiRequest('GET', `/api/admin/screen/${screenId}/bmi-records${queryString ? `?${queryString}` : ''}`);
  },

  // Users
  getAllUsers: () => apiRequest('GET', '/api/admin/users'),

  // Media
  uploadMedia: async (formData: FormData) => {
    const { setLoading, setError } = useApiStore.getState();
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.post(API_ENDPOINTS.MEDIA.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  },
  getAllMedia: () => apiRequest('GET', API_ENDPOINTS.MEDIA.GET_ALL),
  deleteMedia: async (id: string, publicId: string, resourceType?: string) => {
    return apiRequest('DELETE', API_ENDPOINTS.MEDIA.DELETE, { publicId, resourceType });
  },

  // Playlists
  getAllPlaylists: () => apiRequest('GET', API_ENDPOINTS.PLAYLISTS.GET_ALL),
  getPlaylistById: (id: string) => apiRequest('GET', API_ENDPOINTS.PLAYLISTS.GET_BY_ID(id)),
  getPlaylist: (id: string) => apiRequest('GET', API_ENDPOINTS.PLAYLISTS.GET_BY_ID(id)), // Alias for getPlaylistById
  createPlaylist: (playlist: any) => apiRequest('POST', API_ENDPOINTS.PLAYLISTS.CREATE, playlist),
  updatePlaylist: (id: string, playlist: any) => apiRequest('PUT', API_ENDPOINTS.PLAYLISTS.UPDATE(id), playlist),
  deletePlaylist: (id: string) => apiRequest('DELETE', API_ENDPOINTS.PLAYLISTS.DELETE(id)),

  // Schedules
  getAllSchedules: () => apiRequest('GET', API_ENDPOINTS.SCHEDULES.GET_ALL),
  getScheduleById: (id: string) => apiRequest('GET', API_ENDPOINTS.SCHEDULES.GET_BY_ID(id)),
  createSchedule: (schedule: any) => apiRequest('POST', API_ENDPOINTS.SCHEDULES.CREATE, schedule),
  updateSchedule: (id: string, schedule: any) => apiRequest('PUT', API_ENDPOINTS.SCHEDULES.UPDATE(id), schedule),
  deleteSchedule: (id: string) => apiRequest('DELETE', API_ENDPOINTS.SCHEDULES.DELETE(id)),

  // Auth
  login: async (email: string, password: string) => {
    const { setLoading, setError } = useApiStore.getState();
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  },
  getCurrentUser: () => apiRequest('GET', API_ENDPOINTS.AUTH.ME),
  registerAdmin: (adminData: any) => apiRequest('POST', API_ENDPOINTS.AUTH.REGISTER_ADMIN, adminData),
  getAllAdmins: () => apiRequest('GET', API_ENDPOINTS.AUTH.GET_ALL_ADMINS),
  updateAdmin: (id: string, adminData: any) => apiRequest('PUT', API_ENDPOINTS.AUTH.UPDATE_ADMIN(id), adminData),
  deleteAdmin: (id: string) => apiRequest('DELETE', API_ENDPOINTS.AUTH.DELETE_ADMIN(id)),
  assignScreens: (id: string, screenIds: string[]) => apiRequest('POST', API_ENDPOINTS.AUTH.ASSIGN_SCREENS(id), { screenIds }),
  getAdminScreens: (id: string) => apiRequest('GET', API_ENDPOINTS.AUTH.GET_ADMIN_SCREENS(id)),
};

export default api;

