import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../context/AuthContext';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: UserProfile;
  onSave: (updatedUser: Partial<UserProfile>) => Promise<void>;
}

export default function EditProfileModal({
  visible,
  onClose,
  user,
  onSave,
}: EditProfileModalProps) {

  if (!user) {
    return null
  }

  const [firstName, setFirstName] = useState(user?.first_name ?? null);
  const [lastName, setLastName] = useState(user?.last_name ?? null);
  const [email, setEmail] = useState(user?.email ?? null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validate inputs
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'FirstName is required');
      return;
    }

    if (!lastName.trim()) {
      Alert.alert('Validation Error', 'LastName is required');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsSaving(true);

      const updatedFields: Partial<UserProfile> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
      };

      await onSave(updatedFields);
      
      Alert.alert('Success', 'Profile updated successfully');
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setEmail(user.email);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View className="flex-1 bg-gray-100">
        {/* Header */}
        <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={handleCancel} disabled={isSaving}>
              <Text className="text-red-600 text-base font-medium">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Edit Profile</Text>
            <TouchableOpacity onPress={handleSave} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#16a34a" />
              ) : (
                <Text className="text-green-600 text-base font-medium">Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1">

          {/* Form Fields */}
          <View className="mx-6 mt-6">
            {/* Name */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">First Name</Text>
              <View className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter your firstname"
                  className="text-gray-900 text-base"
                  editable={!isSaving}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Last Name</Text>
              <View className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Enter your lastname"
                  className="text-gray-900 text-base"
                  editable={!isSaving}
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Email</Text>
              <View className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="text-gray-900 text-base"
                  editable={!isSaving}
                />
              </View>
            </View>

            {/* Info Text */}
            <Text className="text-gray-500 text-sm mt-2">
              Your profile information is used to personalize your experience and for account
              security.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
