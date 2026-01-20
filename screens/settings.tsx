import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { storage, STORAGE_KEYS } from '../services/storage';
import { apiClient } from '../services/api';
import EditProfileModal from '../components/EditProfileModal';
import SubscriptionModal from '../components/SubscriptionModal';
import { UserProfile } from '../context/AuthContext';

interface UserPreferences {
  darkMode: boolean;
  notifications: boolean;
  mealReminders: boolean;
  workoutReminders: boolean;
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { logout, darkMode, toggleDarkMode, user, updateUser } = useAuth();
  const { isPro, subscriptionPlan, subscriptionStatus, expiresAt } = useSubscription();
  const [notifications, setNotifications] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isEditProfileVisible, setIsEditProfileVisible] = useState(false);
  const [isSubscriptionModalVisible, setIsSubscriptionModalVisible] = useState(false);

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
        setNotifications(storedPreferences.notifications);
        setMealReminders(storedPreferences.mealReminders);
        setWorkoutReminders(storedPreferences.workoutReminders);
        // Note: darkMode is managed by AuthContext
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  const savePreferences = async (updatedPreferences: Partial<UserPreferences>) => {
    try {
      // Get current preferences
      const currentPreferences: UserPreferences = {
        darkMode,
        notifications,
        mealReminders,
        workoutReminders,
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

  const handleNotificationsToggle = async (value: boolean) => {
    setNotifications(value);
    await savePreferences({ notifications: value });
  };

  const handleMealRemindersToggle = async (value: boolean) => {
    setMealReminders(value);
    await savePreferences({ mealReminders: value });
  };

  const handleWorkoutRemindersToggle = async (value: boolean) => {
    setWorkoutReminders(value);
    await savePreferences({ workoutReminders: value });
  };

  const handleDarkModeToggle = async () => {
    toggleDarkMode();
    // Save dark mode preference after toggle
    await savePreferences({ darkMode: !darkMode });
  };

  // Use actual user data from AuthContext
  const userData = {
    name: user?.name || 'User',
    email: user?.email || 'user@example.com',
    phone: user?.phoneNumber || 'Not set',
    memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
    plan: isPro ? (subscriptionPlan?.name || 'hungrr Pro') : 'Free',
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            (navigation as any).navigate('Login');
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

  const handleManageSubscription = () => {
    Alert.alert(
      'Manage Subscription',
      'To manage your subscription, please visit your App Store or Google Play subscription settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            // Open app store subscription management
            // For iOS: itms-apps://apps.apple.com/account/subscriptions
            // For Android: https://play.google.com/store/account/subscriptions
            Linking.openURL('https://apps.apple.com/account/subscriptions');
          },
        },
      ]
    );
  };

  // Format expiry date if subscription is cancelled
  const getExpiryText = () => {
    if (subscriptionStatus === 'cancelled' && expiresAt) {
      const expiryDate = new Date(expiresAt);
      const formattedDate = expiryDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
      return `Access until ${formattedDate}`;
    }
    return null;
  };

  return (
    <View className="flex-1 bg-[#f3eee5]">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white pt-12 pb-6 px-6">
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Settings</Text>
            <View className="w-10" />
          </View>

          {/* Profile Section */}
          <View className="items-center">
            <View className="w-24 h-24 rounded-full bg-[#2d5f4f] items-center justify-center mb-4">
              <Text className="text-white text-4xl font-bold">
                {userData.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">{userData.name}</Text>
            <Text className="text-gray-600 mt-1">{userData.email}</Text>
            <View className={`${isPro ? 'bg-green-100' : 'bg-gray-100'} rounded-full px-4 py-1 mt-3`}>
              <Text className={`${isPro ? 'text-green-700' : 'text-gray-700'} font-medium text-sm`}>{userData.plan}</Text>
            </View>
          </View>
        </View>

        {/* Subscription Section */}
        <View className="mx-6 mt-6 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Subscription</Text>
          
          <View className="bg-white rounded-2xl overflow-hidden">
            <View className="p-4 border-b border-gray-100">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-600 text-sm">Current Plan</Text>
                <View className={`${isPro ? 'bg-green-100' : 'bg-gray-100'} rounded-full px-3 py-1`}>
                  <Text className={`${isPro ? 'text-green-700' : 'text-gray-700'} font-medium text-xs`}>
                    {isPro ? 'PRO' : 'FREE'}
                  </Text>
                </View>
              </View>
              <Text className="text-gray-900 font-bold text-lg">{userData.plan}</Text>
              {subscriptionPlan && isPro && (
                <Text className="text-gray-600 text-sm mt-1">
                  ${subscriptionPlan.price}/{subscriptionPlan.interval === 'yearly' ? 'year' : 'month'}
                </Text>
              )}
              {subscriptionStatus === 'cancelled' && (
                <Text className="text-orange-600 text-sm mt-2">
                  ⚠️ {getExpiryText()}
                </Text>
              )}
            </View>

            {isPro && (
              <TouchableOpacity
                className="flex-row items-center justify-between p-4"
                onPress={handleManageSubscription}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="card-outline" size={20} color="#374151" />
                  </View>
                  <Text className="text-gray-900 font-medium">Manage Subscription</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}

            {!isPro && (
              <TouchableOpacity
                className="flex-row items-center justify-between p-4 bg-green-50"
                onPress={() => setIsSubscriptionModalVisible(true)}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="star" size={20} color="#16a34a" />
                  </View>
                  <Text className="text-green-700 font-medium">Upgrade to Pro</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#16a34a" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Account Details */}
        <View className="mx-6 mt-6 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">Account Details</Text>
          
          <View className="bg-white rounded-2xl overflow-hidden">
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
              onPress={handleEditProfile}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="person-outline" size={20} color="#374151" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-600 text-sm">Full Name</Text>
                  <Text className="text-gray-900 font-medium">{userData.name}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
              onPress={handleEditProfile}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="mail-outline" size={20} color="#374151" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-600 text-sm">Email</Text>
                  <Text className="text-gray-900 font-medium">{userData.email}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-100"
              onPress={handleEditProfile}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="call-outline" size={20} color="#374151" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-600 text-sm">Phone</Text>
                  <Text className="text-gray-900 font-medium">{userData.phone}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={handleEditProfile}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="calendar-outline" size={20} color="#374151" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-600 text-sm">Member Since</Text>
                  <Text className="text-gray-900 font-medium">{userData.memberSince}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Preferences */}
        <View className="mx-6 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">App Preferences</Text>
          
          <View className="bg-white rounded-2xl overflow-hidden">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name={darkMode ? "moon" : "sunny"} size={20} color="#374151" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">Dark Mode</Text>
                  <Text className="text-gray-600 text-sm">
                    {darkMode ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={darkMode ? '#16a34a' : '#f3f4f6'}
              />
            </View>

            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="notifications-outline" size={20} color="#374151" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">Push Notifications</Text>
                  <Text className="text-gray-600 text-sm">
                    {notifications ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={notifications ? '#16a34a' : '#f3f4f6'}
              />
            </View>

            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="restaurant-outline" size={20} color="#374151" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">Meal Reminders</Text>
                  <Text className="text-gray-600 text-sm">
                    {mealReminders ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={mealReminders}
                onValueChange={handleMealRemindersToggle}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={mealReminders ? '#16a34a' : '#f3f4f6'}
              />
            </View>

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="barbell-outline" size={20} color="#374151" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">Workout Reminders</Text>
                  <Text className="text-gray-600 text-sm">
                    {workoutReminders ? 'Enabled' : 'Disabled'}
                  </Text>
                </View>
              </View>
              <Switch
                value={workoutReminders}
                onValueChange={handleWorkoutRemindersToggle}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={workoutReminders ? '#16a34a' : '#f3f4f6'}
              />
            </View>
          </View>
        </View>

        {/* Other Options */}
        <View className="mx-6 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-3">More</Text>
          
          <View className="bg-white rounded-2xl overflow-hidden">
            <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="shield-checkmark-outline" size={20} color="#374151" />
                </View>
                <Text className="text-gray-900 font-medium">Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="help-circle-outline" size={20} color="#374151" />
                </View>
                <Text className="text-gray-900 font-medium">Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="information-circle-outline" size={20} color="#374151" />
                </View>
                <Text className="text-gray-900 font-medium">About</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              onPress={handleLogout}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="log-out-outline" size={20} color="#dc2626" />
                </View>
                <Text className="text-red-600 font-medium">Logout</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <View className="items-center pb-8">
          <Text className="text-gray-500 text-sm">hungrr v1.0.0</Text>
          <Text className="text-gray-400 text-xs mt-1">© 2024 Athlete Performance</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      {user && (
        <EditProfileModal
          visible={isEditProfileVisible}
          onClose={() => setIsEditProfileVisible(false)}
          user={user}
          onSave={handleSaveProfile}
        />
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        visible={isSubscriptionModalVisible}
        onClose={() => setIsSubscriptionModalVisible(false)}
        trigger="feature_access"
      />
    </View>
  );
}