import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { storage, STORAGE_KEYS } from '../services/storage';
import { apiClient } from '../services/api';
import EditProfileModal from '../components/EditProfileModal';
import SubscriptionModal from '../components/SubscriptionModal';
import { NavigationBar } from '../components/NavigationBar';
import { UserProfile } from '../context/AuthContext';

interface UserPreferences {
  darkMode: boolean;
  notifications: boolean;
  mealReminders: boolean;
  workoutReminders: boolean;
}

interface DietaryRestriction {
  id: string;
  name: string;
  enabled: boolean;
  priority?: boolean;
}

interface SafeFoodItem {
  id: string;
  name: string;
  brand?: string;
  tags: string[];
  isVerified: boolean;
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { logout, user, updateUser } = useAuth();
  const { isPro } = useSubscription();
  const [pushAlerts, setPushAlerts] = useState(true);
  const [highSensitivityWarnings, setHighSensitivityWarnings] = useState(false);
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
  const [isSubscriptionModalVisible, setIsSubscriptionModalVisible] = useState(false);
  
  // Dietary restrictions state
  const [dietaryRestrictions, setDietaryRestrictions] = useState<DietaryRestriction[]>([
    { id: '1', name: 'Low FODMAP', enabled: true, priority: true },
    { id: '2', name: 'Gluten Free', enabled: false },
    { id: '3', name: 'Lactose Free', enabled: false },
  ]);

  // Safe foods history
  const [safeFoods] = useState<SafeFoodItem[]>([
    { 
      id: '1', 
      name: 'Oatly Barista Edition', 
      brand: '2H XCD', 
      tags: ['FODMAP SAFE'], 
      isVerified: true 
    },
    { 
      id: '2', 
      name: 'Sourdough Spelt Bread', 
      brand: 'YESTERDAY', 
      tags: ['FODMAP SAFE'], 
      isVerified: true 
    },
  ]);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const storedPreferences = await storage.getItem<UserPreferences>(
        STORAGE_KEYS.USER_PREFERENCES
      );

