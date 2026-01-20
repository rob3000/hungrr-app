import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Mock product data - in real app, this would come from API based on barcode
  const productData = {
    name: 'Organic Steel Cut Oats',
    brand: 'Nature\'s Path',
    barcode: '058449880011',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
    servingSize: '1/4 cup (40g)',
    servingsPerContainer: 11,
    nutrition: {
      calories: 150,
      totalFat: '3g',
      saturatedFat: '0.5g',
      cholesterol: '0mg',
      sodium: '0mg',
      totalCarbs: '27g',
      dietaryFiber: '4g',
      sugars: '1g',
      protein: '5g',
      iron: '10%',
      calcium: '2%'
    },
    ingredients: [
      'Organic steel cut oats'
    ],
    allergens: ['May contain traces of wheat, soy, and tree nuts'],
    description: 'Hearty, nutritious steel cut oats that provide sustained energy for athletes. Perfect for pre-workout meals.',
    tags: ['Organic', 'Gluten-Free', 'Non-GMO', 'Vegan']
  };

  const handleAddToMealPlan = () => {
    // In real app, would add to user's meal plan
    (navigation as any).navigate('Overview');
  };

  return (
    <View className="flex-1 bg-gray-100">
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
            <TouchableOpacity className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
              <Ionicons name="heart-outline" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Product Image */}
          <View className="items-center pb-6">
            <Image 
              source={{ uri: productData.image }}
              className="w-48 h-48 rounded-2xl"
            />
          </View>
        </View>

        {/* Product Info */}
        <View className="bg-white mx-4 rounded-2xl p-6 mb-4">
          <View className="flex-row items-center mb-2">
            <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            <Text className="text-green-600 text-sm font-medium">PRODUCT FOUND</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-1">{productData.name}</Text>
          <Text className="text-lg text-gray-600 mb-2">{productData.brand}</Text>
          <Text className="text-sm text-gray-500">Barcode: {productData.barcode}</Text>
          
          {/* Tags */}
          <View className="flex-row flex-wrap mt-3">
            {productData.tags.map((tag, index) => (
              <View key={index} className="bg-green-100 rounded-full px-3 py-1 mr-2 mb-2">
                <Text className="text-green-700 text-xs font-medium">{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Nutrition Facts */}
        <View className="bg-white mx-4 rounded-2xl p-6 mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Nutrition Facts</Text>
          <Text className="text-sm text-gray-600 mb-3">
            Serving Size: {productData.servingSize} | Servings: {productData.servingsPerContainer}
          </Text>
          
          <View className="border-t border-gray-200 pt-3">
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-lg font-bold text-gray-900">Calories</Text>
              <Text className="text-lg font-bold text-gray-900">{productData.nutrition.calories}</Text>
            </View>
            
            {Object.entries(productData.nutrition).map(([key, value], index) => {
              if (key === 'calories') return null;
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return (
                <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-100">
                  <Text className="text-gray-700">{label}</Text>
                  <Text className="text-gray-900 font-medium">{value}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Ingredients */}
        <View className="bg-white mx-4 rounded-2xl p-6 mb-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">Ingredients</Text>
          <Text className="text-gray-700 leading-6 mb-4">
            {productData.ingredients.join(', ')}
          </Text>
          
          <Text className="text-sm font-medium text-gray-900 mb-2">Allergen Information:</Text>
          {productData.allergens.map((allergen, index) => (
            <Text key={index} className="text-sm text-gray-600 mb-1">• {allergen}</Text>
          ))}
        </View>

        {/* Description */}
        <View className="bg-white mx-4 rounded-2xl p-6 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-3">About This Product</Text>
          <Text className="text-gray-700 leading-6">{productData.description}</Text>
        </View>

        {/* Action Buttons */}
        <View className="px-4 pb-8">
          <TouchableOpacity 
            className="bg-green-700 rounded-2xl py-4 items-center mb-3"
            onPress={handleAddToMealPlan}
          >
            <Text className="text-white font-semibold text-lg">Add to Meal Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-orange-400 rounded-2xl py-4 items-center">
            <Text className="text-white font-semibold text-lg">Track Consumption</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}