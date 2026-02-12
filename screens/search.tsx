import { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { apiClient, Product } from '../services/api';
import { NavigationBar } from '../components/NavigationBar';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

interface PopularSearch {
  id: string;
  term: string;
  icon: string;
}

interface RecentItem {
  id: string;
  name: string;
  description: string;
  image?: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'vegetables',
    name: 'Vegetables',
    icon: 'leaf',
    description: 'Broccoli, Kale...',
    color: 'bg-green-200',
  },
  {
    id: 'fruits',
    name: 'Fruits',
    icon: 'water',
    description: 'Apples, Berries...',
    color: 'bg-blue-200',
  },
  {
    id: 'spices',
    name: 'Spices',
    icon: 'close',
    description: 'Basil, Pepper...',
    color: 'bg-orange-200',
  },
  {
    id: 'grains',
    name: 'Grains',
    icon: 'flower',
    description: 'Rice, Quinoa...',
    color: 'bg-purple-200',
  },
];

const POPULAR_SEARCHES: PopularSearch[] = [
  { id: '1', term: 'Garlic', icon: 'search' },
  { id: '2', term: 'Onion', icon: 'search' },
  { id: '3', term: 'Honey', icon: 'search' },
  { id: '4', term: 'Milk', icon: 'search' },
  { id: '5', term: 'Wheat', icon: 'search' },
];

export default function Search() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentItems] = useState<RecentItem[]>([
    {
      id: '1',
      name: 'Garlic Bread',
      description: 'High FODMAP',
      image: undefined,
    },
  ]);

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
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryPress = (category: Category) => {
    setSearchQuery(category.name.toLowerCase());
  };

  const handlePopularSearchPress = (term: string) => {
    setSearchQuery(term.toLowerCase());
  };

  const handleProductPress = (product: Product) => {
    (navigation as any).navigate('ProductDetail', { barcode: product.barcode });
  };

  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color="#181A2C" />
          <Text className="text-gray-600 mt-4">Searching...</Text>
        </View>
      );
    }

    if (hasSearched && searchResults.length === 0) {
      return (
        <View className="items-center justify-center py-12 px-6">
          <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="search" size={48} color="#9CA3AF" />
          </View>
          <Text className="text-gray-900 font-bold text-lg mb-2">No results found</Text>
          <Text className="text-gray-600 text-center">
            We couldn't find any products matching "{searchQuery}". Try a different search term.
          </Text>
        </View>
      );
    }

    if (searchResults.length > 0) {
      return (
        <View className="px-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Search Results</Text>
          {searchResults.map((product) => (
            <TouchableOpacity
              key={product.id}
              onPress={() => handleProductPress(product)}
              className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
            >
              {product.images && product.images.length > 0 ? (
                <Image
                  source={{ uri: product.images[0] }}
                  className="w-12 h-12 rounded-xl mr-3"
                />
              ) : (
                <View className="w-12 h-12 rounded-xl bg-gray-100 items-center justify-center mr-3">
                  <Ionicons name="image-outline" size={20} color="#9CA3AF" />
                </View>
              )}
              <View className="flex-1">
                <Text className="font-semibold text-gray-900" numberOfLines={1}>
                  {product.name}
                </Text>
                <Text className="text-sm text-gray-500" numberOfLines={1}>
                  {product.brands}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return null;
  };

  const renderDefaultContent = () => {
    if (hasSearched) return null;

    return (
      <>
        {/* Categories */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-4">Categories</Text>
          <View className="flex-row flex-wrap justify-between">
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryPress(category)}
                className={`w-[48%] ${category.color} rounded-2xl p-4 mb-4`}
              >
                <View className="w-10 h-10 items-center justify-center mb-2">
                  <Ionicons name={category.icon as any} size={24} color="#374151" />
                </View>
                <Text className="font-semibold text-gray-900 mb-1">{category.name}</Text>
                <Text className="text-sm text-gray-600">{category.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular Searches */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-4">Popular Searches</Text>
          <View className="flex-row flex-wrap">
            {POPULAR_SEARCHES.map((search) => (
              <TouchableOpacity
                key={search.id}
                onPress={() => handlePopularSearchPress(search.term)}
                className="bg-white rounded-full px-4 py-2 mr-3 mb-3 flex-row items-center"
              >
                <Ionicons name="search" size={16} color="#9CA3AF" />
                <Text className="text-gray-700 ml-2">{search.term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recently Viewed */}
        {recentItems.length > 0 && (
          <View className="px-6 mb-8">
            <Text className="text-lg font-bold text-gray-900 mb-4">Recently Viewed</Text>
            {recentItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
              >
                <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-3">
                  <Ionicons name="restaurant" size={20} color="#9CA3AF" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">{item.name}</Text>
                  <Text className="text-sm text-red-600">{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-6 px-6">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-2xl font-bold text-gray-900">Explore</Text>
          <TouchableOpacity>
            <Ionicons name="options-outline" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="bg-gray-50 rounded-2xl px-4 py-3.5 flex-row items-center">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-900"
            placeholder="Search for garlic, zucchini..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 pb-24">
        {renderSearchResults()}
        {renderDefaultContent()}
      </ScrollView>

      {/* Navigation Bar */}
      <NavigationBar />
    </View>
  );
}