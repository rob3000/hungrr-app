import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function RecipeDetailScreen() {
  const navigation = useNavigation();
  
  // Default to Rice & Maple PB Bowl if no params passed
  const recipeData = {
    title: 'Rice & Maple PB Bowl',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    prepTime: '60-90 min before',
    tags: ['PRE-SESSION', 'IBS SAFE', 'Low FODMAP'],
    calories: 420,
    protein: '12g',
    carbs: '68g',
    fat: '14g',
    description: 'A perfectly balanced pre-workout meal designed for athletes with sensitive stomachs. This bowl provides sustained energy through complex carbohydrates while being gentle on your digestive system.',
    ingredients: [
      '1 cup cooked jasmine rice',
      '2 tbsp natural peanut butter',
      '1 tbsp pure maple syrup',
      '1/2 banana, sliced',
      '1 tbsp chia seeds',
      '1/4 cup blueberries',
      'Pinch of sea salt',
      '1/4 cup coconut flakes (optional)'
    ],
    instructions: [
      'Cook jasmine rice according to package instructions and let cool slightly.',
      'In a small bowl, mix peanut butter with maple syrup until smooth.',
      'Place warm rice in serving bowl.',
      'Drizzle peanut butter mixture over rice.',
      'Top with sliced banana and blueberries.',
      'Sprinkle chia seeds and coconut flakes on top.',
      'Add a pinch of sea salt and serve immediately.'
    ],
    nutritionTips: [
      'Consume 60-90 minutes before training for optimal digestion',
      'Low FODMAP ingredients reduce digestive stress',
      'Natural sugars provide quick energy while complex carbs sustain you',
      'Moderate protein content won\'t cause digestive issues during exercise'
    ]
  };

  return (
    <View className="flex-1 bg-[#f3eee5]">
      <ScrollView className="flex-1">
        {/* Hero Image */}
        <View className="relative">
          <Image 
            source={{ uri: recipeData.image }}
            className="w-full h-64"
          />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="absolute top-12 left-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Recipe Header */}
        <View className="bg-white rounded-t-3xl -mt-6 pt-6 px-6">
          <Text className="text-2xl font-bold text-gray-900 mb-2">{recipeData.title}</Text>
          
          {/* Tags */}
          <View className="flex-row flex-wrap mb-4">
            {recipeData.tags.map((tag, index) => (
              <View key={index} className="flex-row items-center mr-4 mb-2">
                <Text className={`text-xs font-medium mr-1 ${
                  tag === 'PRE-SESSION' ? 'text-orange-500' : 
                  tag === 'IBS SAFE' ? 'text-green-600' : 'text-blue-500'
                }`}>
                  {tag}
                </Text>
                {tag === 'IBS SAFE' && <View className="w-2 h-2 bg-green-500 rounded-full" />}
              </View>
            ))}
          </View>

          <Text className="text-gray-600 mb-4">{recipeData.prepTime}</Text>
          <Text className="text-gray-700 leading-6 mb-6">{recipeData.description}</Text>
        </View>

        {/* Nutrition Info */}
        <View className="bg-white mx-6 rounded-2xl p-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Nutrition Facts</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-900">{recipeData.calories}</Text>
              <Text className="text-gray-600 text-sm">Calories</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-semibold text-gray-900">{recipeData.protein}</Text>
              <Text className="text-gray-600 text-sm">Protein</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-semibold text-gray-900">{recipeData.carbs}</Text>
              <Text className="text-gray-600 text-sm">Carbs</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-semibold text-gray-900">{recipeData.fat}</Text>
              <Text className="text-gray-600 text-sm">Fat</Text>
            </View>
          </View>
        </View>

        {/* Ingredients */}
        <View className="bg-white mx-6 rounded-2xl p-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Ingredients</Text>
          {recipeData.ingredients.map((ingredient, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <View className="w-2 h-2 bg-green-600 rounded-full mr-3" />
              <Text className="text-gray-700 flex-1">{ingredient}</Text>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View className="bg-white mx-6 rounded-2xl p-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Instructions</Text>
          {recipeData.instructions.map((instruction, index) => (
            <View key={index} className="flex-row mb-3">
              <View className="w-6 h-6 bg-green-600 rounded-full items-center justify-center mr-3 mt-0.5">
                <Text className="text-white text-xs font-bold">{index + 1}</Text>
              </View>
              <Text className="text-gray-700 flex-1 leading-5">{instruction}</Text>
            </View>
          ))}
        </View>

        {/* Nutrition Tips */}
        <View className="bg-white mx-6 rounded-2xl p-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Nutrition Tips</Text>
          {recipeData.nutritionTips.map((tip, index) => (
            <View key={index} className="flex-row items-start mb-2">
              <Ionicons name="bulb" size={16} color="#059669" className="mr-2 mt-0.5" />
              <Text className="text-gray-700 flex-1 text-sm leading-5">{tip}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View className="px-6 pb-8">
          <TouchableOpacity className="bg-green-700 rounded-2xl py-4 items-center mb-3">
            <Text className="text-white font-semibold text-lg">Add to Meal Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-orange-400 rounded-2xl py-4 items-center">
            <Text className="text-white font-semibold text-lg">Set Reminder</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}