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
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../context/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Create grid lines
const GridBackground = () => {
  const gridSize = 140;
  const verticalLines = Math.ceil(screenWidth / gridSize) + 1;
  const horizontalLines = Math.ceil(screenHeight / gridSize) + 1;

  return (
    <View className="absolute inset-0">
      {/* Vertical lines */}
      {Array.from({ length: verticalLines }).map((_, index) => (
        <View
          key={`v-${index}`}
          className="absolute bg-[#181A2C] opacity-30"
          style={{
            left: index * gridSize,
            top: 0,
            width: 1,
            height: screenHeight,
          }}
        />
      ))}
      {/* Horizontal lines */}
      {Array.from({ length: horizontalLines }).map((_, index) => (
        <View
          key={`h-${index}`}
          className="absolute bg-[#181A2C] opacity-30"
          style={{
            left: 0,
            top: index * gridSize,
            width: screenWidth,
            height: 1,
          }}
        />
      ))}
    </View>
  );
};

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
                <Text className="text-[#D1E758] font-bold text-xl">h</Text>
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
              {/* Email Icon */}
              <View className="items-center mb-8">
                <View className="w-16 h-16 bg-[#D1E758]/20 rounded-full items-center justify-center">
                  <Ionicons name="mail-outline" size={32} color="#2d3436" />
                </View>
              </View>

              {/* Title and Description */}
              <View className="items-center mb-8">
                <Text className="text-2xl font-bold text-black mb-3">
                  Verify your email
                </Text>
                <Text className="text-gray-600 text-center mb-2">
                  We've sent a 6-digit code to your email.
                </Text>
                <Text className="text-black font-semibold text-center">
                  {email}
                </Text>
              </View>

              {/* OTP Input Fields */}
              <View className="mb-8">
                <View className="flex-row justify-between mb-4">
                  {otp.map((digit, index) => (
                    <View
                      key={index}
                      className={`w-12 h-12 rounded-xl border-2 items-center justify-center ${
                        digit ? 'border-black bg-gray-50' : 'border-gray-300 bg-white'
                      } ${error ? 'border-red-500' : ''}`}
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

                {error && (
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text className="text-red-500 text-sm ml-1">{error}</Text>
                  </View>
                )}
              </View>

              {/* Resend Code */}
              <View className="items-center mb-8">
                <Text className="text-gray-600 mb-2">Didn't receive the code?</Text>
                {canResend ? (
                  <TouchableOpacity onPress={handleResendOTP} disabled={isLoading}>
                    <Text className="text-black font-semibold text-base">
                      Resend Code
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className="items-center">
                    <Text className="text-black font-semibold">Resend Code</Text>
                    <Text className="text-gray-500 text-sm">
                      Resend code in 00:{resendTimer.toString().padStart(2, '0')}
                    </Text>
                  </View>
                )}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                className={`rounded-3xl py-4 items-center flex-row justify-center ${
                  isLoading || otp.join('').length !== 6 ? 'bg-gray-400' : 'bg-[#2d3436]'
                }`}
                onPress={() => handleVerifyOTP()}
                disabled={isLoading || otp.join('').length !== 6}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text className="text-white font-semibold text-lg mr-2">Verify</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Back to Login */}
          <View className="px-6 pb-8">
            <TouchableOpacity 
              className="flex-row items-center justify-center"
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            >
              <Ionicons name="arrow-back" size={20} color="#2d3436" />
              <Text className="text-black font-semibold text-base ml-2">Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
