import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface DietaryRestriction {
  id: string;
  label: string;
  emoji: string;
  category: 'allergy' | 'diet' | 'medical';
}

interface FODMAPLevels {
  fructose: number;
  lactose: number;
  fructans: number;
  gos: number;
  sorbitol: number;
  mannitol: number;
}

const FODMAP_TYPES = [
  { id: 'fructose', label: 'Fructose' },
  { id: 'lactose', label: 'Lactose' },
  { id: 'fructans', label: 'Fructans' },
  { id: 'gos', label: 'GOS' },
  { id: 'sorbitol', label: 'Sorbitol' },
  { id: 'mannitol', label: 'Mannitol' },
];

const DIETARY_OPTIONS: DietaryRestriction[] = [
  // Common Allergies
  { id: 'peanuts', label: 'Peanuts', emoji: '🥜', category: 'allergy' },
  { id: 'dairy', label: 'Dairy', emoji: '🥛', category: 'allergy' },
  { id: 'gluten', label: 'Gluten', emoji: '🌾', category: 'allergy' },
  { id: 'eggs', label: 'Eggs', emoji: '🥚', category: 'allergy' },
  { id: 'shellfish', label: 'Shellfish', emoji: '🦐', category: 'allergy' },
  { id: 'soy', label: 'Soy', emoji: '🌱', category: 'allergy' },
  
  // Diets & Lifestyle
  { id: 'vegan', label: 'Vegan', emoji: '🥬', category: 'diet' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗', category: 'diet' },
  { id: 'keto', label: 'Keto', emoji: '🥓', category: 'diet' },
  { id: 'paleo', label: 'Paleo', emoji: '🥑', category: 'diet' },
  { id: 'halal', label: 'Halal', emoji: '☪️', category: 'diet' },
  { id: 'kosher', label: 'Kosher', emoji: '✡️', category: 'diet' },
  
  // Medical Diets
  { id: 'low_fodmap', label: 'Low FODMAP', emoji: '🔬', category: 'medical' },
  { id: 'sibo_friendly', label: 'SIBO-friendly', emoji: '💚', category: 'medical' },
  { id: 'diabetic', label: 'Diabetic', emoji: '🩺', category: 'medical' },
  { id: 'low_sodium', label: 'Low Sodium', emoji: '🧂', category: 'medical' },
];

export default function DietaryProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { darkMode } = useAuth();
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [fodmapLevels, setFodmapLevels] = useState<FODMAPLevels>({
    fructose: 0.5,
    lactose: 0.5,
    fructans: 0.5,
    gos: 0.5,
    sorbitol: 0.5,
    mannitol: 0.5,
  });

  // Check if we came from settings (to determine navigation behavior)
  const isFromSettings = route.params?.fromSettings || false;

  const toggleRestriction = (id: string) => {
    setSelectedRestrictions(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Save dietary profile to backend
      await apiClient.saveDietaryProfile({
        restrictions: selectedRestrictions,
        fodmapLevels: selectedRestrictions.includes('low_fodmap') ? fodmapLevels : undefined,
      });

      // Navigate based on where we came from
      if (isFromSettings) {
        navigation.goBack();
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Overview' }],
        });
      }
    } catch (error) {
      console.error('Error saving dietary profile:', error);
      // Still navigate even if save fails - can update later
      if (isFromSettings) {
        navigation.goBack();
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Overview' }],
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getSensitivityLabel = (value: number): string => {
    if (value < 0.25) return 'INACTIVE';
    if (value < 0.5) return 'LOW';
    if (value < 0.75) return 'MODERATE';
    return 'HIGH SENSITIVITY';
  };

  const getSensitivityColor = (value: number): string => {
    if (value < 0.25) return '#9CA3AF';
    if (value < 0.5) return '#10B981';
    if (value < 0.75) return '#F59E0B';
    return '#EF4444';
  };

  const handleSkip = () => {
    if (isFromSettings) {
      navigation.goBack();
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Overview' }],
      });
    }
  };

  const filteredOptions = DIETARY_OPTIONS.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allergies = filteredOptions.filter(o => o.category === 'allergy');
  const diets = filteredOptions.filter(o => o.category === 'diet');
  const medical = filteredOptions.filter(o => o.category === 'medical');

  return (
    <View className={`flex-1 ${darkMode ? 'bg-gray-900' : 'bg-[#f3eee5]'}`}>
      {/* Header - only show when not from settings */}
      {!isFromSettings && (
        <View className={`${darkMode ? 'bg-gray-800' : 'bg-white'} pt-12 pb-4 px-6`}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Dietary Profile
            </Text>
            <TouchableOpacity onPress={handleSkip} disabled={isSaving}>
              <Text className="text-[#2d5f4f] font-semibold">Skip</Text>
            </TouchableOpacity>
          </View>
          
          <Text className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            Select any ingredients you need to avoid. We'll warn you when we spot them in scanned products.
          </Text>

          {/* Search Bar */}
          <View className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-2xl px-4 py-3 flex-row items-center`}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className={`flex-1 ml-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
              placeholder="Search specific ingredients (e.g. Citric Acid)"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Search Bar for settings mode */}
      {isFromSettings && (
        <View className={`${darkMode ? 'bg-gray-800' : 'bg-white'} pb-4 px-6`}>
          <Text className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            Select any ingredients you need to avoid. We'll warn you when we spot them in scanned products.
          </Text>
          
          <View className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-2xl px-4 py-3 flex-row items-center`}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className={`flex-1 ml-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}
              placeholder="Search specific ingredients (e.g. Citric Acid)"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <ScrollView className="flex-1 px-6 pt-4">
        {/* Common Allergies */}
        {allergies.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="warning" size={18} color="#EF4444" />
              <Text className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} ml-2`}>Common Allergies</Text>
            </View>
            <View className="flex-row flex-wrap">
              {allergies.map(option => {
                const isSelected = selectedRestrictions.includes(option.id);
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => toggleRestriction(option.id)}
                    className={`rounded-full px-4 py-2 mr-2 mb-2 flex-row items-center ${
                      isSelected ? 'bg-[#2d5f4f]' : 'bg-white'
                    }`}
                    style={{
                      borderWidth: 1,
                      borderColor: isSelected ? '#2d5f4f' : '#E5E7EB',
                    }}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="white" className="mr-1" />
                    )}
                    <Text className="mr-1">{option.emoji}</Text>
                    <Text
                      className={`font-medium ${
                        isSelected ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Diets & Lifestyle */}
        {diets.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="leaf" size={18} color="#10B981" />
              <Text className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} ml-2`}>Diets & Lifestyle</Text>
            </View>
            <View className="flex-row flex-wrap">
              {diets.map(option => {
                const isSelected = selectedRestrictions.includes(option.id);
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => toggleRestriction(option.id)}
                    className={`rounded-full px-4 py-2 mr-2 mb-2 flex-row items-center ${
                      isSelected ? 'bg-[#2d5f4f]' : 'bg-white'
                    }`}
                    style={{
                      borderWidth: 1,
                      borderColor: isSelected ? '#2d5f4f' : '#E5E7EB',
                    }}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="white" className="mr-1" />
                    )}
                    <Text className="mr-1">{option.emoji}</Text>
                    <Text
                      className={`font-medium ${
                        isSelected ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Medical Diets */}
        {medical.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="medical" size={18} color="#3B82F6" />
              <Text className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} ml-2`}>Medical Diets</Text>
            </View>
            <View className="flex-row flex-wrap">
              {medical.map(option => {
                const isSelected = selectedRestrictions.includes(option.id);
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => toggleRestriction(option.id)}
                    className={`rounded-full px-4 py-2 mr-2 mb-2 flex-row items-center ${
                      isSelected ? 'bg-[#2d5f4f]' : 'bg-white'
                    }`}
                    style={{
                      borderWidth: 1,
                      borderColor: isSelected ? '#2d5f4f' : '#E5E7EB',
                    }}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="white" className="mr-1" />
                    )}
                    <Text className="mr-1">{option.emoji}</Text>
                    <Text
                      className={`font-medium ${
                        isSelected ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* FODMAP Sensitivity Levels */}
        {selectedRestrictions.includes('low_fodmap') && (
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Text className="text-sm font-medium text-gray-500">● FODMAP Sensitivity Levels</Text>
            </View>
            <Text className="text-xs text-gray-500 mb-4">
              Indicate how sensitive you are to common FODMAP ingredients for each category
            </Text>

            {FODMAP_TYPES.map((fodmap) => {
              const value = fodmapLevels[fodmap.id as keyof FODMAPLevels];
              const label = getSensitivityLabel(value);
              const color = getSensitivityColor(value);

              return (
                <View key={fodmap.id} className="mb-4">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className={`text-base font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{fodmap.label}</Text>
                    <Text className="text-xs font-bold" style={{ color }}>
                      {label}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-xs text-gray-400 mr-2">Low</Text>
                    <Slider
                      style={{ flex: 1, height: 40 }}
                      minimumValue={0}
                      maximumValue={1}
                      value={value}
                      onValueChange={(val: number) =>
                        setFodmapLevels((prev) => ({
                          ...prev,
                          [fodmap.id]: val,
                        }))
                      }
                      minimumTrackTintColor="#2d5f4f"
                      maximumTrackTintColor="#E5E7EB"
                      thumbTintColor="#2d5f4f"
                    />
                    <Text className="text-xs text-gray-400 ml-2">High</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Info Box */}
        <View className={`${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'} rounded-2xl p-4 mb-6 flex-row`}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <Text className={`${darkMode ? 'text-blue-300' : 'text-blue-800'} text-sm ml-3 flex-1`}>
            You can always update your dietary preferences later in Settings
          </Text>
        </View>

        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>

      {/* Save Button */}
      <View className={`${darkMode ? 'bg-gray-800' : 'bg-white'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-6 py-4`}>
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center ${
            isSaving ? 'bg-gray-400' : 'bg-[#2d5f4f]'
          }`}
          onPress={handleSaveProfile}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-lg">
              {selectedRestrictions.length > 0 ? (isFromSettings ? 'Update Profile' : 'Save Profile') : 'Continue Without Restrictions'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
