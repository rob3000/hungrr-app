import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../services/api';
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
  
  const product = (route.params as any)?.product as Product;
  console.info('THE PRODUCT!', product)
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
          <Text className="text-lg font-semibold text-gray-900">Product Details</Text>
          <View className="w-10" />
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
            Product Not Found
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-green-700 rounded-2xl py-3 px-6 mt-6"
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
    <View className="flex-1 bg-[#f3eee5]">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white">
          <View className="flex-row items-center justify-between p-4 pt-12">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">Product Details</Text>
            <TouchableOpacity 
              onPress={handleSaveProduct}
              disabled={isSaving || productIsSaved}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <Ionicons 
                name={productIsSaved ? "heart" : "heart-outline"} 
                size={24} 
                color={productIsSaved ? "#EF4444" : "#374151"} 
              />
            </TouchableOpacity>
          </View>

          {/* Product Image */}
          <View className="items-center pb-6">
            {product.images && product.images.length > 0 && product.images[0] ? (
              <Image 
                source={{ uri: product.images[0] }}
                className="w-48 h-48 rounded-2xl"
                defaultSource={require('../assets/icon.png')}
                onError={() => {
                  // Handle image load error silently
                }}
              />
            ) : (
              <View className="w-48 h-48 rounded-2xl bg-gray-200 items-center justify-center">
                <Ionicons name="image-outline" size={64} color="#9CA3AF" />
                <Text className="text-gray-500 text-xs mt-2">No image</Text>
              </View>
            )}
          </View>
        </View>

        {/* Product Info with Safety Badge */}
        <View className="bg-white mx-4 rounded-2xl p-6 mb-4">
          {/* Safety Level Badge */}
          <View 
            className="rounded-full px-4 py-2 mb-3 self-start"
            style={{ 
              backgroundColor: safetyColor.background,
              borderWidth: 1,
              borderColor: safetyColor.border 
            }}
          >
            <Text 
              className="text-sm font-bold"
              style={{ color: safetyColor.text }}
            >
              {safetyRating}
            </Text>
          </View>
          
          <Text className="text-2xl font-bold text-gray-900 mb-1">{product.name}</Text>
          <Text className="text-lg text-gray-600 mb-2">{product.brands}</Text>
          <Text className="text-sm text-gray-500">Barcode: {product.barcode}</Text>
        </View>

        {/* Categories */}
        {product.categories && (
          <View className="bg-white mx-4 rounded-2xl p-6 mb-4">
            <Text className="text-xl font-bold text-gray-900 mb-2">Categories</Text>
            <Text className="text-base text-gray-700">{product.categories}</Text>
          </View>
        )}

        {/* Ingredients */}
        {product.ingredients && (
          <View className="bg-white mx-4 rounded-2xl p-6 mb-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Ingredients</Text>
            <Text className="text-sm text-gray-700 leading-6">{product.ingredients}</Text>
          </View>
        )}

        {/* Allergens */}
        {product.allergens && product.allergens.length > 0 && (
          <View className="bg-white mx-4 rounded-2xl p-6 mb-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Allergens</Text>
            <View className="flex-row flex-wrap">
              {product.allergens.map((allergen, index) => (
                <View 
                  key={index}
                  className="bg-red-100 rounded-full px-4 py-2 mr-2 mb-2"
                >
                  <Text className="text-red-800 font-semibold">⚠️ {allergen}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Nutriscore and Nova Group */}
        {(product.nutriscore_grade || product.nova_group) && (
          <View className="bg-white mx-4 rounded-2xl p-6 mb-4">
            <Text className="text-xl font-bold text-gray-900 mb-4">Nutrition Scores</Text>
            {product.nutriscore_grade && (
              <View className="mb-3">
                <Text className="text-sm text-gray-600 mb-1">Nutri-Score</Text>
                <View className="bg-gray-100 rounded-lg px-4 py-2 self-start">
                  <Text className="text-2xl font-bold text-gray-900">{product.nutriscore_grade.toUpperCase()}</Text>
                </View>
              </View>
            )}
            {product.nova_group && (
              <View>
                <Text className="text-sm text-gray-600 mb-1">NOVA Group</Text>
                <View className="bg-gray-100 rounded-lg px-4 py-2 self-start">
                  <Text className="text-2xl font-bold text-gray-900">{product.nova_group}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Action Button */}
        <View className="px-4 pb-8">
          <TouchableOpacity 
            className="rounded-2xl py-4 items-center mb-3"
            style={{ 
              backgroundColor: productIsSaved ? '#9CA3AF' : '#2D5F4F',
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

      {/* Subscription Modal */}
      <SubscriptionModal
        visible={isSubscriptionModalVisible}
        onClose={() => setIsSubscriptionModalVisible(false)}
        trigger="saved_limit"
      />
    </View>
  );
}