import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../services/api';

export default function SignupScreen() {
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    // Clear previous error
    setError(null);

    // Validate name
    if (!firstName.trim()) {
      setError('Please enter your firstname');
      return;
    }

    if (!lastName.trim()) {
      setError('Please enter your lastname');
      return;
    }

    if (firstName.trim().length < 2) {
      setError('firstname must be at least 2 characters');
      return;
    }

    if (lastName.trim().length < 2) {
      setError('lastname must be at least 1 characters');
      return;
    }

    // Validate email
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Call API to send OTP for signup
      const response = await apiClient.register({
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      })

      if (response.success && response.data) {
        // Navigate to OTP verification screen with signup flag
        (navigation as any).navigate('OTPVerification', {
          email: email.trim(),
          sessionToken: response.data.session_token,
          isSignup: true,
        });
      } else {
        // Show error message
        if (response.error?.code === "HTTP_409") {
          setError('User already exists')
          return
        }

        console.info(response)
        setError(response.error?.message || 'Failed to send verification code. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error sending OTP:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#f3eee5]"
    >
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {/* Back Button */}
        <View className="px-6 pt-12">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mb-4"
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={24} color="#2d4a3e" />
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View className="items-center px-6 pb-8">
          <Image 
            source={require('../assets/logo.png')} 
            height={8} 
            width={8} 
            resizeMode="contain" 
            className='w-44 mb-4'
          />
          <Text className="text-3xl font-bold text-[#2d4a3e] mb-2">Create Account</Text>
          <Text className="text-gray-600 text-center">
            Join hungrr to discover IBS-safe foods
          </Text>
        </View>

        {/* Signup Form */}
        <View className="px-6">
          {/* Name Input */}
          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">First Name</Text>
            <View className="bg-white rounded-2xl px-4 py-4 flex-row items-center border-2 border-gray-200">
              <Ionicons name="person-outline" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                placeholder="Enter your firstname"
                placeholderTextColor="#9CA3AF"
                value={firstName}
                onChangeText={setFirstName}
                editable={!isLoading}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-2">Surname</Text>
            <View className="bg-white rounded-2xl px-4 py-4 flex-row items-center border-2 border-gray-200">
              <Ionicons name="person-outline" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                placeholder="Enter your surname"
                placeholderTextColor="#9CA3AF"
                value={lastName}
                onChangeText={setLastName}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Email Input */}
          <View className="mb-6">
            <Text className="text-gray-700 text-sm font-medium mb-2">Email Address</Text>
            <View className="bg-white rounded-2xl px-4 py-4 flex-row items-center border-2 border-gray-200">
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View className="flex-row items-center mb-4 bg-red-50 rounded-xl p-3">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text className="text-red-500 text-sm ml-2 flex-1">{error}</Text>
            </View>
          )}

          {/* Signup Button */}
          <TouchableOpacity
            className={`rounded-2xl py-4 items-center mb-6 ${
              isLoading ? 'bg-gray-400' : 'bg-[#2d4a3e]'
            }`}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold text-lg">Continue</Text>
            )}
          </TouchableOpacity>

          {/* Privacy Notice */}
          <Text className="text-xs text-gray-500 text-center mb-6 px-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>

          {/* Login Link */}
          <View className="flex-row justify-center items-center mb-8">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)} disabled={isLoading}>
              <Text className="text-[#2d4a3e] font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}