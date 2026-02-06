import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSubscription } from '../context/SubscriptionContext';
import { SubscriptionPlan } from '../services/api';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  trigger?: 'scan_limit' | 'saved_limit' | 'feature_access';
}

export default function SubscriptionModal({ visible, onClose, trigger = 'feature_access' }: SubscriptionModalProps) {
  const navigation = useNavigation();
  const { availablePlans, plansLoading, plansError, retryLoadPlans } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  // Auto-select the best value plan when plans load
  React.useEffect(() => {
    if (availablePlans.length > 0 && !selectedPlan) {
      const bestValuePlan = availablePlans[1]; // @todo = update
      setSelectedPlan(bestValuePlan);
    }
  }, [availablePlans, selectedPlan]);

  const getTriggerTitle = () => {
    switch (trigger) {
      case 'scan_limit':
        return 'Scan Limit Reached';
      case 'saved_limit':
        return 'Saved Items Limit Reached';
      case 'feature_access':
      default:
        return 'Upgrade to hungrr Pro';
    }
  };

  const handleUnlockPro = () => {
    if (selectedPlan) {
      onClose();
      // Navigate to Checkout screen with selected plan
      (navigation.navigate as any)('Checkout', { plan: selectedPlan });
    }
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
    return `${formattedPrice}/${interval === 'yearly' ? 'year' : 'month'}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 pb-8">
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 w-8 h-8 items-center justify-center z-10"
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Title */}
            <Text className="text-2xl font-bold text-gray-900 mb-2 mt-2">
              {getTriggerTitle()}
            </Text>
            <Text className="text-base text-gray-600 mb-6">
              Upgrade to hungrr Pro to unlock unlimited access and premium features
            </Text>

            {/* Premium Features */}
            <View className="mb-6">
              <View className="flex-row items-start mb-4">
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="scan" size={20} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900 mb-1">
                    Unlimited Barcode Scans
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Instantly identify IBS-safe foods without daily limits
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start mb-4">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="fitness" size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900 mb-1">
                    Advanced Training Sync
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Macros automatically adjust based on workout intensity
                  </Text>
                </View>
              </View>

              <View className="flex-row items-start mb-4">
                <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="trophy" size={20} color="#8B5CF6" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900 mb-1">
                    Custom Performance Plans
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Nutrition strategies tailored to athletic goals
                  </Text>
                </View>
              </View>
            </View>

            {/* Subscription Plans */}
            {plansLoading ? (
              <View className="bg-gray-50 rounded-2xl p-8 mb-6 items-center">
                <ActivityIndicator size="large" color="#2D5F4F" />
                <Text className="text-gray-600 mt-4">Loading plans...</Text>
              </View>
            ) : plansError ? (
              <View className="bg-red-50 rounded-2xl p-4 mb-6">
                <Text className="text-red-800 text-center mb-3">{plansError}</Text>
                <TouchableOpacity
                  onPress={retryLoadPlans}
                  className="bg-red-600 rounded-lg py-2 px-4"
                >
                  <Text className="text-white text-center font-semibold">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : availablePlans.length > 0 ? (
              <View className="mb-6">
                {availablePlans.map((plan) => (
                  <TouchableOpacity
                    key={plan.name}
                    onPress={() => setSelectedPlan(plan)}
                    className={`rounded-2xl p-4 mb-3 border-2 ${
                      selectedPlan?.name === plan.name
                        ? 'bg-green-50 border-green-500'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text className="text-lg font-bold text-gray-900 mr-2">
                            {plan.name}
                          </Text>
                          {plan.name !== "free" && (
                            <View className="bg-[#D4AF37] rounded-full px-3 py-1">
                              <Text className="text-white text-xs font-bold">BEST VALUE</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-2xl font-bold text-[#2D5F4F]">
                          {formatPrice(plan.price_cents, plan.currency, plan.interval)}
                        </Text>
                      </View>
                      <View
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          selectedPlan?.name === plan.name
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedPlan?.name === plan.name && (
                          <Ionicons name="checkmark" size={16} color="white" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="bg-gray-50 rounded-2xl p-4 mb-6">
                <Text className="text-center text-gray-600">
                  No subscription plans available
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <TouchableOpacity 
              className={`rounded-2xl py-4 items-center mb-3 ${
                selectedPlan && !plansLoading ? 'bg-[#2D5F4F]' : 'bg-gray-400'
              }`}
              onPress={handleUnlockPro}
              disabled={!selectedPlan || plansLoading}
            >
              <Text className="text-white font-semibold text-lg">Unlock hungrr Pro</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="py-3 items-center"
              onPress={onClose}
            >
              <Text className="text-gray-600 font-medium">Not now, I'll stick with Basic</Text>
            </TouchableOpacity>

            {/* Cancellation Info */}
            <Text className="text-xs text-gray-500 text-center mt-4">
              Subscriptions can be cancelled anytime in App Store settings
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
