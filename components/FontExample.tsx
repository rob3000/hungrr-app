import React from 'react';
import { View, Text } from 'react-native';
import { getFontStyle, useFont } from '../hooks/useFont';

export const FontExample = () => {
  // Method 1: Using the hook
  const regularFont = useFont('regular');
  const boldFont = useFont('bold');

  return (
    <View className="p-4">
      {/* Method 1: Using the hook with style prop */}
      <Text style={{ fontFamily: regularFont, fontSize: 16 }}>
        Regular text using hook
      </Text>
      
      <Text style={{ fontFamily: boldFont, fontSize: 18 }}>
        Bold text using hook
      </Text>

      {/* Method 2: Using the getFontStyle helper */}
      <Text style={getFontStyle('medium', 16)}>
        Medium text using helper
      </Text>

      <Text style={getFontStyle('semiBold', 20)}>
        SemiBold text using helper
      </Text>

      {/* Method 3: Using Tailwind classes (if you prefer) */}
      <Text className="font-jakarta text-base">
        Regular text with Tailwind
      </Text>

      <Text className="font-jakarta-bold text-lg">
        Bold text with Tailwind
      </Text>

      {/* Different weights */}
      <Text style={getFontStyle('extraLight', 14)}>Extra Light</Text>
      <Text style={getFontStyle('light', 14)}>Light</Text>
      <Text style={getFontStyle('regular', 14)}>Regular</Text>
      <Text style={getFontStyle('medium', 14)}>Medium</Text>
      <Text style={getFontStyle('semiBold', 14)}>Semi Bold</Text>
      <Text style={getFontStyle('bold', 14)}>Bold</Text>
      <Text style={getFontStyle('extraBold', 14)}>Extra Bold</Text>
    </View>
  );
};