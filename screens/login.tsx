import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../services/api';
import { logger } from '../services/logger';
import { storage, STORAGE_KEYS } from '../services/storage';
import DebugPanel from '../components/DebugPanel';
import { GridBackground } from 'components/GridBackground';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugTapCount, setDebugTapCount] = useState(0);
  const [showBackButton, setShowBackButton] = useState(true);

  // Enable debug panel in dev mode OR after 5 taps on logo
  const isDebugEnabled = __DEV__ || debugTapCount >= 5;

  // Check if welcome screen was seen to determine if back button should show
  useEffect(() => {
    const checkWelcomeStatus = async () => {
      try {
        const hasSeenWelcome = await storage.getItem<boolean>(STORAGE_KEYS.WELCOME_SCREEN_SEEN);
        // If welcome screen was skipped (hasSeenWelcome is true), don't show back button
        setShowBackButton(!hasSeenWelcome);
      } catch (error) {
        console.error('Error checking welcome screen status:', error);
        // Default to showing back button if we can't determine status
        setShowBackButton(true);
      }
    };

    checkWelcomeStatus();
  }, []);

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOTP = async () => {
    // Clear previous error
    setError(null);

    // Validate email
    if (!email.trim()) {
      setError('Please enter your email address');
      logger.warn('Login attempt with empty email');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address');
      logger.warn('Login attempt with invalid email', { email: email.trim() });
      return;
    }

    setIsLoading(true);
    logger.info('Attempting to send OTP', { email: email.trim() });

    try {
      // Reset the JWT
      apiClient.setToken(null);

      // Call API to send OTP
      const response = await apiClient.sendOTP({
        email: email.trim(),
      });

      logger.info('Send OTP response received', { 
        success: response.success,
        hasData: !!response.data,
        error: response.error 
      });

      if (response.success && response.data) {
        // Navigate to OTP verification screen
        logger.info('Navigating to OTP verification', { 
          email: email.trim(),
          hasSessionToken: !!response.data.session_token 
        });
        
        (navigation as any).navigate('OTPVerification', {
          email: email.trim(),
          sessionToken: response.data.session_token,
        });
      } else {
        // Show error message
        logger.error('Send OTP failed', { error: response.error });
        
        if (response.error?.code === "HTTP_404") {
          setError("User not found")
          return
        }

        setError(response.error?.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      // Detailed error logging for debugging
      logger.error('Exception during send OTP', {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        type: typeof err,
        stringified: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });
      
      // Show detailed error message in development
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' && err !== null
        ? JSON.stringify(err)
        : 'An unexpected error occurred. Please try again.';
      
      setError(__DEV__ ? errorMessage : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#D1E758]"
    >
      {/* Debug Button - Visible in dev mode or after 5 taps on logo */}
      {isDebugEnabled && (
        <TouchableOpacity
          onPress={() => setShowDebugPanel(true)}
          className="absolute top-12 right-4 z-50 bg-red-600 rounded-full p-3 shadow-lg"
          style={{ elevation: 5 }}
        >
          <Ionicons name="bug" size={24} color="#FFF" />
        </TouchableOpacity>
      )}
      <GridBackground />
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button - Only show if welcome screen wasn't skipped */}
        {showBackButton && (
          <View className="px-6 pt-12">
            <TouchableOpacity
              onPress={() => navigation.navigate('Welcome')}
              className="mb-4"
              disabled={isLoading}
            >
              <Ionicons name="arrow-back" size={24} color="#181A2C" />
            </TouchableOpacity>
          </View>
        )}

        {/* Header */}
        <View className={`items-center px-6 pb-8 ${!showBackButton ? 'pt-32' : 'pt-16'}`}>
          <TouchableOpacity
            onPress={() => {
              setDebugTapCount(prev => prev + 1);
              // Reset count after 2 seconds of no taps
              setTimeout(() => setDebugTapCount(0), 2000);
            }}
            className="flex-row items-center mb-16"
          >
            <View className="w-8 h-8 bg-black rounded-lg items-center justify-center mr-3">
              <Image source={require('../assets/logo-dark.png')} className="w-5 h-5" resizeMode="contain" />
            </View>
            <Text className="text-2xl font-bold text-black">hungrr</Text>
          </TouchableOpacity>
          
          <Text className="text-3xl font-bold text-black mb-2">Welcome Back</Text>
          <Text className="text-black/70 text-center text-lg">
            Log in to continue your diet journey.
          </Text>
        </View>

        {/* Login Form Card - Floating */}
        <View className="mx-6 mb-8">
          <View className="bg-white rounded-3xl p-6" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}>
            {/* Email Input */}
            <View className="">
              <Text className="text-gray-500 text-sm font-medium uppercase tracking-wide">EMAIL ADDRESS</Text>
              <View className={`bg-gray-50 rounded-2xl px-4 py-4 flex-row items-center ${error ? 'border-2 border-red-500' : ''}`}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900 text-lg"
                  placeholder="hello@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null); // Clear error when user types
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <View className="mb-4 flex-row items-center">
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text className="text-red-500 text-sm ml-1">{error}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Login Button - Outside the card */}
        <View className="px-6 mb-4">
          <TouchableOpacity
            className={`rounded-3xl py-4 items-center flex-row justify-center bg-[#181A2C]`}
            onPress={handleSendOTP}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#D1E758" />
            ) : (
              <>
                <Text className="text-[#D1E758] font-semibold text-lg mr-2">Log In</Text>
                <Ionicons name="arrow-forward" size={20} color="#D1E758" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View className="flex-row justify-center items-center mb-8">
          <Text className="text-black/70 text-base">Don't have an account? </Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Signup')} disabled={isLoading}>
            <Text className="text-black font-semibold text-base">Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Debug Panel */}
      <DebugPanel visible={showDebugPanel} onClose={() => setShowDebugPanel(false)} />
    </KeyboardAvoidingView>
  );
}