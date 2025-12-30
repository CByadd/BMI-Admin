import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import api from "@/lib/api";

// Storage keys
const STORAGE_KEYS = {
  SCREENS: 'bmi_admin_screens',
  PLAYLISTS: 'bmi_admin_playlists',
  SCHEDULES: 'bmi_admin_schedules',
  LAST_SYNC: 'bmi_admin_last_sync',
};

// Cache expiry time (5 minutes)
const CACHE_EXPIRY_MS = 5 * 60 * 1000;

interface Screen {
  id: string;
  name: string;
  model: string;
  status: "online" | "offline" | "maintenance";
  location: string;
  lastSync: string;
  todayUsers: number;
  totalUsers: number;
  flowType: string | null;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  slots?: any[];
  slotCount?: number;
  [key: string]: any;
}

interface Schedule {
  id: string;
  [key: string]: any;
}

interface DataContextType {
  // Data
  screens: Screen[];
  playlists: Playlist[];
  schedules: Schedule[];
  
  // Loading states
  isLoadingScreens: boolean;
  isLoadingPlaylists: boolean;
  isLoadingSchedules: boolean;
  
  // Actions
  refreshScreens: () => Promise<void>;
  refreshPlaylists: () => Promise<void>;
  refreshSchedules: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Update methods
  updateScreen: (screenId: string, updates: Partial<Screen>) => void;
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) => void;
  updateSchedule: (scheduleId: string, updates: Partial<Schedule>) => void;
  
  // Delete methods
  removeScreen: (screenId: string) => void;
  removePlaylist: (playlistId: string) => void;
  removeSchedule: (scheduleId: string) => void;
  
  // Add methods
  addScreen: (screen: Screen) => void;
  addPlaylist: (playlist: Playlist) => void;
  addSchedule: (schedule: Schedule) => void;
  
  // Get methods
  getScreen: (screenId: string) => Screen | undefined;
  getPlaylist: (playlistId: string) => Playlist | undefined;
  getSchedule: (scheduleId: string) => Schedule | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper function to check if cache is expired
const isCacheExpired = (): boolean => {
  try {
    const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    if (!lastSync) return true;
    
    const lastSyncTime = parseInt(lastSync, 10);
    const now = Date.now();
    return (now - lastSyncTime) > CACHE_EXPIRY_MS;
  } catch {
    return true;
  }
};

// Helper function to save last sync time
const saveLastSync = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  } catch (error) {
    console.error('Error saving last sync time:', error);
  }
};

