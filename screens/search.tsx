import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { apiClient, Product } from '../services/api';

export default function Search() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    try {
      setIsLoading(true);
      setHasSearched(true);
      
      const response = await apiClient.searchProducts(query, 0, 20);
      
      if (response.success && response.data) {
        setSearchResults(response.data.products || []);
        setTotalCount(response.data.total_count || 0);
      } else {
        setSearchResults([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const getSafetyLevelColor = (level: 'SAFE' | 'CAUTION' | 'AVOID') => {
    switch (level) {
      case 'SAFE':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'CAUTION':
        return { bg: 'bg-yellow-100', text: 'text-yellow-900' };
      case 'AVOID':
        return { bg: 'bg-red-100', text: 'text-red-800' };
    }
  };

  const popularSearches = [
    { icon: '🍌', name: 'Bananas', query: 'banana' },
    { icon: '🥒', name: 'Zucchini', query: 'zucchini' },
    { icon: '🥕', name: 'Carrots', query: 'carrot' },
    { icon: '🥔', name: 'Potatoes', query: 'potato' },
    { icon: '🍅', name: 'Tomatoes', query: 'tomato' },
    { icon: '🥬', name: 'Lettuce', query: 'lettuce' },
  ];

  return (
    <View className="flex-1 bg-[#f3eee5]">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 shadow-sm">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="#181A2C" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Search Foods</Text>
        </View>

        {/* Search Input */}
        <View className="bg-gray-100 rounded-2xl px-4 py-3 flex-row items-center">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="ml-3 flex-1 text-base text-gray-900"
            placeholder="Search foods or brands..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Popular Searches - Show when no search query */}
        {!hasSearched && searchQuery.length < 2 && (
          <View className="px-6 py-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">Popular Searches</Text>
            <View className="flex-row flex-wrap">
              {popularSearches.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="bg-white rounded-2xl px-4 py-3 mr-3 mb-3 flex-row items-center shadow-sm"
                  onPress={() => setSearchQuery(item.query)}
                >
                  <Text className="text-2xl mr-2">{item.icon}</Text>
                  <Text className="text-gray-900 font-medium">{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mt-6 bg-blue-50 rounded-2xl p-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={24} color="#3B82F6" />
                <View className="ml-3 flex-1">
                  <Text className="text-blue-900 font-semibold mb-1">Search Tips</Text>
                  <Text className="text-blue-800 text-sm">
                    Search for fresh produce like bananas, zucchini, or any food without a barcode. 
                    We'll show you FODMAP information to help you make safe choices.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color="#181A2C" />
            <Text className="text-gray-600 mt-4">Searching...</Text>
          </View>
        )}

        {/* Search Results */}
        {!isLoading && hasSearched && searchResults.length > 0 && (
          <View className="px-6 py-6">
            <Text className="text-sm text-gray-600 mb-4">
              Found {totalCount} result{totalCount !== 1 ? 's' : ''}
            </Text>
            {searchResults.map((product) => {
              const safetyRating = (product.safety_rating?.toUpperCase() ?? 'UNKNOWN') as 'SAFE' | 'CAUTION' | 'AVOID';
              const safetyColors = getSafetyLevelColor(safetyRating);
              
              return (
                <TouchableOpacity
                  key={product.id}
                  className="bg-white rounded-3xl p-4 mb-3 flex-row items-center shadow-sm"
                  onPress={() => (navigation as any).navigate('ProductDetail', { barcode: product.barcode })}
                >
                  <View className="w-16 h-16 rounded-2xl bg-gray-100 mr-4 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        source={{ uri: product.images[0] }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                      </View>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold mb-1" numberOfLines={2}>
                      {product.name}
                    </Text>
                    {product.brands && (
                      <Text className="text-gray-500 text-xs mb-2">{product.brands}</Text>
                    )}
                    <View className={`px-3 py-1.5 rounded-full flex-row items-center self-start ${safetyColors.bg}`}>
                      <View className={`w-2 h-2 rounded-full ${safetyRating === 'SAFE' ? 'bg-green-500' : safetyRating === 'CAUTION' ? 'bg-yellow-500' : 'bg-red-500'} mr-1.5`} />
                      <Text className={`text-xs font-bold ${safetyColors.text}`}>
                        {safetyRating}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* No Results */}
        {!isLoading && hasSearched && searchResults.length === 0 && searchQuery.length >= 2 && (
          <View className="items-center justify-center py-12 px-6">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="search" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-2">No results found</Text>
            <Text className="text-gray-600 text-center">
              We couldn't find any products matching "{searchQuery}". Try a different search term.
            </Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
