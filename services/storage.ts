/**
 * Storage Service
 * Wrapper around AsyncStorage for persistent data storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PROFILE: 'user_profile',
  SUBSCRIPTION_DATA: 'subscription_data',
  SAVED_PRODUCTS: 'saved_products',
  SCAN_LIMIT_DATA: 'scan_limit_data',
  USER_PREFERENCES: 'user_preferences',
  PRO_ONBOARDING_COMPLETE: 'pro_onboarding_complete',
  WELCOME_SCREEN_SEEN: 'welcome_screen_seen',
} as const;

class StorageService {
  
  /**
   * Store a value in AsyncStorage
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing item with key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve a value from AsyncStorage
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving item with key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove a value from AsyncStorage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item with key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all data from AsyncStorage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      throw error;
    }
  }

  /**
   * Get all keys from AsyncStorage
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  /**
   * Store multiple items at once
   */
  async multiSet(keyValuePairs: Array<[string, any]>): Promise<void> {
    try {
      const stringifiedPairs = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(stringifiedPairs as [string, string][]);
    } catch (error) {
      console.error('Error storing multiple items:', error);
      throw error;
    }
  }

  /**
   * Retrieve multiple items at once
   */
  async multiGet<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, T | null> = {};

      pairs.forEach(([key, value]) => {
        result[key] = value != null ? JSON.parse(value) : null;
      });

      return result;
    } catch (error) {
      console.error('Error retrieving multiple items:', error);
      return {};
    }
  }
}

// Export singleton instance
export const storage = new StorageService();
