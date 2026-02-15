import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../context/AuthContext';
import { GridBackground } from 'components/GridBackground';

type OTPVerificationRouteProp = RouteProp<
  {
    OTPVerification: {
      email: string;
      sessionToken: string;
      isSignup?: boolean;
    };
  },
  'OTPVerification'
>;

export default function OTPVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute<OTPVerificationRouteProp>();
  const { email, sessionToken, isSignup } = route.params;
  const { login } = useAuth();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [currentSessionToken, setCurrentSessionToken] = useState(sessionToken);

  // Refs for OTP input fields
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (index === 5 && value) {
      const fullOtp = [...newOtp.slice(0, 5), value].join('');
      if (fullOtp.length === 6) {
        handleVerifyOTP(fullOtp);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const otpToVerify = otpCode || otp.join('');

    // Validate OTP
    if (otpToVerify.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First, verify the OTP (this works for both login and signup)
      const verifyResponse = await apiClient.verifyOTP({
        session_token: currentSessionToken,
        code: otpToVerify,
        email: email,
      });

      console.info('verifyResponse', verifyResponse)

      if (verifyResponse.success && verifyResponse.data) {
        const { token } = verifyResponse.data;
        
        // Set token in API client
        apiClient.setToken(token);

        // For login, fetch user profile
        const userResponse = await apiClient.getUserProfile();
        console.info('TOKEN!', token, userResponse)
        if (userResponse.success && userResponse.data) {
          const userData = userResponse.data;
          
          // Transform the user data to match UserProfile interface
          const userProfile: UserProfile = {
            id: userData.email,
            email: userData.email,
            name: `${userData.first_name} ${userData.last_name}`.trim(),
            createdAt: new Date().toISOString(),
          };
          
          // Store auth token and user profile in AuthContext
          await login(token, userProfile);

          if (isSignup) {
            (navigation as any).navigate('DietaryProfile');
          } else {
            // Navigate to dashboard
            navigation.reset({
              index: 0,
              routes: [{ name: 'Overview' }],
            });
          }

         
        } else {
          // Failed to fetch user data
          setError(userResponse.error?.message || 'Failed to fetch user data. Please try again.');
          // Clear OTP inputs
          setOtp(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
        
      } else {
        // Show error message
        setError(verifyResponse.error?.message || 'Invalid verification code. Please try again.');
        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error verifying OTP:', err);
      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call API to resend OTP
      const response = await apiClient.sendOTP({
        email,
      });

      if (response.success && response.data) {
        // Update session token
        setCurrentSessionToken(response.data.session_token);

        // Reset timer
        setResendTimer(30);
        setCanResend(false);

        // Clear OTP inputs
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();

        Alert.alert('Success', 'A new verification code has been sent to your email.');
      } else {
        setError(response.error?.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error resending OTP:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#D1E758] relative">
      {/* Grid Background */}
      <GridBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 relative z-10"
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="items-center pt-16 pb-8">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-black rounded-2xl items-center justify-center mr-4">
                <Image source={require('../assets/logo-dark.png')} className="w-7 h-7" resizeMode="contain" />
              </View>
              <Text className="text-3xl font-bold text-black">hungrr</Text>
            </View>
          </View>

          {/* Main Card */}
          <View className="mx-6 mb-8 flex-1">
            <View className="bg-white rounded-3xl p-8" style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
            }}>
              {/* Lock Icon */}
              <View className="items-center mb-8">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center">
                  <Ionicons name="lock-closed" size={32} color="#2d3436" />
                </View>
              </View>

              {/* Title and Description */}
              <View className="items-center mb-8">
                <Text className="text-2xl font-bold text-black mb-4">
                  Verify your email address
                </Text>
                <Text className="text-gray-500 text-center leading-5">
                  Use the code below to verify your email{'\n'}address and start scanning products.
                </Text>
              </View>

              {/* OTP Display */}
              <View className="mb-8">
                <TouchableOpacity 
                  onPress={() => inputRefs.current[0]?.focus()}
                  activeOpacity={0.7}
                >
                  <View className="flex-row justify-center items-center mb-6">
                    {otp.map((digit, index) => (
                      <React.Fragment key={index}>
                        <Text className="text-5xl font-bold text-black mx-2">
                          {digit || ' '}
                        </Text>
                        {index === 2 && <View className="w-6" />}
                      </React.Fragment>
                    ))}
                  </View>
                </TouchableOpacity>

                {/* Hidden input fields for functionality */}
                <View className="flex-row justify-between opacity-0 absolute">
                  {otp.map((digit, index) => (
                    <View
                      key={index}
                      className="w-12 h-12"
                    >
                      <TextInput
                        ref={(ref) => {
                          inputRefs.current[index] = ref;
                        }}
                        className="text-xl font-bold text-black text-center w-full h-full"
                        value={digit}
                        onChangeText={(value) => handleOtpChange(value, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus
                        editable={!isLoading}
                        style={{ textAlignVertical: 'center' }}
                      />
                    </View>
                  ))}
                </View>

                {/* Timer */}
                <View className="items-center mb-4">
                  <Text className="text-gray-500 text-sm">
                    This code will expire in <Text className="font-semibold text-black">10 minutes</Text>
                  </Text>
                </View>

                {error && (
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text className="text-red-500 text-sm ml-1">{error}</Text>
                  </View>
                )}
              </View>


              {/* Open App Button */}
              <TouchableOpacity
                className={`rounded-3xl py-4 items-center flex-row justify-center mb-6 ${
                  isLoading || otp.join('').length !== 6 ? 'bg-gray-400' : 'bg-[#2d3436]'
                }`}
                onPress={() => handleVerifyOTP()}
                disabled={isLoading || otp.join('').length !== 6}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-white font-semibold text-lg">Open App</Text>
                )}
              </TouchableOpacity>

              {/* Disclaimer */}
              <View className="items-center">
                <Text className="text-gray-500 text-sm text-center leading-5">
                  If you didn't request this email, you can safely ignore{'\n'}it.
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View className="items-center px-6 pb-8">
            {/* Social Links */}
            <View className="flex-row justify-center space-x-8 mb-4">
              <Text className="text-gray-600 font-medium">FB</Text>
              <Text className="text-gray-600 font-medium">TW</Text>
              <Text className="text-gray-600 font-medium">IG</Text>
            </View>

            {/* Copyright */}
            <Text className="text-gray-500 text-sm text-center mb-2">
              © 2024 Hungrr Inc. All rights reserved.
            </Text>
            <Text className="text-gray-500 text-sm text-center mb-4">
              123 Health Valley, San Francisco, CA 94105
            </Text>

            {/* Links */}
            <View className="flex-row justify-center space-x-4">
              <Text className="text-gray-600 text-sm">Privacy Policy</Text>
              <Text className="text-gray-500 text-sm">•</Text>
              <Text className="text-gray-600 text-sm">Help Center</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
