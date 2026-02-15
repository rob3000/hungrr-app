import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../services/api';
import { GridBackground } from 'components/GridBackground';
import { ScrollView } from 'react-native-gesture-handler';

interface SubmitProductResponse {
  success: boolean;
  message: string;
  estimatedTime?: string;
}

export default function ProductNotFoundScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { barcode } = (route.params as { barcode?: string }) || { barcode: 'Unknown' };
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScanIngredients = () => {
    // Navigate to camera screen for ingredient scanning
    (navigation as any).navigate('Camera', { mode: 'ingredients' });
  };

  const handleSearchManually = () => {
    // Navigate to search screen
    (navigation as any).navigate('Search');
  };

  const handleSubmitForAnalysis = async () => {
    // Allow all users to submit products for analysis
    setIsSubmitting(true);
    
    try {
      const response = await apiClient.post<SubmitProductResponse>(
        '/products/submit-for-analysis',
        { barcode }
      );

      if (response.success && response.data) {
        Alert.alert(
          'Submitted Successfully',
          response.data.message || 'Your product has been submitted for analysis. We\'ll notify you when it\'s ready.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Submission Failed',
          response.error?.message || 'Unable to submit product for analysis. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-[#C4D946]">
      <GridBackground />
      {/* Status Bar Area */}
      <View className="h-12" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-black">Scan Result</Text>
        <View className="w-10" />
      </View>

      {/* Main Content Card */}
      <View className="flex-1 px-4 pb-4">
        <View className="bg-white rounded-3xl flex-1 px-6 py-6">
          {/* Icon Container */}
          <View className="items-center mt-10 mb-8">
            <View className="relative">
              {/* Main search icon */}
              <View className="w-16 h-16 items-center justify-center">
                <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                {/* X overlay */}
                <View className="absolute top-2 right-2">
                  <Ionicons name="close" size={16} color="#D1D5DB" />
                </View>
              </View>
              {/* Question mark badge */}
              <View className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#C4D946] rounded-full items-center justify-center">
                <Text className="text-black font-bold text-sm">?</Text>
              </View>
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-black text-center mb-6">
            Product Not Found
          </Text>

          {/* Description */}
          <Text className="text-base text-gray-600 text-center mb-12 leading-5 px-2">
            We couldn't find this item in our database.{'\n'}
            You can try scanning the ingredients list{'\n'}
            directly or search for individual{'\n'}
            ingredients.
          </Text>

          {/* Action Buttons */}
          <View className="w-full space-y-3 px-2">
            <TouchableOpacity 
              className="bg-[#2D3748] rounded-full py-4 items-center flex-row justify-center mb-4"
              onPress={handleScanIngredients}
              disabled={isSubmitting}
            >
              <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
              <Text className="text-white font-semibold text-base ml-2">Scan Ingredients</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-[#C4D946] rounded-full py-4 items-center flex-row justify-center"
              onPress={handleSubmitForAnalysis}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <>
                  <Ionicons name="add-circle-outline" size={20} color="#000000" />
                  <Text className="text-black font-semibold text-base ml-2">Submit for Analysis</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom Tip */}
          <View className="mt-auto">
            <Text className="text-center text-gray-600 text-sm leading-4">
              Tip: Ensure the barcode is clear and well-lit{'\n'}when scanning.
            </Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}