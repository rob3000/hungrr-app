import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Ingredient {
  name: string;
  description: string;
  safetyRating: 'AVOID' | 'CAUTION' | 'SAFE';
  tags: string[];
  whyToAvoid: {
    description: string;
    symptoms: string[];
  };
  fodmapGroup?: {
    name: string;
    icon: string;
  };
  servingLimit?: string;
  alternatives: Array<{
    name: string;
    description: string;
    recommended?: boolean;
  }>;
}

interface IngredientDetailModalProps {
  visible: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
}

export default function IngredientDetailModal({ 
  visible, 
  onClose, 
  ingredient 
}: IngredientDetailModalProps) {
  if (!ingredient) return null;

  const getSafetyColor = (rating: string) => {
    switch (rating) {
      case 'AVOID': return 'bg-red-100 text-red-600';
      case 'CAUTION': return 'bg-yellow-100 text-yellow-600';
      case 'SAFE': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTagColor = (tag: string) => {
    if (tag.includes('Fructose')) return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Ingredient Detail</Text>
          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          {/* Ingredient Header */}
          <View className="px-4 py-6">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-row items-center">
                <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mr-4">
                  <View className="w-8 h-8 bg-red-400 rounded-full" />
                </View>
                <View className="flex-1">
                  <Text className="text-2xl font-bold mb-1">{ingredient.name}</Text>
                  <Text className="text-gray-600">{ingredient.description}</Text>
                </View>
              </View>
              <View className={`px-3 py-1 rounded-full ${getSafetyColor(ingredient.safetyRating)}`}>
                <Text className="text-sm font-medium">{ingredient.safetyRating}</Text>
              </View>
            </View>

            {/* Tags */}
            <View className="flex-row flex-wrap gap-2 mb-6">
              {ingredient.tags.map((tag, index) => (
                <View key={index} className={`px-3 py-1 rounded-full ${getTagColor(tag)}`}>
                  <Text className="text-sm">{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Why to Avoid Section */}
          <View className="mx-4 mb-6 p-4 bg-red-50 rounded-xl">
            <View className="flex-row items-center mb-3">
              <Ionicons name="warning" size={20} color="#EF4444" />
              <Text className="text-red-600 font-semibold ml-2">Why to Avoid</Text>
            </View>
            
            <Text className="text-gray-700 mb-4 leading-6">
              {ingredient.whyToAvoid.description}
            </Text>

            <View className="mb-4">
              <Text className="text-red-600 font-medium mb-2">🔴 Potential Symptoms:</Text>
              <Text className="text-red-600">{ingredient.whyToAvoid.symptoms.join(', ')}</Text>
            </View>

            {/* FODMAP Info */}
            {ingredient.fodmapGroup && (
              <View className="flex-row justify-between items-center pt-4 border-t border-red-100">
                <View>
                  <Text className="text-gray-500 text-sm mb-1">FODMAP GROUP</Text>
                  <View className="flex-row items-center">
                    <Text className="mr-2">{ingredient.fodmapGroup.icon}</Text>
                    <Text className="text-blue-600 font-medium">{ingredient.fodmapGroup.name}</Text>
                  </View>
                </View>
                {ingredient.servingLimit && (
                  <View className="items-end">
                    <Text className="text-gray-500 text-sm mb-1">SERVING LIMIT</Text>
                    <View className="flex-row items-center">
                      <Text className="mr-2">⚠️</Text>
                      <Text className="font-medium">{ingredient.servingLimit}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Safe Alternatives */}
          <View className="px-4 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold">Safe Alternatives</Text>
              <Text className="text-green-600 text-sm">Recommended</Text>
            </View>

            {ingredient.alternatives.map((alternative, index) => (
              <TouchableOpacity key={index} className="flex-row items-center p-4 bg-gray-50 rounded-xl mb-3">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Text>🍃</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-medium mb-1">{alternative.name}</Text>
                  <Text className="text-gray-600 text-sm">{alternative.description}</Text>
                </View>
                {alternative.recommended && (
                  <View className="bg-green-100 px-2 py-1 rounded">
                    <Text className="text-green-600 text-xs">✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}