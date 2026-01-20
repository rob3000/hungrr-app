import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { storage, STORAGE_KEYS } from '../services/storage';

export default function WelcomeToProScreen() {
  const navigation = useNavigation();

  const handleLetsGo = async () => {
    try {
      // Set flag in AsyncStorage to mark onboarding as complete
      await storage.setItem(STORAGE_KEYS.PRO_ONBOARDING_COMPLETE, true);
      
      // Navigate to Dashboard (Overview screen)
      navigation.navigate('Overview' as never);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Navigate anyway even if storage fails
      navigation.navigate('Overview' as never);
    }
  };

  return (
    <View className="flex-1 bg-[#f3eee5]">
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 60, paddingBottom: 40 }}>
        {/* Success Badge */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="checkmark" size={48} color="#10B981" />
          </View>
          
          {/* Title */}
          <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
            Welcome to hungrr Pro
          </Text>
          
          {/* Benefits Description */}
          <Text className="text-base text-gray-600 text-center leading-6 px-4">
            You now have unlimited scans, unlimited saved items, and early access to safe recipes
          </Text>
        </View>

        {/* Feature Cards Grid (2x2) */}
        <View className="mb-8">
          <View className="flex-row mb-4">
            {/* Unlimited Scans */}
            <View className="flex-1 bg-[#2d4a3e] rounded-3xl p-6 mr-2">
              <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="scan" size={24} color="white" />
              </View>
              <Text className="text-white text-xs font-bold mb-1 tracking-wider">
                FULL SAFETY
              </Text>
              <Text className="text-white text-lg font-bold">
                Unlimited Scans
              </Text>
            </View>

            {/* Unlimited Saves */}
            <View className="flex-1 bg-[#D4AF37] rounded-3xl p-6 ml-2">
              <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="bookmark" size={24} color="white" />
              </View>
              <Text className="text-white text-xs font-bold mb-1 tracking-wider">
                PERSONAL LIBRARY
              </Text>
              <Text className="text-white text-lg font-bold">
                Unlimited Saves
              </Text>
            </View>
          </View>

          <View className="flex-row">
            {/* Recipe Early Access */}
            <View className="flex-1 bg-[#F59E0B] rounded-3xl p-6 mr-2">
              <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="restaurant" size={24} color="white" />
              </View>
              <Text className="text-white text-xs font-bold mb-1 tracking-wider">
                SAFE MEALS
              </Text>
              <Text className="text-white text-lg font-bold">
                Recipe Early Access
              </Text>
            </View>

            {/* Athlete Mode Beta */}
            <View className="flex-1 bg-[#3B82F6] rounded-3xl p-6 ml-2">
              <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="barbell" size={24} color="white" />
              </View>
              <Text className="text-white text-xs font-bold mb-1 tracking-wider">
                PERFORMANCE
              </Text>
              <Text className="text-white text-lg font-bold">
                Athlete Mode Beta
              </Text>
            </View>
          </View>
        </View>

        {/* Subtitle */}
        <Text className="text-sm text-gray-500 text-center mb-8 px-4">
          Explore your new Pro features in your dashboard
        </Text>
      </ScrollView>

      {/* Bottom Action Button */}
      <View className="bg-white border-t border-gray-200 px-6 py-4">
        <TouchableOpacity
          className="bg-[#2D5F4F] rounded-2xl py-4 flex-row items-center justify-center"
          onPress={handleLetsGo}
        >
          <Text className="text-white font-semibold text-lg mr-2">Let's Go</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
