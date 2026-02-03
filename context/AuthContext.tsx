import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../services/api';
import { storage, STORAGE_KEYS } from '../services/storage';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  profileImage?: string;
  createdAt: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserProfile | null;
  token: string | null;
  darkMode: boolean;
  isLoading: boolean;
  login: (token: string, user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<UserProfile>) => Promise<void>;
  toggleDarkMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from storage on mount
  useEffect(() => {
    loadSession();
    loadDarkModePreference();
  }, []);

  const loadDarkModePreference = async () => {
    try {
      const preferences = await storage.getItem<{ darkMode: boolean }>(
        STORAGE_KEYS.USER_PREFERENCES
      );
      if (preferences && preferences.darkMode !== undefined) {
        setDarkMode(preferences.darkMode);
      }
    } catch (error) {
      console.error('Error loading dark mode preference:', error);
    }
  };

  const loadSession = async () => {
    try {
      const storedToken = await storage.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
      const storedUser = await storage.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setIsLoggedIn(true);
        apiClient.setToken(storedToken);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newToken: string, newUser: UserProfile) => {
    try {
      // Store in state
      setToken(newToken);
      setUser(newUser);
      setIsLoggedIn(true);

      // Store in AsyncStorage
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
      await storage.setItem(STORAGE_KEYS.USER_PROFILE, newUser);

      // Set token in API client
      apiClient.setToken(newToken);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear state
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);

      // Clear AsyncStorage
      await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await storage.removeItem(STORAGE_KEYS.USER_PROFILE);

      // Clear token from API client
      apiClient.setToken(null);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const updateUser = async (updatedFields: Partial<UserProfile>) => {
    try {
      if (!user) {
        throw new Error('No user to update');
      }

      const updatedUser = { ...user, ...updatedFields };
      setUser(updatedUser);

      // Persist to storage
      await storage.setItem(STORAGE_KEYS.USER_PROFILE, updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Persist dark mode preference
    try {
      const currentPreferences = await storage.getItem<any>(STORAGE_KEYS.USER_PREFERENCES) || {};
      await storage.setItem(STORAGE_KEYS.USER_PREFERENCES, {
        ...currentPreferences,
        darkMode: newDarkMode,
      });
    } catch (error) {
      console.error('Error persisting dark mode:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, token, darkMode, isLoading, login, logout, updateUser, toggleDarkMode }}
    >
      {children}
    </AuthContext.Provider>
  );
};