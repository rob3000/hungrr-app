import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, STORAGE_KEYS } from '../services/storage';
import { useSubscription } from './SubscriptionContext';
import { apiClient, Product } from '../services/api';
import NetInfo from '@react-native-community/netinfo';

// Re-export types from API service for convenience
export type { Product };

export interface SavedProduct {
  id: number;
  product: Product;
  savedAt: string;
}

interface SavedProductsStorage {
  products: SavedProduct[];
  lastSyncedAt: string;
}

interface SavedItemsContextType {
  savedItems: SavedProduct[];
  saveProduct: (product: Product) => Promise<boolean>;
  removeProduct: (productId: number) => Promise<void>;
  isSaved: (productId: number) => boolean;
  canSaveMore: () => boolean;
  isLoading: boolean;
  syncWithAPI: () => Promise<void>;
}

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(undefined);

export const useSavedItems = () => {
  const context = useContext(SavedItemsContext);
  if (!context) {
    throw new Error('useSavedItems must be used within a SavedItemsProvider');
  }
  return context;
};

interface SavedItemsProviderProps {
  children: ReactNode;
}

export const SavedItemsProvider: React.FC<SavedItemsProviderProps> = ({ children }) => {
  const [savedItems, setSavedItems] = useState<SavedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { savedItemsLimit } = useSubscription();

  useEffect(() => {
    loadSavedItems();
  }, []);

  // Listen for network state changes and sync when coming online
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      // When connection is restored and we have items, sync with API
      if (state.isConnected && !isLoading && savedItems.length > 0) {
        syncWithAPI().catch(error => {
          console.warn('Auto-sync failed:', error);
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isLoading, savedItems]);

  const loadSavedItems = async () => {
    try {
      const storedData = await storage.getItem<SavedProductsStorage>(STORAGE_KEYS.SAVED_PRODUCTS);

      if (storedData && storedData.products) {
        setSavedItems(storedData.products);
      }
    } catch (error) {
      console.error('Error loading saved items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithAPI = async () => {
    if (isSyncing) {
      return; // Prevent concurrent syncs
    }

    try {
      setIsSyncing(true);

      // Send saved items to API
      const response = await apiClient.syncSavedItems(
        savedItems.map(item => ({
          productId: item.product.id.toString(),
          savedAt: item.savedAt,
        }))
      );

      if (response.success) {
        // Update last synced timestamp
        const storageData: SavedProductsStorage = {
          products: savedItems,
          lastSyncedAt: new Date().toISOString(),
        };
        await storage.setItem(STORAGE_KEYS.SAVED_PRODUCTS, storageData);
        console.log('Saved items synced successfully');
      } else {
        console.warn('Failed to sync saved items:', response.error);
      }
    } catch (error) {
      console.warn('Error syncing with API:', error);
      // Don't throw - sync failures shouldn't break the app
    } finally {
      setIsSyncing(false);
    }
  };

  const saveProduct = async (product: Product): Promise<boolean> => {
    try {
      // Check if already saved
      if (isSaved(product.id)) {
        return true;
      }

      // Check if user can save more items
      if (!canSaveMore()) {
        return false;
      }

      const savedProduct: SavedProduct = {
        id: product.id,
        product,
        savedAt: new Date().toISOString(),
      };

      const updatedItems = [...savedItems, savedProduct];
      setSavedItems(updatedItems);

      // Persist to storage
      const storageData: SavedProductsStorage = {
        products: updatedItems,
        lastSyncedAt: new Date().toISOString(),
      };
      await storage.setItem(STORAGE_KEYS.SAVED_PRODUCTS, storageData);

      // Sync with API in background (don't wait for it)
      syncWithAPI().catch(error => {
        console.warn('Background sync failed:', error);
        // Silently fail - user can still use the app offline
      });

      return true;
    } catch (error) {
      console.error('Error saving product:', error);
      return false;
    }
  };

  const removeProduct = async (productId: number) => {
    try {
      const updatedItems = savedItems.filter((item) => item.id !== productId);
      setSavedItems(updatedItems);

      // Persist to storage
      const storageData: SavedProductsStorage = {
        products: updatedItems,
        lastSyncedAt: new Date().toISOString(),
      };
      await storage.setItem(STORAGE_KEYS.SAVED_PRODUCTS, storageData);

      // Sync with API in background (don't wait for it)
      syncWithAPI().catch(error => {
        console.warn('Background sync failed:', error);
        // Silently fail - user can still use the app offline
      });
    } catch (error) {
      console.error('Error removing product:', error);
      throw error;
    }
  };

  const isSaved = (productId: number): boolean => {
    return savedItems.some((item) => item.id === productId);
  };

  const canSaveMore = (): boolean => {
    return savedItems.length < savedItemsLimit;
  };

  return (
    <SavedItemsContext.Provider
      value={{
        savedItems,
        saveProduct,
        removeProduct,
        isSaved,
        canSaveMore,
        isLoading,
        syncWithAPI,
      }}
    >
      {children}
    </SavedItemsContext.Provider>
  );
};
