import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, Product } from '../services/api';
import { useSavedItems } from '../context/SavedItemsContext';
import SubscriptionModal from '../components/SubscriptionModal';

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
  UNKNOWN: {
    background: '#FEF3C7',
    text: '#92400E',
    border: '#F59E0B',
  }
};

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { saveProduct, isSaved, canSaveMore } = useSavedItems();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSubscriptionModalVisible, setIsSubscriptionModalVisible] = useState(false);

  
  const productParam = (route.params as any)?.product as Product;
  const barcode = (route.params as any)?.barcode as string;
  const [product, setProduct] = useState<null | Product>(productParam)
  console.info('THE PRODUCT!', product, barcode)

  // If we have a barcode, we shold fetch the data.
  useEffect(() => {
    apiClient.scanProduct(barcode).then((result) => {
      if (result.data) {
        setProduct(result.data.product)
      }
    });
  }, [])

  const handleSaveProduct = async () => {
    if (!product) return;
    
    // Check if user can save more items
    if (!canSaveMore()) {
      // Show subscription modal instead of alert
      setIsSubscriptionModalVisible(true);
      return;
    }
    
    setIsSaving(true);
    try {
      const success = await saveProduct(product);
      if (success) {
        Alert.alert('Success', 'Product saved to your library');
      } else {
        Alert.alert('Error', 'Failed to save product');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to save product');
      console.error('Error saving product:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!product) {
    return (
      <View className="flex-1 bg-[#f3eee5]">
        <View className="flex-row items-center justify-between p-4 pt-12 bg-white">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-[#2d5f4f]">Product Details</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-xl font-bold text-[#2d5f4f] mt-4 text-center">
            Product Not Found
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-[#2d5f4f] rounded-2xl py-3 px-6 mt-6"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const safetyRating = (product.safety_rating?.toUpperCase() ?? 'UNKNOWN') as keyof typeof SAFETY_COLORS;
  const safetyColor = SAFETY_COLORS[safetyRating];
  const productIsSaved = isSaved(product.id);

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 pt-12 bg-white">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Analysis</Text>
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="share-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Risk Score Banner */}
        <View className="mx-4 mb-6">
          <View 
            className="rounded-2xl p-4 flex-row items-center justify-between"
            style={{ 
              backgroundColor: safetyRating === 'SAFE' ? '#D1E758' : safetyRating === 'CAUTION' ? '#FEF3C7' : '#FEE2E2'
            }}
          >
            <View className="flex-row items-center">
              <Ionicons 
                name={safetyRating === 'SAFE' ? "checkmark-circle" : "warning"} 
                size={24} 
                color={safetyRating === 'SAFE' ? "#181A2C" : safetyRating === 'CAUTION' ? "#92400E" : "#991B1B"} 
              />
              <Text 
                className="ml-2 font-bold text-lg"
                style={{ 
                  color: safetyRating === 'SAFE' ? "#181A2C" : safetyRating === 'CAUTION' ? "#92400E" : "#991B1B"
                }}
              >
                {safetyRating === 'SAFE' ? 'LOW RISK' : safetyRating === 'CAUTION' ? 'MODERATE RISK' : 'HIGH RISK'}
              </Text>
            </View>
            <Text 
              className="text-2xl font-bold"
              style={{ 
                color: safetyRating === 'SAFE' ? "#181A2C" : safetyRating === 'CAUTION' ? "#92400E" : "#991B1B"
              }}
            >
              {safetyRating === 'SAFE' ? '25/100' : safetyRating === 'CAUTION' ? '78/100' : '95/100'}
            </Text>
          </View>
        </View>

        {/* Product Info Card */}
        <View className="bg-white mx-4 rounded-2xl p-6 mb-4 border border-gray-100" style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
        }}>
          <View className="flex-row items-start">
            {/* Product Image */}
            <View className="w-20 h-20 rounded-xl bg-gray-100 mr-4 overflow-hidden">
              {product.images && product.images.length > 0 && product.images[0] ? (
                <Image 
                  source={{ uri: product.images[0] }}
                  className="w-full h-full"
                  resizeMode="cover"
                  defaultSource={require('../assets/icon.png')}
                  onError={() => {
                    // Handle image load error silently
                  }}
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                </View>
              )}
            </View>
            
            {/* Product Details */}
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">{product.name}</Text>
              <Text className="text-gray-600 mb-3">{product.brands}</Text>
              
              {/* Tags */}
              <View className="flex-row flex-wrap">
                <View className="bg-green-100 rounded-full px-3 py-1 mr-2 mb-2">
                  <Text className="text-green-800 text-xs font-semibold">Vegetarian</Text>
                </View>
                {safetyRating === 'CAUTION' && (
                  <View className="bg-red-100 rounded-full px-3 py-1 mr-2 mb-2">
                    <Text className="text-red-800 text-xs font-semibold">High FODMAP</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Ingredients List */}
        {product.ingredients && (
          <View className="mx-4 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">INGREDIENTS LIST</Text>
              <Text className="text-sm text-gray-500">15 items</Text>
            </View>
            
            <Text className="text-gray-700 text-base leading-6">
              {/* Parse ingredients and highlight problematic ones */}
              {product.ingredients.split(',').map((ingredient, index) => {
                const trimmed = ingredient.trim();
                const isProblematic = ['honey', 'wheat flour', 'soy lecithin'].some(problem => 
                  trimmed.toLowerCase().includes(problem.toLowerCase())
                );
                
                return (
                  <Text key={index}>
                    {index > 0 && ', '}
                    <Text 
                      className={isProblematic ? 'text-red-600 underline' : 'text-gray-700'}
                      style={isProblematic ? { textDecorationLine: 'underline' } : {}}
                    >
                      {trimmed}
                    </Text>
                  </Text>
                );
              })}
            </Text>

            {/* Legend */}
            <View className="flex-row items-center mt-4 space-x-6">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                <Text className="text-sm text-gray-600">Avoid</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
                <Text className="text-sm text-gray-600">Caution</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-gray-300 mr-2" />
                <Text className="text-sm text-gray-600">Safe</Text>
              </View>
            </View>
            
            <Text className="text-sm text-gray-500 mt-2">
              Tap on underlined ingredients for detailed health impact information.
            </Text>
          </View>
        )}

        {/* Action Button */}
        <View className="px-4 pb-8">
          <TouchableOpacity 
            className="rounded-2xl py-4 items-center mb-3"
            style={{ 
              backgroundColor: productIsSaved ? '#9CA3AF' : '#181A2C',
              opacity: isSaving ? 0.6 : 1 
            }}
            onPress={handleSaveProduct}
            disabled={isSaving || productIsSaved}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold text-lg">
                {productIsSaved ? 'Saved to Library' : 'Save to Library'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="bg-white border-t border-gray-100 mx-4 mb-4 rounded-t-3xl" style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}>
        <View className="flex-row items-center justify-around py-4 px-6">
          <TouchableOpacity 
            className="items-center flex-1"
            onPress={() => (navigation as any).navigate('Overview')}
          >
            <Ionicons name="home-outline" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity className="items-center flex-1">
            <Ionicons name="time-outline" size={24} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity className="items-center flex-1">
            <View className="w-12 h-12 bg-[#D1E758] rounded-full items-center justify-center -mt-6">
              <Ionicons name="barcode-outline" size={24} color="#181A2C" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity className="items-center flex-1">
            <Ionicons name="heart" size={24} color="#3B82F6" />
          </TouchableOpacity>
          
          <TouchableOpacity className="items-center flex-1">
            <Ionicons name="person-outline" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Subscription Modal */}
      <SubscriptionModal
        visible={isSubscriptionModalVisible}
        onClose={() => setIsSubscriptionModalVisible(false)}
        trigger="saved_limit"
      />
    </View>
  );
}