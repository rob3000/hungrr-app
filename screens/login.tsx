import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    // Simple validation - in real app, you'd authenticate with backend
    if (email.includes('@') && password.length >= 6) {
      login();
      navigation.navigate('Overview');
    } else {
      Alert.alert('Error', 'Invalid email or password (password must be 6+ characters)');
    }
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="items-center pt-16 pb-8">
        <Image 
          source={require('../assets/logo.png')} 
          height={8} width={8} resizeMode="contain" className='w-44'
        />
      </View>

      {/* Login Form */}
      <View className="flex-1 px-6">
        <View className="p-6 mb-6">
          <Text className="text-2xl font-bold text-primary mb-6 text-center">Welcome Back </Text>
          
          {/* Email Input */}
          <View className="mb-4 bg-white rounded-3xl ">
            <Text className="text-gray-700 text-sm font-medium mb-2">Email</Text>
            <View className="bg-gray-50 rounded-2xl px-4 py-4 flex-row items-center">
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-6 bg-white rounded-3xl ">
            <Text className="text-gray-700 text-sm font-medium mb-2">Password</Text>
            <View className="bg-gray-50 rounded-2xl px-4 py-4 flex-row items-center">
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-gray-900"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className="bg-green-700 rounded-2xl py-4 items-center mb-4"
            onPress={handleLogin}
          >
            <Text className="text-white font-semibold text-lg">Sign In</Text>
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity className="items-center mb-4">
            <Text className="text-green-700 font-medium">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600">Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text className="text-green-700 font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}