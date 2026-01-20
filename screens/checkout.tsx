import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SubscriptionPlan, useSubscription } from '../context/SubscriptionContext';
import { apiClient } from '../services/api';
import { storage, STORAGE_KEYS } from '../services/storage';

type CheckoutRouteParams = {
  Checkout: {
    plan: SubscriptionPlan;
  };
};

type CheckoutRouteProp = RouteProp<CheckoutRouteParams, 'Checkout'>;

type CardType = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

interface CardDetails {
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

interface PurchaseSubscriptionRequest {
  planId: string;
  paymentMethod: string;
  paymentToken?: string;
  cardDetails?: CardDetails;
}

interface PurchaseSubscriptionResponse {
  success: boolean;
  subscription: {
    isPro: boolean;
    plan: SubscriptionPlan;
    status: 'active' | 'cancelled' | 'expired' | 'none';
    expiresAt?: string;
  };
  message?: string;
}

export default function CheckoutScreen() {
  const navigation = useNavigation();
  const route = useRoute<CheckoutRouteProp>();
  const { plan } = route.params;
  const { updateSubscription, loadSubscription } = useSubscription();

  // Card form state
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Validate payment fields
  const validatePaymentFields = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate cardholder name
    if (!cardholderName.trim()) {
      errors.cardholderName = 'Cardholder name is required';
    } else if (cardholderName.trim().length < 2) {
      errors.cardholderName = 'Please enter a valid name';
    }

    // Validate card number
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    if (!cleanedCardNumber) {
      errors.cardNumber = 'Card number is required';
    } else if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      errors.cardNumber = 'Please enter a valid card number';
    } else if (!/^\d+$/.test(cleanedCardNumber)) {
      errors.cardNumber = 'Card number must contain only digits';
    }

