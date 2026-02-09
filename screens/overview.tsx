import { useNavigation } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useState, useEffect } from 'react';
import ScanLimiterService from '../services/scan-limiter';
import { apiClient, Product } from '../services/api';

interface DashboardDataResponse {
  recentScans: Product[];
  scansToday: number;
  savedItemsCount: number;
  isPro: boolean;
}

export default function Overview() {
  const navigation = useNavigation();
  const { isPro } = useSubscription();
  const [scansRemaining, setScansRemaining] = useState<number>(10);
  const [recentScans, setRecentScans] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleProfilePress = () => {
    (navigation as any).navigate('Settings');
  };

  // Fetch dashboard data from API
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch dashboard data from API
        const response = await apiClient.getDashboard();

        if (response.success && response.data) {
          const { recent_scans: apiRecentScans, scans_today: scansToday, is_pro: apiIsPro } = response.data;
          console.log(response.data)
          // Update recent scans
          setRecentScans(apiRecentScans);

          // Update scans remaining for free users
          if (!apiIsPro) {
            const dailyLimit = ScanLimiterService.getDailyLimit();
            const remaining = Math.max(0, dailyLimit - scansToday);
            setScansRemaining(remaining);
          }
        } else {
          // API error - fall back to local data
          console.warn('Failed to fetch dashboard data:', response.error);
          setError(response.error?.message || 'Failed to load dashboard data');
          
          // Load scans remaining from local storage as fallback
          if (!isPro) {
            const remaining = await ScanLimiterService.getScansRemaining();
            setScansRemaining(remaining);
          }
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('An unexpected error occurred');
        
        // Load scans remaining from local storage as fallback
        if (!isPro) {
          const remaining = await ScanLimiterService.getScansRemaining();
          setScansRemaining(remaining);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [isPro]);

  const getSafetyLevelColor = (level: 'SAFE' | 'CAUTION' | 'AVOID') => {
    switch (level) {
      case 'SAFE':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' };
      case 'CAUTION':
        return { bg: 'bg-yellow-100', text: 'text-yellow-900', border: 'border-yellow-500' };
      case 'AVOID':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500' };
    }
  };

  return (
    <View className="flex-1 bg-[#f3eee5]">
      {isLoading ? (
        <View className="flex-1 items-center justify-center bg-[#f3eee5]">
          <ActivityIndicator size="large" color="#2d5f4f" />
          <Text className="text-gray-600 mt-4">Loading dashboard...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
        {/* Header - removed duplicate since navigation has header */}
        <View className="px-6 pt-6 pb-4">

          {/* Subscription Status Badge */}
          <View className="flex-row items-center mb-4">
            <View className={`px-3 py-1.5 rounded-full ${isPro ? 'bg-[#2d5f4f]' : 'bg-gray-300'}`}>
              <Text className={`text-xs font-bold ${isPro ? 'text-white' : 'text-gray-700'}`}>
                {isPro ? '✨ PRO' : 'FREE'}
              </Text>
            </View>
            {!isPro && (
              <View className="ml-3 flex-row items-center">
                <Ionicons name="scan" size={14} color="#6B7280" />
                <Text className="text-xs text-gray-600 ml-1 font-medium">
                  {scansRemaining} scans left today
                </Text>
              </View>
            )}
          </View>

          {/* Search Bar */}
          <TouchableOpacity 
            className="bg-white rounded-2xl px-4 py-3 flex-row items-center"
            onPress={() => (navigation as any).navigate('SavedItems')}
          >
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <Text className="ml-3 text-gray-400">Search foods or brands...</Text>
          </TouchableOpacity>
        </View>

        {/* Check Your Food Card */}
        <View className="mx-6 mb-6">
          <View className="bg-white rounded-3xl p-8 items-center">
            <Text className="text-xl font-bold text-[#2d5f4f] mb-2">Check Your Food</Text>
            <Text className="text-gray-600 text-center mb-8">
              Scan any grocery barcode for an{'\n'}instant IBS safety analysis.
            </Text>
            
            <TouchableOpacity 
              className="w-40 h-40 bg-[#2d5f4f] rounded-full items-center justify-center shadow-lg"
              onPress={() => navigation.navigate('Camera')}
            >
              <Ionicons name="barcode-outline" size={60} color="white" />
              <Text className="text-white font-bold mt-2 tracking-wider">SCAN</Text>
              <Text className="text-white font-bold tracking-wider">BARCODE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Browse Safe Foods */}
        <View className="mx-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-[#2d5f4f]">Browse Safe Foods</Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('SavedItems')}>
              <Text className="text-sm font-semibold text-[#2d5f4f]">SEE ALL</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="bg-white rounded-2xl p-6 items-center flex-1 mr-3"
              onPress={() => (navigation as any).navigate('SavedItems')}
            >
              <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl">🥨</Text>
              </View>
              <Text className="text-xs font-semibold text-gray-700">SNACKS</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-2xl p-6 items-center flex-1 mr-3"
              onPress={() => (navigation as any).navigate('SavedItems')}
            >
              <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl">🥫</Text>
              </View>
              <Text className="text-xs font-semibold text-gray-700">PANTRY</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-2xl p-6 items-center flex-1"
              onPress={() => (navigation as any).navigate('SavedItems')}
            >
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                <Text className="text-2xl">🥤</Text>
              </View>
              <Text className="text-xs font-semibold text-gray-700">DRINKS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recently Scanned */}
        {recentScans.length > 0 && (
          <View className="mx-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-[#2d5f4f]">Recently Scanned</Text>
              <TouchableOpacity onPress={() => (navigation as any).navigate('SavedItems')}>
                <Text className="text-sm font-semibold text-[#2d5f4f]">SEE ALL</Text>
              </TouchableOpacity>
            </View>
            
            {recentScans.slice(0, 3).map((product) => {
              const safetyRating = (product.safety_rating?.toUpperCase() ?? 'UNKNOWN') as 'SAFE' | 'CAUTION' | 'AVOID';
              const safetyColors = getSafetyLevelColor(safetyRating);
              return (
                <TouchableOpacity
                  key={product.id}
                  className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
                  onPress={() => (navigation as any).navigate('ProductDetail', { barcode: product.barcode })}
                >
                  <View className="w-12 h-12 rounded-full bg-gray-100 mr-4 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        source={{ uri: product.images[0] }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <Ionicons name="image-outline" size={24} color="#9CA3AF" />
                      </View>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold mb-1">{product.name}</Text>
                    <Text className="text-gray-500 text-xs">{product.brands}</Text>
                  </View>
                  <View className={`px-3 py-1.5 rounded-full ${safetyColors.bg}`}>
                    <Text className={`text-xs font-bold ${safetyColors.text}`}>
                      {safetyRating}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Error State - Show fallback data */}
        {error && !isLoading && recentScans.length === 0 && (
          <View className="mx-6 mb-6">
            <View className="bg-yellow-50 rounded-2xl p-4 flex-row items-start">
              <Ionicons name="alert-circle" size={24} color="#F59E0B" />
              <View className="ml-3 flex-1">
                <Text className="text-yellow-800 font-semibold mb-1">Using Offline Mode</Text>
                <Text className="text-yellow-700 text-sm">
                  We couldn't load your latest data. You can still scan products and they'll sync when you're back online.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Bottom spacing for navigation */}
        <View className="h-24" />
      </ScrollView>
      )}

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <View className="flex-row items-center justify-around py-3 px-6">
          <TouchableOpacity className="items-center flex-1">
            <Ionicons name="home" size={24} color="#2d5f4f" />
            <Text className="text-[#2d5f4f] text-xs mt-1 font-medium">HOME</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="items-center flex-1"
            onPress={() => (navigation as any).navigate('SavedItems')}
          >
            <Ionicons name="bookmark-outline" size={24} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs mt-1">SAVED</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="items-center flex-1"
            onPress={() => navigation.navigate('Camera')}
          >
            <View className="w-12 h-12 bg-[#2d5f4f] rounded-full items-center justify-center -mt-6">
              <Ionicons name="scan" size={28} color="white" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="items-center flex-1"
            onPress={() => (navigation as any).navigate('SavedItems')}
          >
            <Ionicons name="compass-outline" size={24} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs mt-1">EXPLORE</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="items-center flex-1"
            onPress={handleProfilePress}
          >
            <Ionicons name="person-outline" size={24} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs mt-1">PROFILE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
