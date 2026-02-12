import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getFontStyle } from '../hooks/useFont';

interface CustomHeaderProps {
  title?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  onBackPress,
  showBackButton = true,
  rightComponent,
}) => {
  const { darkMode } = useAuth();

  return (
    <>
      <StatusBar 
        barStyle={darkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={darkMode ? '#1F2937' : '#FFFFFF'} 
      />
      <View 
        className={`${darkMode ? 'bg-gray-800' : 'bg-white'} px-4 pt-12 pb-4 flex-row items-center justify-between`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: darkMode ? 0.3 : 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center flex-1">
          {showBackButton && (
            <TouchableOpacity
              onPress={onBackPress}
              className="mr-4 w-10 h-10 items-center justify-center"
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={darkMode ? '#FFFFFF' : '#000000'} 
              />
            </TouchableOpacity>
          )}
          
          {title && (
            <Text 
              className={`${darkMode ? 'text-white' : 'text-black'} text-lg font-semibold`}
              style={getFontStyle('semibold', 18)}
            >
              {title}
            </Text>
          )}
        </View>
        
        {rightComponent && (
          <View className="ml-4">
            {rightComponent}
          </View>
        )}
      </View>
    </>
  );
};