import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ingredient } from '../context/SavedItemsContext';

interface IngredientDetailModalProps {
  ingredient: Ingredient | null;
  visible: boolean;
  onClose: () => void;
}

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

// FODMAP rating colors
const FODMAP_COLORS = {
  LOW_FODMAP: '#10B981',
  HIGH_FODMAP: '#EF4444',
  GLUTEN_FREE: '#3B82F6',
};

export const IngredientDetailModal: React.FC<IngredientDetailModalProps> = ({
  ingredient,
  visible,
  onClose,
}) => {
  if (!ingredient) return null;

  const safetyColor = SAFETY_COLORS[ingredient.safetyLevel];
  const fodmapColor = FODMAP_COLORS[ingredient.fodmapRating];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 pb-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900 flex-1">
              Ingredient Details
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1">
            <View className="p-6">
              {/* Ingredient Name */}
              <Text className="text-2xl font-bold text-gray-900 mb-4">
                {ingredient.name}
              </Text>

              {/* Safety and FODMAP Badges */}
              <View className="flex-row items-center flex-wrap mb-6">
                <View
                  className="rounded-full px-4 py-2 mr-2 mb-2"
                  style={{
                    backgroundColor: safetyColor.background,
                    borderWidth: 1,
                    borderColor: safetyColor.border,
                  }}
                >
                  <Text
                    className="text-sm font-bold"
                    style={{ color: safetyColor.text }}
                  >
                    {ingredient.safetyLevel}
                  </Text>
                </View>

                <View
                  className="rounded-full px-4 py-2 mr-2 mb-2"
                  style={{ backgroundColor: `${fodmapColor}20` }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: fodmapColor }}
                  >
                    {ingredient.fodmapRating.replace('_', ' ')}
                  </Text>
                </View>

                {ingredient.hasCheckLimit && (
                  <View className="bg-orange-100 rounded-full px-4 py-2 mb-2">
                    <Text className="text-sm font-bold text-orange-700">
                      ⚠️ CHECK LIMIT
                    </Text>
                  </View>
                )}
              </View>

              {/* Risk Analysis Section */}
              {ingredient.riskAnalysis && (
                <View className="mb-6">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="information-circle" size={24} color="#2D5F4F" />
                    <Text className="text-lg font-bold text-gray-900 ml-2">
                      Risk Analysis
                    </Text>
                  </View>
                  <View className="bg-gray-50 rounded-2xl p-4">
                    <Text className="text-base text-gray-700 leading-6">
                      {ingredient.riskAnalysis}
                    </Text>
                  </View>
                </View>
              )}

              {/* Suggested Alternatives Section */}
              {ingredient.alternatives && ingredient.alternatives.length > 0 && (
                <View className="mb-6">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="swap-horizontal" size={24} color="#2D5F4F" />
                    <Text className="text-lg font-bold text-gray-900 ml-2">
                      Suggested Alternatives
                    </Text>
                  </View>
                  <View className="bg-green-50 rounded-2xl p-4">
                    {ingredient.alternatives.map((alternative, index) => (
                      <View
                        key={index}
                        className="flex-row items-center mb-2"
                        style={{
                          marginBottom: index === ingredient.alternatives!.length - 1 ? 0 : 8,
                        }}
                      >
                        <View className="w-2 h-2 bg-green-600 rounded-full mr-3" />
                        <Text className="text-base text-gray-800 flex-1">
                          {alternative}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Info Note */}
              <View className="bg-blue-50 rounded-2xl p-4 flex-row">
                <Ionicons name="bulb-outline" size={20} color="#3B82F6" />
                <Text className="text-sm text-blue-800 ml-2 flex-1">
                  This analysis is based on FODMAP research and IBS dietary guidelines. 
                  Individual tolerance may vary. Consult with a healthcare professional 
                  for personalized advice.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Close Button */}
          <View className="p-6 pt-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={onClose}
              className="bg-green-700 rounded-2xl py-4 items-center"
            >
              <Text className="text-white font-semibold text-lg">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