// Helper function to transform player data to Screen format
const transformPlayerToScreen = (player: any): Screen => {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const lastSeen = new Date(player.lastSeen);
  const isOnline = player.isActive && lastSeen >= fiveMinutesAgo;
  const isOffline = !player.isActive || lastSeen < oneDayAgo;
  
  let status: "online" | "offline" | "maintenance" = "offline";
  if (isOnline) {
    status = "online";
  } else if (isOffline) {
    status = "offline";
  } else {
    status = "maintenance";
  }

  // Calculate time ago
  const timeDiff = Date.now() - lastSeen.getTime();
  const minutesAgo = Math.floor(timeDiff / (1000 * 60));
  const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
  const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  let lastSync = "";
  if (minutesAgo < 60) {
    lastSync = `${minutesAgo} ${minutesAgo === 1 ? 'min' : 'mins'} ago`;
  } else if (hoursAgo < 24) {
    lastSync = `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
  } else {
    lastSync = `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`;
  }

  const flowType = player.flowType;
  const flowTypeLabel = flowType || "Normal";
  const model = `Flow ${flowTypeLabel} - ${player.screenWidth || 'Unknown'}x${player.screenHeight || 'Unknown'} Display`;

  return {
    id: player.screenId,
    name: player.deviceName || player.screenId,
    model,
    status,
    location: player.location || "Unknown Location",
    lastSync,
    todayUsers: 0, // TODO: Add API endpoint for today's BMI count per screen
    totalUsers: 0, // TODO: Add API endpoint for total BMI count per screen
    flowType: flowType,
  };
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  
  const [isLoadingScreens, setIsLoadingScreens] = useState(false);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadCachedData = () => {
      try {
        // Load screens
        const cachedScreens = localStorage.getItem(STORAGE_KEYS.SCREENS);
        if (cachedScreens) {
          setScreens(JSON.parse(cachedScreens));
        }
        
        // Load playlists
        const cachedPlaylists = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
        if (cachedPlaylists) {
          setPlaylists(JSON.parse(cachedPlaylists));
        }
        
        // Load schedules
        const cachedSchedules = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
        if (cachedSchedules) {
          setSchedules(JSON.parse(cachedSchedules));
        }
      } catch (error) {
        console.error('Error loading cached data:', error);
      }
    };

    loadCachedData();
    
    // Refresh if cache is expired
    if (isCacheExpired()) {
      refreshAll();
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCREENS, JSON.stringify(screens));
    } catch (error) {
      console.error('Error saving screens to cache:', error);
    }
  }, [screens]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch (error) {
      console.error('Error saving playlists to cache:', error);
    }
  }, [playlists]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
    } catch (error) {
      console.error('Error saving schedules to cache:', error);
    }
  }, [schedules]);

  // Refresh screens
  const refreshScreens = useCallback(async () => {
    setIsLoadingScreens(true);
    try {
      const response = await api.getAllPlayers() as { ok: boolean; players: any[] };
      
      if (response.ok && response.players) {
        const screensData: Screen[] = response.players.map(transformPlayerToScreen);
        setScreens(screensData);
        saveLastSync();
      }
    } catch (error) {
      console.error('Error fetching screens:', error);
    } finally {
      setIsLoadingScreens(false);
    }
  }, []);

  // Refresh playlists
  const refreshPlaylists = useCallback(async () => {
    setIsLoadingPlaylists(true);
    try {
      const response = await api.getAllPlaylists() as { ok: boolean; playlists: Playlist[] };
      if (response.ok && response.playlists) {
        setPlaylists(response.playlists);
        saveLastSync();
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setIsLoadingPlaylists(false);
    }
  }, []);

  // Refresh schedules
  const refreshSchedules = useCallback(async () => {
    setIsLoadingSchedules(true);
    try {
      const response = await api.getAllSchedules() as { ok: boolean; schedules: Schedule[] };
      if (response.ok && response.schedules) {
        setSchedules(response.schedules);
        saveLastSync();
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setIsLoadingSchedules(false);
    }
  }, []);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshScreens(),
      refreshPlaylists(),
      refreshSchedules(),
    ]);
  }, [refreshScreens, refreshPlaylists, refreshSchedules]);

  // Update screen
  const updateScreen = useCallback((screenId: string, updates: Partial<Screen>) => {
    setScreens(prev => prev.map(screen => 
      screen.id === screenId ? { ...screen, ...updates } : screen
    ));
  }, []);

  // Update playlist
  const updatePlaylist = useCallback((playlistId: string, updates: Partial<Playlist>) => {
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId ? { ...playlist, ...updates } : playlist
    ));
  }, []);

  // Update schedule
  const updateSchedule = useCallback((scheduleId: string, updates: Partial<Schedule>) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId ? { ...schedule, ...updates } : schedule
    ));
  }, []);

  // Remove screen
  const removeScreen = useCallback((screenId: string) => {
    setScreens(prev => prev.filter(screen => screen.id !== screenId));
  }, []);

  // Remove playlist
  const removePlaylist = useCallback((playlistId: string) => {
    setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
  }, []);

  // Remove schedule
  const removeSchedule = useCallback((scheduleId: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
  }, []);

  // Add screen
  const addScreen = useCallback((screen: Screen) => {
    setScreens(prev => {
      // Check if screen already exists
      if (prev.find(s => s.id === screen.id)) {
        return prev.map(s => s.id === screen.id ? screen : s);
      }
      return [...prev, screen];
    });
  }, []);

  // Add playlist
  const addPlaylist = useCallback((playlist: Playlist) => {
    setPlaylists(prev => {
      // Check if playlist already exists
      if (prev.find(p => p.id === playlist.id)) {
        return prev.map(p => p.id === playlist.id ? playlist : p);
      }
      return [...prev, playlist];
    });
  }, []);

  // Add schedule
  const addSchedule = useCallback((schedule: Schedule) => {
    setSchedules(prev => {
      // Check if schedule already exists
      if (prev.find(s => s.id === schedule.id)) {
        return prev.map(s => s.id === schedule.id ? schedule : s);
      }
      return [...prev, schedule];
    });
  }, []);

  // Get screen
  const getScreen = useCallback((screenId: string) => {
    return screens.find(screen => screen.id === screenId);
  }, [screens]);

  // Get playlist
  const getPlaylist = useCallback((playlistId: string) => {
    return playlists.find(playlist => playlist.id === playlistId);
  }, [playlists]);

  // Get schedule
  const getSchedule = useCallback((scheduleId: string) => {
    return schedules.find(schedule => schedule.id === scheduleId);
  }, [schedules]);

  // Auto-refresh on focus (when user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (isCacheExpired()) {
        refreshAll();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refreshAll]);

  // Periodic refresh (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAll();
    }, CACHE_EXPIRY_MS);

    return () => clearInterval(interval);
  }, [refreshAll]);

  const value: DataContextType = {
    screens,
    playlists,
    schedules,
    isLoadingScreens,
    isLoadingPlaylists,
    isLoadingSchedules,
    refreshScreens,
    refreshPlaylists,
    refreshSchedules,
    refreshAll,
    updateScreen,
    updatePlaylist,
    updateSchedule,
    removeScreen,
    removePlaylist,
    removeSchedule,
    addScreen,
    addPlaylist,
    addSchedule,
    getScreen,
    getPlaylist,
    getSchedule,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

