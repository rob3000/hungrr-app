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
      className="flex-1 bg-[#D1E758]"
    >
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {/* Back Button */}
        <View className="px-6 pt-12">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mb-4"
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={24} color="#181A2C" />
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View className="items-center px-6 pb-8">
          <View className="flex-row items-center mb-12">
            <View className="w-8 h-8 bg-black rounded-lg items-center justify-center mr-3">
              <Text className="text-[#D1E758] font-bold text-lg">h</Text>
            </View>
            <Text className="text-2xl font-bold text-black">hungrr</Text>
          </View>
          
          <Text className="text-3xl font-bold text-black mb-2">Create Account</Text>
          <Text className="text-black/70 text-center text-lg">
            Join hungrr to discover IBS-safe foods
          </Text>
        </View>

        {/* Signup Form Card - Floating */}
        <View className="mx-6 mb-8">
          <View className="bg-white rounded-3xl p-6" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
          }}>
            {/* First Name Input */}
            <View className="mb-6">
              <Text className="text-gray-500 text-sm font-medium mb-3 uppercase tracking-wide">FIRST NAME</Text>
              <View className="bg-gray-50 rounded-2xl px-4 py-4 flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900 text-lg"
                  placeholder="Enter your first name"
                  placeholderTextColor="#9CA3AF"
                  value={firstName}
                  onChangeText={setFirstName}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Last Name Input */}
            <View className="mb-6">
              <Text className="text-gray-500 text-sm font-medium mb-3 uppercase tracking-wide">SURNAME</Text>
              <View className="bg-gray-50 rounded-2xl px-4 py-4 flex-row items-center">
                <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900 text-lg"
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
              <Text className="text-gray-500 text-sm font-medium mb-3 uppercase tracking-wide">EMAIL ADDRESS</Text>
              <View className="bg-gray-50 rounded-2xl px-4 py-4 flex-row items-center">
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900 text-lg"
                  placeholder="hello@example.com"
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
          </View>
        </View>

        {/* Signup Button - Outside the card */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            className={`rounded-3xl py-4 items-center flex-row justify-center ${
              isLoading ? 'bg-gray-400' : 'bg-[#181A2C]'
            }`}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text className="text-white font-semibold text-lg mr-2">Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Privacy Notice */}
        <View className="px-6 mb-6">
          <Text className="text-sm text-black/60 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>

        {/* Login Link */}
        <View className="flex-row justify-center items-center mb-8">
          <Text className="text-black/70 text-base">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login' as never)} disabled={isLoading}>
            <Text className="text-black font-semibold text-base">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}