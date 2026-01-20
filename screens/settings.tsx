import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1">
      <ScrollView className="flex-1">
        <Text>Some settings</Text>
      </ScrollView>
    </View>
  );
}