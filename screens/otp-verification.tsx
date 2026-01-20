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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../context/AuthContext';

type OTPVerificationRouteProp = RouteProp<
  {
    OTPVerification: {
      email: string;
      sessionToken: string;
      name?: string;
      isSignup?: boolean;
    };
  },
  'OTPVerification'
>;

export default function OTPVerificationScreen() {
  const navigation = useNavigation();
  const route = useRoute<OTPVerificationRouteProp>();
  const { email, sessionToken } = route.params;
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

          // Navigate to dashboard
          navigation.reset({
            index: 0,
            routes: [{ name: 'Overview' }],
          });
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#f3eee5]"
    >
      <ScrollView contentContainerClassName="flex-grow">
        <View className="flex-1 px-6 pt-16">
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mb-8"
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={24} color="#2d4a3e" />
          </TouchableOpacity>

          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-[#2d4a3e] mb-3">
              'Verify Your Email
            </Text>
            <Text className="text-base text-gray-600">
              We've sent a 6-digit code to{' '}
              <Text className="font-semibold text-gray-800">{email}</Text>
            </Text>
          </View>

          {/* OTP Input Fields */}
          <View className="mb-6">
            <View className="flex-row justify-between mb-4">
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  className={`w-12 h-14 bg-gray-50 rounded-xl text-center text-2xl font-semibold text-gray-900 border-2 ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!isLoading}
                />
              ))}
            </View>

            {error && (
              <View className="flex-row items-center">
                <Ionicons name="alert-circle" size={16} color="#EF4444" />
                <Text className="text-red-500 text-sm ml-1">{error}</Text>
              </View>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            className={`rounded-2xl py-4 items-center mb-6 ${
              isLoading || otp.join('').length !== 6 ? 'bg-gray-400' : 'bg-[#2d4a3e]'
            }`}
            onPress={() => handleVerifyOTP()}
            disabled={isLoading || otp.join('').length !== 6}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold text-lg">Verify Code</Text>
            )}
          </TouchableOpacity>

          {/* Resend OTP */}
          <View className="items-center">
            <Text className="text-gray-600 mb-2">Didn't receive the code?</Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOTP} disabled={isLoading}>
                <Text className="text-[#2d4a3e] font-semibold text-base">
                  Resend Code
                </Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-gray-500">
                Resend code in {resendTimer}s
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
