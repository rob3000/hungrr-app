import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, Product } from '../services/api';
import { useSavedItems } from '../context/SavedItemsContext';
import SubscriptionModal from '../components/SubscriptionModal';
import IngredientDetailModal from '../components/IngredientDetailModal';

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
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [isIngredientModalVisible, setIsIngredientModalVisible] = useState(false);

  
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

  // Sample ingredient data - in a real app this would come from your API
  const getIngredientDetails = (ingredientName: string) => {
    const ingredientData: { [key: string]: any } = {
      'honey': {
        name: 'Honey',
        description: 'Sweetener • Natural',
        safetyRating: 'AVOID',
        tags: ['High Fructose', 'Carbohydrate'],
        whyToAvoid: {
          description: 'Honey contains excess fructose in relation to glucose. For individuals with IBS or following a Low FODMAP diet, this excess fructose can be difficult to absorb, leading to fermentation in the gut.',
          symptoms: ['Bloating', 'Gas', 'Abdominal Pain']
        },
        fodmapGroup: {
          name: 'Monosaccharide',
          icon: '👤'
        },
        servingLimit: '1tsp (7g)',
        alternatives: [
          {
            name: 'Maple Syrup',
            description: 'Pure, authentic maple syrup',
            recommended: true
          },
          {
            name: 'Stevia',
            description: 'Zero calorie natural sweetener'
          },
          {
            name: 'Rice Malt Syrup',
            description: 'Fructose-free sweetener'
          }
        ]
      },
      'wheat flour': {
        name: 'Wheat Flour',
        description: 'Grain • Processed',
        safetyRating: 'AVOID',
        tags: ['High Fructan', 'Gluten'],
        whyToAvoid: {
          description: 'Wheat flour contains high levels of fructans, which are poorly absorbed in the small intestine and can cause digestive symptoms in sensitive individuals.',
          symptoms: ['Bloating', 'Gas', 'Cramping', 'Diarrhea']
        },
        fodmapGroup: {
          name: 'Oligosaccharide',
          icon: '🔗'
        },
        servingLimit: 'Avoid',
        alternatives: [
          {
            name: 'Rice Flour',
            description: 'Gluten-free, low FODMAP alternative',
            recommended: true
          },
          {
            name: 'Oat Flour',
            description: 'Made from ground oats'
          }
        ]
      },
      'soy lecithin': {
        name: 'Soy Lecithin',
        description: 'Emulsifier • Processed',
        safetyRating: 'CAUTION',
        tags: ['Soy Derivative', 'Additive'],
        whyToAvoid: {
          description: 'Soy lecithin may contain small amounts of soy proteins that can trigger reactions in sensitive individuals, though it is generally well tolerated.',
          symptoms: ['Mild digestive discomfort']
        },
        alternatives: [
          {
            name: 'Sunflower Lecithin',
            description: 'Plant-based alternative to soy lecithin',
            recommended: true
          }
        ]
      }
    };

    return ingredientData[ingredientName.toLowerCase()] || null;
  };

  const handleIngredientPress = (ingredientName: string) => {
    const ingredientDetails = getIngredientDetails(ingredientName);
    if (ingredientDetails) {
      setSelectedIngredient(ingredientDetails);
      setIsIngredientModalVisible(true);
    }
  };

  if (!product) {
    return (
      <View className="flex-1" style={{ backgroundColor: '#D1E758' }}>
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 pt-12" style={{ backgroundColor: '#D1E758' }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#181A2C" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-[#181A2C]">Scan Result</Text>
          <View className="w-10" />
        </View>

        {/* Content Card */}
        <View className="flex-1 px-4 pt-8">
          <View className="bg-white rounded-3xl p-8 items-center" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}>
            {/* Search Icon with Question Mark */}
            <View className="relative mb-8">
              <View className="w-20 h-20 items-center justify-center">
                <Ionicons name="search-outline" size={48} color="#9CA3AF" />
              </View>
              <View className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#D1E758] rounded-full items-center justify-center">
                <Text className="text-[#181A2C] font-bold text-lg">?</Text>
              </View>
            </View>

            {/* Title */}
            <Text className="text-2xl font-bold text-[#181A2C] mb-4 text-center">
              Product Not Found
            </Text>

            {/* Description */}
            <Text className="text-gray-600 text-center mb-8 leading-6">
              We couldn't find this item in our database.{'\n'}
              You can try scanning the ingredients list{'\n'}
              directly or search for individual{'\n'}
              ingredients.
            </Text>

            {/* Action Buttons */}
            <View className="w-full space-y-4">
              <TouchableOpacity 
                className="bg-[#181A2C] rounded-2xl py-4 items-center flex-row justify-center"
                onPress={() => (navigation as any).navigate('Camera')}
              >
                <Ionicons name="scan-outline" size={20} color="#FFFFFF" className="mr-2" />
                <Text className="text-white font-semibold text-lg ml-2">Scan Ingredients</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="bg-transparent rounded-2xl py-4 items-center flex-row justify-center"
                onPress={() => (navigation as any).navigate('Search')}
              >
                <Ionicons name="search-outline" size={20} color="#181A2C" className="mr-2" />
                <Text className="text-[#181A2C] font-semibold text-lg ml-2">Search Manually</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tip */}
          <Text className="text-center text-[#181A2C] mt-6 opacity-80">
            Tip: Ensure the barcode is clear and well-lit{'\n'}when scanning.
          </Text>
        </View>

        {/* Bottom Navigation */}
        <View className="bg-white mx-4 mb-4 rounded-3xl" style={{
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
              <Ionicons name="bookmark-outline" size={24} color="#9CA3AF" />
            </TouchableOpacity>
            
            <TouchableOpacity className="items-center flex-1">
              <Ionicons name="person-outline" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const safetyRating = (product.safety_rating?.toUpperCase() ?? 'UNKNOWN') as keyof typeof SAFETY_COLORS;
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
                    {isProblematic ? (
                      <Text 
                        className="text-red-600"
                        style={{ textDecorationLine: 'underline' }}
                        onPress={() => handleIngredientPress(trimmed)}
                      >
                        {trimmed}
                      </Text>
                    ) : (
                      <Text className="text-gray-700">{trimmed}</Text>
                    )}
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

      {/* Ingredient Detail Modal */}
      <IngredientDetailModal
        visible={isIngredientModalVisible}
        onClose={() => setIsIngredientModalVisible(false)}
        ingredient={selectedIngredient}
      />
    </View>
  );
}