    // Validate expiry date
    if (!expiryDate) {
      errors.expiryDate = 'Expiry date is required';
    } else {
      const [month, year] = expiryDate.split('/');
      if (!month || !year || month.length !== 2 || year.length !== 2) {
        errors.expiryDate = 'Invalid format (use MM/YY)';
      } else {
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;

        if (monthNum < 1 || monthNum > 12) {
          errors.expiryDate = 'Invalid month';
        } else if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
          errors.expiryDate = 'Card has expired';
        }
      }
    }

    // Validate CVV
    if (!cvv) {
      errors.cvv = 'CVV is required';
    } else if (cvv.length < 3 || cvv.length > 4) {
      errors.cvv = 'CVV must be 3 or 4 digits';
    } else if (!/^\d+$/.test(cvv)) {
      errors.cvv = 'CVV must contain only digits';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Process card payment
  const processCardPayment = async () => {
    // Validate fields first
    if (!validatePaymentFields()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form');
      return;
    }

    setIsProcessing(true);
    setValidationErrors({});

    try {
      // Parse expiry date
      const [expiryMonth, expiryYear] = expiryDate.split('/');

      // Prepare card details
      const cardDetails: CardDetails = {
        cardholderName: cardholderName.trim(),
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiryMonth,
        expiryYear,
        cvv,
      };

      // Prepare purchase request
      const purchaseRequest: PurchaseSubscriptionRequest = {
        planId: plan.id,
        paymentMethod: 'card',
        cardDetails,
      };

      // Call API endpoint
      const response = await apiClient.post<PurchaseSubscriptionResponse>(
        '/subscriptions/purchase',
        purchaseRequest
      );

      if (response.success && response.data) {
        // Update subscription context
        await updateSubscription(plan);
        
        // Reload subscription from API to get latest data
        await loadSubscription();

        // Check if Pro onboarding has already been completed
        const onboardingComplete = await storage.getItem<boolean>(
          STORAGE_KEYS.PRO_ONBOARDING_COMPLETE
        );

        // Navigate to Welcome screen only if onboarding not yet complete
        if (onboardingComplete) {
          navigation.navigate('Overview' as never);
        } else {
          navigation.navigate('WelcomeToPro' as never);
        }
      } else {
        // Payment failed - display error without changing subscription state
        const errorMessage = response.error?.message || 'Payment failed. Please try again.';
        Alert.alert('Payment Failed', errorMessage);
      }
    } catch (error) {
      // Handle unexpected errors
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      Alert.alert('Payment Error', errorMessage);
      console.error('Payment processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process Apple Pay
  const processApplePay = async () => {
    // Check if Apple Pay is available on device
    if (Platform.OS !== 'ios') {
      Alert.alert('Not Available', 'Apple Pay is only available on iOS devices');
      return;
    }

    setIsProcessing(true);

    try {
      // In a real implementation, you would use a library like @stripe/stripe-react-native
      // or react-native-payments to handle Apple Pay
      // For now, we'll simulate the flow
      
      Alert.alert(
        'Apple Pay',
        'Apple Pay integration requires additional native modules. Please use card payment for now.',
        [{ text: 'OK' }]
      );
      
      // Example of what the real implementation would look like:
      // const paymentToken = await ApplePay.requestPayment({
      //   amount: plan.price,
      //   currency: plan.currency,
      // });
      //
      // const purchaseRequest: PurchaseSubscriptionRequest = {
      //   planId: plan.id,
      //   paymentMethod: 'apple_pay',
      //   paymentToken,
      // };
      //
      // const response = await apiClient.post<PurchaseSubscriptionResponse>(
      //   '/subscriptions/purchase',
      //   purchaseRequest
      // );
      //
      // if (response.success && response.data) {
      //   await updateSubscription(plan);
      //   await loadSubscription();
      //   navigation.navigate('WelcomeToPro' as never);
      // }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Apple Pay failed';
      Alert.alert('Apple Pay Error', errorMessage);
      console.error('Apple Pay error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process Google Pay
  const processGooglePay = async () => {
    // Check if Google Pay is available on device
    if (Platform.OS !== 'android') {
      Alert.alert('Not Available', 'Google Pay is only available on Android devices');
      return;
    }

    setIsProcessing(true);

    try {
      // In a real implementation, you would use a library like @stripe/stripe-react-native
      // or react-native-payments to handle Google Pay
      // For now, we'll simulate the flow
      
      Alert.alert(
        'Google Pay',
        'Google Pay integration requires additional native modules. Please use card payment for now.',
        [{ text: 'OK' }]
      );
      
      // Example of what the real implementation would look like:
      // const paymentToken = await GooglePay.requestPayment({
      //   amount: plan.price,
      //   currency: plan.currency,
      // });
      //
      // const purchaseRequest: PurchaseSubscriptionRequest = {
      //   planId: plan.id,
      //   paymentMethod: 'google_pay',
      //   paymentToken,
      // };
      //
      // const response = await apiClient.post<PurchaseSubscriptionResponse>(
      //   '/subscriptions/purchase',
      //   purchaseRequest
      // );
      //
      // if (response.success && response.data) {
      //   await updateSubscription(plan);
      //   await loadSubscription();
      //   navigation.navigate('WelcomeToPro' as never);
      // }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google Pay failed';
      Alert.alert('Google Pay Error', errorMessage);
      console.error('Google Pay error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Detect card type from card number
  const detectCardType = (number: string): CardType => {
    const cleaned = number.replace(/\s/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    return 'unknown';
  };

  // Get card icon based on card type
  const getCardIcon = (type: CardType) => {
    switch (type) {
      case 'visa':
      case 'mastercard':
      case 'amex':
      case 'discover':
        return 'card';
      default:
        return 'card-outline';
    }
  };

  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ');
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    if (cleaned.length <= 16) {
      setCardNumber(formatCardNumber(cleaned));
    }
  };

  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setExpiryDate(formatExpiryDate(cleaned));
    }
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      setCvv(cleaned);
    }
  };

  const cardType = detectCardType(cardNumber);

  return (
    <View className="flex-1 bg-[#f3eee5]">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 pt-12 pb-4 px-6">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <Ionicons name="lock-closed" size={20} color="#10B981" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">Secure Checkout</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Apple Pay Button */}
        <TouchableOpacity
          className="bg-black rounded-2xl py-4 mb-3 flex-row items-center justify-center"
          onPress={processApplePay}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="logo-apple" size={24} color="white" />
              <Text className="text-white font-semibold text-lg ml-2">Pay with Apple Pay</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Google Pay Button */}
        <TouchableOpacity
          className="bg-white border-2 border-gray-300 rounded-2xl py-4 mb-4 flex-row items-center justify-center"
          onPress={processGooglePay}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#374151" />
          ) : (
            <Text className="text-gray-900 font-semibold text-lg">Pay with Google Pay</Text>
          )}
        </TouchableOpacity>

        {/* OR Divider */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-px bg-gray-300" />
          <Text className="text-gray-500 text-sm font-medium px-4">OR PAY WITH CARD</Text>
          <View className="flex-1 h-px bg-gray-300" />
        </View>

        {/* Order Summary */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">Order Summary</Text>
          
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base text-gray-700">{plan.name}</Text>
            <Text className="text-lg font-bold text-[#2D5F4F]">
              {formatPrice(plan.price, plan.currency)}/{plan.interval === 'yearly' ? 'year' : 'month'}
            </Text>
          </View>

          {/* Features */}
          <View className="border-t border-gray-200 pt-3 mt-2">
            {plan.features.map((feature, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text className="text-sm text-gray-600 ml-2">{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mt-4 py-2"
          >
            <Text className="text-[#2D5F4F] font-semibold text-center">Change Plan</Text>
          </TouchableOpacity>
        </View>

        {/* Card Payment Form */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Card Details</Text>
          
          {/* Cardholder Name */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Cardholder Name</Text>
            <TextInput
              className={`bg-gray-50 border ${validationErrors.cardholderName ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 text-base text-gray-900`}
              placeholder="John Doe"
              placeholderTextColor="#9CA3AF"
              value={cardholderName}
              onChangeText={(text) => {
                setCardholderName(text);
                if (validationErrors.cardholderName) {
                  setValidationErrors({ ...validationErrors, cardholderName: '' });
                }
              }}
              autoCapitalize="words"
              autoComplete="name"
              editable={!isProcessing}
            />
            {validationErrors.cardholderName && (
              <Text className="text-red-500 text-xs mt-1">{validationErrors.cardholderName}</Text>
            )}
          </View>

          {/* Card Number */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Card Number</Text>
            <View className="relative">
              <TextInput
                className={`bg-gray-50 border ${validationErrors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 pr-12 text-base text-gray-900`}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#9CA3AF"
                value={cardNumber}
                onChangeText={(text) => {
                  handleCardNumberChange(text);
                  if (validationErrors.cardNumber) {
                    setValidationErrors({ ...validationErrors, cardNumber: '' });
                  }
                }}
                keyboardType="numeric"
                maxLength={19}
                editable={!isProcessing}
              />
              <View className="absolute right-4 top-3">
                <Ionicons 
                  name={getCardIcon(cardType)} 
                  size={24} 
                  color={cardType !== 'unknown' ? '#2D5F4F' : '#9CA3AF'} 
                />
              </View>
            </View>
            {validationErrors.cardNumber && (
              <Text className="text-red-500 text-xs mt-1">{validationErrors.cardNumber}</Text>
            )}
          </View>

          {/* Expiry and CVV */}
          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-sm font-medium text-gray-700 mb-2">Expiry Date</Text>
              <TextInput
                className={`bg-gray-50 border ${validationErrors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 text-base text-gray-900`}
                placeholder="MM/YY"
                placeholderTextColor="#9CA3AF"
                value={expiryDate}
                onChangeText={(text) => {
                  handleExpiryChange(text);
                  if (validationErrors.expiryDate) {
                    setValidationErrors({ ...validationErrors, expiryDate: '' });
                  }
                }}
                keyboardType="numeric"
                maxLength={5}
                editable={!isProcessing}
              />
              {validationErrors.expiryDate && (
                <Text className="text-red-500 text-xs mt-1">{validationErrors.expiryDate}</Text>
              )}
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-sm font-medium text-gray-700 mb-2">CVV</Text>
              <TextInput
                className={`bg-gray-50 border ${validationErrors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-3 text-base text-gray-900`}
                placeholder="123"
                placeholderTextColor="#9CA3AF"
                value={cvv}
                onChangeText={(text) => {
                  handleCvvChange(text);
                  if (validationErrors.cvv) {
                    setValidationErrors({ ...validationErrors, cvv: '' });
                  }
                }}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                editable={!isProcessing}
              />
              {validationErrors.cvv && (
                <Text className="text-red-500 text-xs mt-1">{validationErrors.cvv}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Security Badges */}
        <View className="flex-row justify-center items-center mb-4">
          <View className="flex-row items-center mr-6">
            <Ionicons name="shield-checkmark" size={18} color="#10B981" />
            <Text className="text-xs text-gray-600 ml-1 font-medium">SSL</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="lock-closed" size={18} color="#10B981" />
            <Text className="text-xs text-gray-600 ml-1 font-medium">Encrypted</Text>
          </View>
        </View>

        {/* Terms */}
        <Text className="text-xs text-gray-500 text-center mb-6 leading-5">
          By continuing, you agree to our Terms of Service and Privacy Policy. 
          Subscription will auto-renew unless cancelled in App Store settings.
        </Text>
      </ScrollView>

      {/* Bottom Action Button */}
      <View className="bg-white border-t border-gray-200 px-6 py-4">
        <TouchableOpacity
          className={`bg-[#2D5F4F] rounded-2xl py-4 flex-row items-center justify-center ${isProcessing ? 'opacity-50' : ''}`}
          onPress={processCardPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-semibold text-lg mr-2">Confirm & Subscribe</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
