import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../services/api';
import { logger } from '../services/logger';
import DebugPanel from '../components/DebugPanel';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [debugTapCount, setDebugTapCount] = useState(0);

  // Enable debug panel in dev mode OR after 5 taps on logo
  const isDebugEnabled = __DEV__ || debugTapCount >= 5;

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
      className="flex-1 bg-[#f3eee5]"
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

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="items-center pt-16 pb-8">
          <TouchableOpacity 
            onPress={() => {
              const newCount = debugTapCount + 1;
              setDebugTapCount(newCount);
              if (newCount === 5) {
                logger.info('Debug mode enabled via logo taps');
              }
            }}
            activeOpacity={0.8}
          >
            <Image 
              source={require('../assets/logo.png')} 
              height={8} 
              width={8} 
              resizeMode="contain" 
              className='w-44'
            />
          </TouchableOpacity>
          {debugTapCount > 0 && debugTapCount < 5 && (
            <Text className="text-xs text-gray-400 mt-2">
              {5 - debugTapCount} more taps to enable debug mode
            </Text>
          )}
        </View>

        {/* Login Form */}
        <View className="px-6">
          <View className="p-6 mb-6">
            <Text className="text-2xl font-bold text-[#2d4a3e] mb-2 text-center">
              Welcome to hungrr
            </Text>
            <Text className="text-base text-gray-600 mb-6 text-center">
              Enter your email to get started
            </Text>
            
            {/* Email Input */}
            <View className="mb-4">
              <View className={`bg-white rounded-2xl px-4 py-4 flex-row items-center border-2 ${error ? 'border-red-500' : 'border-gray-200'}`}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="Enter your email"
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
              {error && (
                <View className="mt-2 flex-row items-center">
                  <Ionicons name="alert-circle" size={16} color="#EF4444" />
                  <Text className="text-red-500 text-sm ml-1">{error}</Text>
                </View>
              )}
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              className={`rounded-2xl py-4 items-center mb-4 ${isLoading ? 'bg-gray-400' : 'bg-[#2d4a3e]'}`}
              onPress={handleSendOTP}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white font-semibold text-lg">Continue</Text>
              )}
            </TouchableOpacity>

            {/* Info Text */}
            <Text className="text-sm text-gray-500 text-center">
              We'll send you a verification code to confirm your email
            </Text>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center items-center mb-8">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('Signup')} disabled={isLoading}>
              <Text className="text-[#2d4a3e] font-semibold">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Debug Panel */}
      <DebugPanel visible={showDebugPanel} onClose={() => setShowDebugPanel(false)} />
    </KeyboardAvoidingView>
  );
}