import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { storage, STORAGE_KEYS } from '../services/storage';
import { useAuth } from '../context/AuthContext';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { isLoggedIn } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  // Check if user should skip welcome screen
  useFocusEffect(
    React.useCallback(() => {
      const checkWelcomeStatus = async () => {
        try {
          // If user is already logged in, go to overview
          if (isLoggedIn) {
            (navigation as any).navigate('Overview');
            return;
          }

          // Check if user has seen welcome screen before
          const hasSeenWelcome = await storage.getItem<boolean>(STORAGE_KEYS.WELCOME_SCREEN_SEEN);
          
          if (hasSeenWelcome) {
            // Skip welcome screen and go directly to login
            (navigation as any).navigate('Login');
            return;
          }
          
          setIsChecking(false);
        } catch (error) {
          console.error('Error checking welcome screen status:', error);
          setIsChecking(false);
        }
      };

      checkWelcomeStatus();
    }, [isLoggedIn, navigation])
  );

  const handleLoginPress = async () => {
    // Store that user has seen welcome screen and wants to login
    await storage.setItem(STORAGE_KEYS.WELCOME_SCREEN_SEEN, true);
    (navigation as any).navigate('Login');
  };

  // Show loading while checking
  if (isChecking) {
    return (
      <View className="flex-1 bg-[#D1E758] items-center justify-center">
        <ActivityIndicator size="large" color="#181A2C" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#D1E758] relative">

      {/* Content */}
      <View className="flex-1 relative z-10">
        {/* Header */}
        <View className="items-center pt-32 pb-8">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-black rounded-2xl items-center justify-center mr-4">
              <Text className="text-[#D1E758] font-bold text-xl">h</Text>
            </View>
            <Text className="text-3xl font-bold text-black">hungrr</Text>
          </View>
        </View>

        {/* Product Card */}
        <View className="mx-6 mb-8">
          <View className="bg-white rounded-3xl overflow-hidden" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}>
            {/* Product Image with Gradient Overlay */}
            <View className="relative">
              <View className="h-48 items-center justify-center" style={{
                backgroundColor: '#0f766e', // teal-700 equivalent
              }}>
                {/* Placeholder for vegetables image - you can replace with actual image */}
                <View className="flex-row flex-wrap items-center justify-center px-4">
                  <Text className="text-6xl mr-2">🥦</Text>
                  <Text className="text-4xl mr-2">🥑</Text>
                  <Text className="text-4xl mr-2">🍅</Text>
                  <Text className="text-4xl mr-2">🥒</Text>
                  <Text className="text-4xl">🌶️</Text>
                </View>
              </View>
              
              {/* Tags Overlay */}
              <View className="absolute bottom-4 left-4 flex-row">
                <View className="bg-black rounded-full px-3 py-1 mr-2">
                  <Text className="text-white text-xs font-semibold">VEGAN</Text>
                </View>
                <View className="bg-[#D1E758] rounded-full px-3 py-1">
                  <Text className="text-black text-xs font-semibold">LOW FODMAP</Text>
                </View>
              </View>
            </View>

            {/* Product Info */}
            <View className="p-6">
              <View className="flex-row items-center mb-2">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-gray-500 text-sm font-medium uppercase tracking-wide">SAFE TO EAT</Text>
              </View>
              <Text className="text-2xl font-bold text-black mb-1">Organic Avocado & Toast</Text>
              <Text className="text-gray-600 text-base">100% compliant with your diet.</Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View className="flex-1 items-center px-6">
          <Text className="text-5xl font-bold text-black text-center mb-4">
            Eat with{'\n'}confidence.
          </Text>
          <Text className="text-black/70 text-center text-lg leading-6 mb-8">
            Scan labels instantly to detect Low{'\n'}FODMAP, Vegan, and other dietary{'\n'}triggers.
          </Text>

          {/* Page Indicators */}
          <View className="flex-row items-center mb-2">
            <View className="w-6 h-2 bg-black rounded-full mr-2" />
            <View className="w-2 h-2 bg-black/30 rounded-full mr-2" />
            <View className="w-2 h-2 bg-black/30 rounded-full" />
          </View>
        </View>

        {/* Bottom Actions */}
        <View className="px-6 pb-12">
          {/* Get Started Button */}
          <TouchableOpacity
            className="bg-[#181A2C] rounded-3xl py-4 items-center mb-4 flex-row justify-center"
            onPress={async () => {
              // Store that user has seen welcome screen
              await storage.setItem(STORAGE_KEYS.WELCOME_SCREEN_SEEN, true);
              (navigation as any).navigate('Signup');
            }}
          >
            <Text className="text-[#D1E758] font-semibold text-lg mr-2">Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#D1E758" />
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity 
            className="items-center py-3"
            onPress={handleLoginPress}
          >
            <Text className="text-[#181A2C] text-base font-medium">I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}