import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../services/api';

interface DietaryRestriction {
  id: string;
  label: string;
  emoji: string;
  category: 'allergy' | 'diet' | 'medical';
}

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
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
      });

      // Navigate to overview
      navigation.reset({
        index: 0,
        routes: [{ name: 'Overview' }],
      });
    } catch (error) {
      console.error('Error saving dietary profile:', error);
      // Still navigate even if save fails - can update later
      navigation.reset({
        index: 0,
        routes: [{ name: 'Overview' }],
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Overview' }],
    });
  };

  const filteredOptions = DIETARY_OPTIONS.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allergies = filteredOptions.filter(o => o.category === 'allergy');
  const diets = filteredOptions.filter(o => o.category === 'diet');
  const medical = filteredOptions.filter(o => o.category === 'medical');

  return (
    <View className="flex-1 bg-[#f3eee5]">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-gray-900">Dietary Profile</Text>
          <TouchableOpacity onPress={handleSkip} disabled={isSaving}>
            <Text className="text-[#2d5f4f] font-semibold">Skip</Text>
          </TouchableOpacity>
        </View>
        
        <Text className="text-gray-600 mb-4">
          Select any ingredients you need to avoid. We'll warn you when we spot them in scanned products.
        </Text>

        {/* Search Bar */}
        <View className="bg-gray-100 rounded-2xl px-4 py-3 flex-row items-center">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-900"
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

      <ScrollView className="flex-1 px-6 pt-4">
        {/* Common Allergies */}
        {allergies.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="warning" size={18} color="#EF4444" />
              <Text className="text-lg font-bold text-gray-900 ml-2">Common Allergies</Text>
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
              <Text className="text-lg font-bold text-gray-900 ml-2">Diets & Lifestyle</Text>
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
              <Text className="text-lg font-bold text-gray-900 ml-2">Medical Diets</Text>
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

        {/* Info Box */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-6 flex-row">
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <Text className="text-blue-800 text-sm ml-3 flex-1">
            You can always update your dietary preferences later in Settings
          </Text>
        </View>

        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>

      {/* Save Button */}
      <View className="bg-white border-t border-gray-200 px-6 py-4">
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
              {selectedRestrictions.length > 0 ? 'Save Profile' : 'Continue Without Restrictions'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
