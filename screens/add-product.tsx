import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../services/api';

interface SubmitProductResponse {
  success: boolean;
  message: string;
  estimatedTime?: string;
}

export default function AddProductScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { barcode } = (route.params as { barcode?: string }) || { barcode: 'Unknown' };
  
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleTryAnotherScan = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-[#f3eee5]">
      {/* Header */}
      <View className="bg-white">
        <View className="flex-row items-center justify-between p-4 pt-12">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">Product Not Found</Text>
          <View className="w-10" />
        </View>
      </View>

      {/* Empty State */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Icon Container */}
        <View className="items-center mb-8">
          <View className="w-32 h-32 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="search" size={48} color="#9CA3AF" />
            <View className="absolute bottom-6 right-6 w-12 h-12 bg-orange-100 rounded-full items-center justify-center">
              <Ionicons name="help" size={24} color="#F59E0B" />
            </View>
          </View>
        </View>

        {/* Message */}
        <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
          Product Not Found
        </Text>
        <Text className="text-base text-gray-600 text-center mb-2 px-4">
          We couldn't find this item in our database, but we can analyze it for you
        </Text>
        <Text className="text-sm text-gray-500 text-center mb-8">
          Barcode: <Text className="font-mono font-semibold">{barcode}</Text>
        </Text>

        {/* Action Buttons */}
        <View className="w-full px-4">
          <TouchableOpacity 
            className="bg-[#2D5F4F] rounded-2xl py-4 items-center mb-3 shadow-sm"
            onPress={handleSubmitForAnalysis}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold text-lg">Submit for Analysis</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-white border-2 border-gray-200 rounded-2xl py-4 items-center"
            onPress={handleTryAnotherScan}
            disabled={isSubmitting}
          >
            <Text className="text-gray-700 font-semibold text-lg">Try Another Scan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}