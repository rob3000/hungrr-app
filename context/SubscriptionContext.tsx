import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, STORAGE_KEYS } from '../services/storage';
import { apiClient, SubscriptionPlan } from '../services/api';


export interface SubscriptionStorage {
  isPro: boolean;
  plan: SubscriptionPlan | null;
  status: 'active' | 'cancelled' | 'expired' | 'none';
  expiresAt: string | null;
  lastVerifiedAt: string;
}

export interface UserSubscriptionResponse {
  isPro: boolean;
  plan: SubscriptionPlan | null;
  status: 'active' | 'cancelled' | 'expired' | 'none';
  expiresAt?: string;
  scansToday: number;
  savedItemsCount: number;
}

interface SubscriptionContextType {
  isPro: boolean;
  subscriptionPlan: SubscriptionPlan | null;
  subscriptionStatus: 'active' | 'cancelled' | 'expired' | 'none';
  expiresAt: string | null;
  scansRemaining: number;
  savedItemsLimit: number;
  availablePlans: SubscriptionPlan[];
  plansLoading: boolean;
  plansError: string | null;
  isLoading: boolean;
  loadSubscription: () => Promise<void>;
  updateSubscription: (plan: SubscriptionPlan) => Promise<void>;
  decrementScans: () => void;
  resetScans: () => void;
  retryLoadPlans: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

const FREE_USER_SCAN_LIMIT = 30;
const FREE_USER_SAVED_ITEMS_LIMIT = 20;

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [isPro, setIsPro] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    'active' | 'cancelled' | 'expired' | 'none'
  >('none');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [scansRemaining, setScansRemaining] = useState(FREE_USER_SCAN_LIMIT);
  const [isLoading, setIsLoading] = useState(true);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
    loadPlans();
  }, []);

  const loadSubscription = async () => {
    try {
      // Load from local storage first for immediate UI update
      const storedData = await storage.getItem<SubscriptionStorage>(
        STORAGE_KEYS.SUBSCRIPTION_DATA
      );

      if (storedData) {
        setIsPro(storedData.isPro);
        setSubscriptionPlan(storedData.plan);
        setSubscriptionStatus(storedData.status);
        setExpiresAt(storedData.expiresAt);

        // Check if subscription has expired
        if (storedData.expiresAt) {
          const expiryDate = new Date(storedData.expiresAt);
          const now = new Date();
          if (now > expiryDate && storedData.status === 'active') {
            // Subscription expired, downgrade to free
            await updateToFreeUser();
          }
        }
      }

      // Fetch fresh subscription status from API
      await syncSubscriptionWithAPI();
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncSubscriptionWithAPI = async () => {
    try {
      // Call API endpoint to get user subscription status
      const response = await apiClient.getSubscriptionStatus();

      if (response.success && response.data) {
        const apiData = response.data;

        // Check if subscription has expired
        let finalStatus = apiData.status;
        let finalIsPro = apiData.isPro;

        if (apiData.expiresAt) {
          const expiryDate = new Date(apiData.expiresAt);
          const now = new Date();
          
          if (now > expiryDate && apiData.status === 'active') {
            // Subscription expired, downgrade to free
            finalStatus = 'expired';
            finalIsPro = false;
          }
        }

        // Update state
        setIsPro(finalIsPro);
        setSubscriptionPlan(apiData.plan);
        setSubscriptionStatus(finalStatus);
        setExpiresAt(apiData.expiresAt || null);

        // Update scans remaining for free users
        if (!finalIsPro) {
          const scansUsed = apiData.scansToday || 0;
          const remaining = Math.max(0, FREE_USER_SCAN_LIMIT - scansUsed);
          setScansRemaining(remaining);
        }

        // Persist to AsyncStorage for offline access
        const subscriptionData: SubscriptionStorage = {
          isPro: finalIsPro,
          plan: apiData.plan,
          status: finalStatus,
          expiresAt: apiData.expiresAt || null,
          lastVerifiedAt: new Date().toISOString(),
        };

        await storage.setItem(STORAGE_KEYS.SUBSCRIPTION_DATA, subscriptionData);
      } else {
        console.warn('Failed to fetch subscription status from API:', response.error);
        // Continue with cached data if API fails
      }
    } catch (error) {
      console.error('Error syncing subscription with API:', error);
      // Continue with cached data if API fails
    }
  };

  const loadPlans = async (retryCount = 0): Promise<void> => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    try {
      setPlansLoading(true);
      setPlansError(null);

      const response = await apiClient.getSubscriptionPlans();

      if (response.success && response.data) {
        setAvailablePlans(response.data.plans);
        setPlansError(null);
      } else {
        // API returned an error
        const errorMessage = response.error?.message || 'Failed to load subscription plans';
        
        // Retry if retryable and under max retries
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying to load plans (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
          return loadPlans(retryCount + 1);
        } else {
          setPlansError(errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Retry on exception if under max retries
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying to load plans after error (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return loadPlans(retryCount + 1);
      } else {
        setPlansError(errorMessage);
        console.error('Error loading subscription plans:', error);
      }
    } finally {
      setPlansLoading(false);
    }
  };

  const retryLoadPlans = async (): Promise<void> => {
    return loadPlans(0);
  };

  const updateSubscription = async (plan: SubscriptionPlan) => {
    try {
      const subscriptionData: SubscriptionStorage = {
        isPro: true,
        plan,
        status: 'active',
        expiresAt: null, // Will be set by payment processor
        lastVerifiedAt: new Date().toISOString(),
      };

      setIsPro(true);
      setSubscriptionPlan(plan);
      setSubscriptionStatus('active');

      // Persist to storage
      await storage.setItem(STORAGE_KEYS.SUBSCRIPTION_DATA, subscriptionData);
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  };

  const updateToFreeUser = async () => {
    try {
      const subscriptionData: SubscriptionStorage = {
        isPro: false,
        plan: null,
        status: 'expired',
        expiresAt: null,
        lastVerifiedAt: new Date().toISOString(),
      };

      setIsPro(false);
      setSubscriptionPlan(null);
      setSubscriptionStatus('expired');

      await storage.setItem(STORAGE_KEYS.SUBSCRIPTION_DATA, subscriptionData);
    } catch (error) {
      console.error('Error updating to free user:', error);
      throw error;
    }
  };

  const decrementScans = () => {
    if (!isPro && scansRemaining > 0) {
      setScansRemaining((prev) => prev - 1);
    }
  };

  const resetScans = () => {
    if (!isPro) {
      setScansRemaining(FREE_USER_SCAN_LIMIT);
    }
  };

  const savedItemsLimit = isPro ? Infinity : FREE_USER_SAVED_ITEMS_LIMIT;

  return (
    <SubscriptionContext.Provider
      value={{
        isPro,
        subscriptionPlan,
        subscriptionStatus,
        expiresAt,
        scansRemaining,
        savedItemsLimit,
        availablePlans,
        plansLoading,
        plansError,
        isLoading,
        loadSubscription,
        updateSubscription,
        decrementScans,
        resetScans,
        retryLoadPlans,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
