import { useNavigation } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useState, useEffect } from 'react';
import ScanLimiterService from '../services/scan-limiter';
import { apiClient, Product } from '../services/api';
import { NavigationBar } from 'components/NavigationBar';
import { Header } from 'components/Header';

interface DashboardDataResponse {
  recentScans: Product[];
  scansToday: number;
  savedItemsCount: number;
  isPro: boolean;
}

export default function Overview() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const [scansRemaining, setScansRemaining] = useState<number>(10);
  const [recentScans, setRecentScans] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    <View className="flex-1 bg-white">
      {isLoading ? (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#181A2C" />
          <Text className="text-gray-700 mt-4">Loading dashboard...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          {/* Header */}
          <View className="px-6 pt-12 pb-6">
            {/* Logo and notification */}
            <Header />

            {/* Main heading */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-black mb-2">What are you</Text>
              <Text className="text-3xl font-bold text-gray-400">eating today?</Text>
            </View>

            {/* Search Bar */}
            <TouchableOpacity 
              className="bg-gray-100 rounded-2xl px-4 py-4 flex-row items-center mb-6"
              onPress={() => (navigation as any).navigate('Search')}
            >
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <Text className="ml-3 text-gray-400 text-base">Searching ingredients (e.g. garlic, onion)</Text>
            </TouchableOpacity>
          </View>

          {/* Scan Label Card */}
          <View className="mx-6 mb-8">
            <View className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-3xl p-8 items-center" style={{
              backgroundColor: '#181A2C',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <TouchableOpacity 
                className="w-20 h-20 bg-[#D1E758] rounded-full items-center justify-center mb-6"
                onPress={() => navigation.navigate('Camera')}
              >
                <Ionicons name="barcode-outline" size={32} color="#181A2C" />
              </TouchableOpacity>
              
              <Text className="text-white text-xl font-bold mb-3">Scan Label</Text>
              <Text className="text-gray-300 text-center text-sm leading-5">
                Point your camera at{'\n'}ingredients to check{'\n'}compatibility.
              </Text>
            </View>
          </View>

          {/* Recent Scans */}
          {recentScans.length > 0 && (
            <View className="mx-6 mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-black">Recent Scans</Text>
                <TouchableOpacity onPress={() => (navigation as any).navigate('SavedItems')}>
                  <Text className="text-sm font-semibold text-blue-600">VIEW ALL</Text>
                </TouchableOpacity>
              </View>
              
              {recentScans.slice(0, 3).map((product) => {
                const safetyRating = (product.safety_rating?.toUpperCase() ?? 'UNKNOWN') as 'SAFE' | 'CAUTION' | 'AVOID';
                const safetyColors = getSafetyLevelColor(safetyRating);
                return (
                  <TouchableOpacity
                    key={product.id}
                    className="bg-white rounded-2xl p-4 mb-3 flex-row items-center border border-gray-100"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                    onPress={() => (navigation as any).navigate('ProductDetail', { barcode: product.barcode })}
                  >
                    <View className="w-12 h-12 rounded-xl bg-gray-100 mr-4 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          source={{ uri: product.images[0] }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-full h-full items-center justify-center">
                          <Ionicons name="image-outline" size={20} color="#9CA3AF" />
                        </View>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-black font-semibold mb-1">{product.name}</Text>
                      <Text className="text-gray-500 text-sm">Scanned 2m ago</Text>
                    </View>
                    <View className={`px-3 py-1.5 rounded-full flex-row items-center ${safetyColors.bg}`}>
                      <View className={`w-2 h-2 rounded-full ${safetyRating === 'SAFE' ? 'bg-green-500' : safetyRating === 'CAUTION' ? 'bg-yellow-500' : 'bg-red-500'} mr-1.5`} />
                      <Text className={`text-xs font-bold ${safetyColors.text}`}>
                        {safetyRating === 'SAFE' ? 'Safe' : safetyRating === 'CAUTION' ? 'Risky' : 'Avoid'}
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
      <NavigationBar />
    </View>
  );
}
