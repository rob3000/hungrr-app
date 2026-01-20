import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSavedItems, SavedProduct } from '../context/SavedItemsContext';

// Safety level colors
const SAFETY_COLORS = {
  SAFE: {
    background: '#D1FAE5',
    text: '#065F46',
    border: '#10B981',
  },
  CAUTION: {
    background: '#FEF3C7',
    text: '#92400E',
    border: '#F59E0B',
  },
  AVOID: {
    background: '#FEE2E2',
    text: '#991B1B',
    border: '#EF4444',
  },
};

type FilterType = 'RECENTLY_ADDED' | 'SAFE' | 'CAUTION' | 'AVOID' | string;

interface FilterChip {
  id: FilterType;
  label: string;
}

const FILTER_CHIPS: FilterChip[] = [
  { id: 'RECENTLY_ADDED', label: 'Recently Added' },
  { id: 'SAFE', label: 'Safe' },
  { id: 'CAUTION', label: 'Caution' },
  { id: 'AVOID', label: 'Avoid' },
];

export default function SavedItemsScreen() {
  const navigation = useNavigation();
  const { savedItems, removeProduct, isLoading } = useSavedItems();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterType[]>([]);
  const [menuOpenForId, setMenuOpenForId] = useState<number | null>(null);

  // Filter and search logic
  const filteredItems = useMemo(() => {
    let items = [...savedItems];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.product.name.toLowerCase().includes(query) ||
          item.product.brands.toLowerCase().includes(query)
      );
    }

    // Apply safety level filters
    const safetyFilters = activeFilters.filter((f) =>
      ['SAFE', 'CAUTION', 'AVOID'].includes(f)
    );
    if (safetyFilters.length > 0) {
      items = items.filter((item) => {
        const safetyRating = item.product.safety_rating?.toUpperCase();
        return safetyFilters.includes(safetyRating);
      });
    }

    // Apply recently added filter (sort by date)
    if (activeFilters.includes('RECENTLY_ADDED')) {
      items.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    }

    return items;
  }, [savedItems, searchQuery, activeFilters]);

  const toggleFilter = (filterId: FilterType) => {
    setActiveFilters((prev) =>
      prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]
    );
  };

  const handleRemoveProduct = async (productId: number, productName: string) => {
    Alert.alert(
      'Remove Product',
      `Are you sure you want to remove "${productName}" from your saved items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeProduct(productId);
              setMenuOpenForId(null);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove product');
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = (barcode: string) => {
    setMenuOpenForId(null);
    (navigation as any).navigate('ProductDetail', { barcode });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#f3eee5] items-center justify-center">
        <ActivityIndicator size="large" color="#2D5F4F" />
        <Text className="text-gray-600 mt-4">Loading saved items...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f3eee5]">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Saved Items</Text>

        {/* Search Bar */}
        <View className="bg-gray-100 rounded-2xl px-4 py-3 flex-row items-center mb-4">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-900"
            placeholder="Search by name or brand..."
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

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeFilters.includes(chip.id);
            return (
              <TouchableOpacity
                key={chip.id}
                onPress={() => toggleFilter(chip.id)}
                className="rounded-full px-4 py-2 mr-2"
                style={{
                  backgroundColor: isActive ? '#2D5F4F' : '#F3F4F6',
                  borderWidth: 1,
                  borderColor: isActive ? '#2D5F4F' : '#E5E7EB',
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: isActive ? '#FFFFFF' : '#6B7280' }}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="bookmark-outline" size={64} color="#D1D5DB" />
          <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
            {savedItems.length === 0 ? 'No Saved Items' : 'No Results Found'}
          </Text>
          <Text className="text-gray-600 mt-2 text-center">
            {savedItems.length === 0
              ? 'Start scanning products and save them to your library'
              : 'Try adjusting your search or filters'}
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4">
          {filteredItems.map((item) => {
            const safetyRating = (item.product.safety_rating?.toUpperCase() ?? 'UNKNOWN') as keyof typeof SAFETY_COLORS;
            const safetyColor = SAFETY_COLORS[safetyRating];
            const isMenuOpen = menuOpenForId === item.id;

            return (
              <View key={item.id} className="bg-white rounded-2xl p-4 mb-3 relative">
                <TouchableOpacity
                  onPress={() => handleViewDetails(item.product.barcode)}
                  activeOpacity={0.7}
                >
                  <View className="flex-row">
                    {/* Product Image */}
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image
                        source={{ uri: item.product.images[0] }}
                        className="w-20 h-20 rounded-xl"
                      />
                    ) : (
                      <View className="w-20 h-20 rounded-xl bg-gray-200 items-center justify-center">
                        <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                      </View>
                    )}

                    {/* Product Info */}
                    <View className="flex-1 ml-4">
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-2">
                          <Text className="text-sm text-gray-500 mb-1">{item.product.brands}</Text>
                          <Text className="text-base font-semibold text-gray-900 mb-2" numberOfLines={2}>
                            {item.product.name}
                          </Text>
                        </View>

                        {/* Three-dot menu */}
                        <TouchableOpacity
                          onPress={() => setMenuOpenForId(isMenuOpen ? null : item.id)}
                          className="w-8 h-8 items-center justify-center"
                        >
                          <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
                        </TouchableOpacity>
                      </View>

                      {/* Safety Badge and Date */}
                      <View className="flex-row items-center justify-between">
                        <View
                          className="rounded-full px-3 py-1"
                          style={{
                            backgroundColor: safetyColor.background,
                            borderWidth: 1,
                            borderColor: safetyColor.border,
                          }}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{ color: safetyColor.text }}
                          >
                            {safetyRating}
                          </Text>
                        </View>

                        <Text className="text-xs text-gray-500">{formatDate(item.savedAt)}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <View className="absolute right-4 top-16 bg-white rounded-xl shadow-lg z-10 border border-gray-200">
                    <TouchableOpacity
                      onPress={() => handleViewDetails(item.product.barcode)}
                      className="flex-row items-center px-4 py-3 border-b border-gray-100"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="eye-outline" size={20} color="#374151" />
                      <Text className="text-gray-900 ml-3 font-medium">View Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleRemoveProduct(item.id, item.product.name)}
                      className="flex-row items-center px-4 py-3"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      <Text className="text-red-600 ml-3 font-medium">Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          {/* Bottom padding */}
          <View className="h-4" />
        </ScrollView>
      )}
    </View>
  );
}
