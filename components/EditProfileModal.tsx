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
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
  const [profileImage, setProfileImage] = useState(user.profileImage || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validate inputs
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
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
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        profileImage: profileImage.trim() || undefined,
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
    setName(user.name);
    setEmail(user.email);
    setPhoneNumber(user.phoneNumber || '');
    setProfileImage(user.profileImage || '');
    onClose();
  };

  const handleChangePhoto = () => {
    Alert.alert(
      'Change Photo',
      'Photo upload feature coming soon! For now, you can enter an image URL.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enter URL',
          onPress: () => {
            Alert.prompt(
              'Profile Image URL',
              'Enter the URL of your profile image:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Save',
                  onPress: (url?: string) => {
                    if (url) {
                      setProfileImage(url);
                    }
                  },
                },
              ],
              'plain-text',
              profileImage
            );
          },
        },
      ]
    );
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
          {/* Profile Photo */}
          <View className="bg-white py-6 items-center border-b border-gray-200">
            <View className="relative">
              <Image
                source={{
                  uri: profileImage || 'https://via.placeholder.com/120',
                }}
                className="w-24 h-24 rounded-full"
              />
              <TouchableOpacity
                className="absolute bottom-0 right-0 w-8 h-8 bg-orange-400 rounded-full items-center justify-center"
                onPress={handleChangePhoto}
                disabled={isSaving}
              >
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleChangePhoto} disabled={isSaving}>
              <Text className="text-orange-500 font-medium mt-3">Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View className="mx-6 mt-6">
            {/* Name */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Full Name</Text>
              <View className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
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

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Phone Number</Text>
              <View className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                <TextInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
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