      if (storedPreferences) {
        setPushAlerts(storedPreferences.notifications);
        setHighSensitivityWarnings(false);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async (updatedPreferences: Partial<UserPreferences>) => {
    try {
      // Get current preferences
      const currentPreferences: UserPreferences = {
        darkMode: false,
        notifications: pushAlerts,
        mealReminders: false,
        workoutReminders: false,
      };

      // Merge with updates
      const newPreferences = { ...currentPreferences, ...updatedPreferences };

      // Save to AsyncStorage
      await storage.setItem(STORAGE_KEYS.USER_PREFERENCES, newPreferences);

      // Sync with API
      try {
        await apiClient.updatePreferences(newPreferences);
      } catch (apiError) {
        console.error('Error syncing preferences with API:', apiError);
        // Continue even if API sync fails - local storage is updated
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    }
  };

  const handlePushAlertsToggle = async (value: boolean) => {
    setPushAlerts(value);
    await savePreferences({ notifications: value });
  };

  const handleHighSensitivityToggle = async (value: boolean) => {
    setHighSensitivityWarnings(value);
  };

  const toggleDietaryRestriction = (id: string) => {
    setDietaryRestrictions(prev => 
      prev.map(restriction => 
        restriction.id === id 
          ? { ...restriction, enabled: !restriction.enabled }
          : restriction
      )
    );
  };

  const addCustomRestriction = () => {
    Alert.prompt(
      'Add Custom Restriction',
      'Enter the name of your dietary restriction:',
      (text) => {
        if (text && text.trim()) {
          const newRestriction: DietaryRestriction = {
            id: Date.now().toString(),
            name: text.trim(),
            enabled: true,
          };
          setDietaryRestrictions(prev => [...prev, newRestriction]);
        }
      }
    );
  };

  const clearSafeFoodsHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your safe foods history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {
          // Implementation for clearing history
        }},
      ]
    );
  };

  const handleDarkModeToggle = async () => {
    // Dark mode functionality removed for now
  };

  // Use actual user data from AuthContext
  const userData = {
    name: user?.name || 'Sarah Jenkins',
    email: user?.email || 'user@example.com',
    phone: user?.phoneNumber || 'Not set',
    memberSince: user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : '2023',
    version: 'v2.4.0',
  };

  const getSelectedRestrictionsCount = () => {
    return dietaryRestrictions.filter(r => r.enabled).length;
  };

  const getPriorityRestriction = () => {
    return dietaryRestrictions.find(r => r.enabled && r.priority);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigate to login screen
              (navigation as any).reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    setIsEditProfileVisible(true);
  };

  const handleSaveProfile = async (updatedFields: Partial<UserProfile>) => {
    try {
      // Call API to update profile
      await apiClient.updateProfile(updatedFields);

      // Update AuthContext with new user data
      await updateUser(updatedFields);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white pt-12 pb-6 px-6">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-gray-400 text-sm font-medium tracking-wider uppercase">
              User Dashboard
            </Text>
            <View className="flex-row items-center space-x-3">
              <View className="bg-yellow-200 px-3 py-1 rounded-full">
                <Text className="text-gray-800 text-xs font-medium">PREMIUM</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="settings-outline" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Info */}
          <View className="mb-4">
            <Text className="text-gray-400 text-xs font-medium mb-1">PROFILE NAME</Text>
            <Text className="text-gray-900 text-2xl font-bold">{userData.name}</Text>
            <Text className="text-gray-500 text-sm mt-1">
              Member since {userData.memberSince} • {userData.version}
            </Text>
          </View>
        </View>

        {/* Active Restrictions */}
        <View className="bg-white mx-6 rounded-2xl mb-6 overflow-hidden">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <Text className="text-gray-900 text-lg font-semibold">ACTIVE RESTRICTIONS</Text>
            <Text className="text-gray-400 text-sm">{getSelectedRestrictionsCount()} SELECTED</Text>
          </View>
          
          <View className="p-4 space-y-3">
            {dietaryRestrictions.map((restriction) => (
              <View key={restriction.id} className="flex-row items-center justify-between">
                <View className={`flex-1 flex-row items-center p-3 rounded-xl ${
                  restriction.enabled 
                    ? restriction.priority 
                      ? 'bg-lime-400' 
                      : 'bg-gray-100'
                    : 'bg-gray-50'
                }`}>
                  <Text className={`font-medium ${
                    restriction.enabled 
                      ? restriction.priority 
                        ? 'text-gray-900' 
                        : 'text-gray-700'
                      : 'text-gray-400'
                  }`}>
                    {restriction.name}
                  </Text>
                  {restriction.enabled && restriction.priority && (
                    <View className="ml-2 w-5 h-5 bg-gray-900 rounded-full items-center justify-center">
                      <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                  )}
                </View>
                <TouchableOpacity 
                  className="ml-3"
                  onPress={() => toggleDietaryRestriction(restriction.id)}
                >
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    restriction.enabled 
                      ? 'bg-gray-900 border-gray-900' 
                      : 'border-gray-300'
                  }`}>
                    {restriction.enabled && (
                      <Ionicons name="checkmark" size={12} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity 
              className="flex-row items-center justify-center p-3 border border-dashed border-gray-300 rounded-xl"
              onPress={addCustomRestriction}
            >
              <Ionicons name="add" size={16} color="#9CA3AF" />
              <Text className="text-gray-400 font-medium ml-2">ADD CUSTOM</Text>
            </TouchableOpacity>
          </View>

          {/* Priority Notice */}
          {getPriorityRestriction() && (
            <View className="bg-gray-900 p-4 m-4 rounded-xl">
              <View className="flex-row items-start">
                <View className="w-5 h-5 bg-yellow-400 rounded-full items-center justify-center mr-3 mt-0.5">
                  <Text className="text-gray-900 text-xs font-bold">!</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white text-sm">
                    <Text className="font-semibold">System prioritized for {getPriorityRestriction()?.name} logic.</Text>
                    {' '}Scanning will highlight triggers first.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Notification Settings */}
        <View className="bg-white mx-6 rounded-2xl mb-6 overflow-hidden">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-gray-900 text-lg font-semibold">NOTIFICATION SETTINGS</Text>
          </View>
          
          <View className="p-4 space-y-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="notifications" size={16} color="#6B7280" />
                </View>
                <Text className="text-gray-900 font-medium">Push Alerts</Text>
              </View>
              <Switch
                value={pushAlerts}
                onValueChange={handlePushAlertsToggle}
                trackColor={{ false: '#E5E7EB', true: '#D1E758' }}
                thumbColor={pushAlerts ? '#374151' : '#9CA3AF'}
              />
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="warning" size={16} color="#6B7280" />
                </View>
                <Text className="text-gray-900 font-medium">High Sensitivity Warnings</Text>
              </View>
              <Switch
                value={highSensitivityWarnings}
                onValueChange={handleHighSensitivityToggle}
                trackColor={{ false: '#E5E7EB', true: '#D1E758' }}
                thumbColor={highSensitivityWarnings ? '#374151' : '#9CA3AF'}
              />
            </View>
          </View>
        </View>

        {/* Safe Foods History */}
        <View className="bg-white mx-6 rounded-2xl mb-6 overflow-hidden">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <Text className="text-gray-900 text-lg font-semibold">SAFE FOODS HISTORY</Text>
            <TouchableOpacity onPress={clearSafeFoodsHistory}>
              <Text className="text-gray-400 text-sm">CLEAR LOGS</Text>
            </TouchableOpacity>
          </View>
          
          <View className="p-4 space-y-3">
            {safeFoods.map((food) => (
              <View key={food.id} className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">{food.name}</Text>
                  <Text className="text-gray-500 text-sm">{food.brand} • {food.tags.join(', ')}</Text>
                </View>
                <View className="w-6 h-6 bg-lime-400 rounded-full items-center justify-center">
                  <Ionicons name="checkmark" size={12} color="#374151" />
                </View>
              </View>
            ))}
          </View>
          
          <TouchableOpacity className="p-4 border-t border-gray-100">
            <Text className="text-center text-gray-400 text-sm">VIEW COMPLETE DATA LOG</Text>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View className="bg-white mx-6 rounded-2xl mb-24 overflow-hidden">
          <View className="p-4 border-b border-gray-100">
            <Text className="text-gray-900 text-lg font-semibold">ACCOUNT</Text>
          </View>
          
          <TouchableOpacity 
            className="flex-row items-center justify-between p-4 border-b border-gray-100"
            onPress={handleEditProfile}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="person-outline" size={16} color="#6B7280" />
              </View>
              <Text className="text-gray-900 font-medium">Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          {!isPro && (
            <TouchableOpacity 
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
              onPress={() => setIsSubscriptionModalVisible(true)}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-yellow-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="star" size={16} color="#F59E0B" />
                </View>
                <Text className="text-gray-900 font-medium">Upgrade to Premium</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            className="flex-row items-center justify-between p-4"
            onPress={handleLogout}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="log-out-outline" size={16} color="#EF4444" />
              </View>
              <Text className="text-red-600 font-medium">Sign Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Navigation Bar */}
      <NavigationBar />

      {/* Modals */}
      <EditProfileModal
        visible={isEditProfileVisible}
        onClose={() => setIsEditProfileVisible(false)}
        user={user!}
        onSave={handleSaveProfile}
      />

      <SubscriptionModal
        visible={isSubscriptionModalVisible}
        onClose={() => setIsSubscriptionModalVisible(false)}
      />
    </View>
  );
}