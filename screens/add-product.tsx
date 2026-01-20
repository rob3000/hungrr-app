import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function AddProductScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { barcode } = (route.params as { barcode?: string }) || { barcode: 'Unknown' };
  
  const [productData, setProductData] = useState({
    name: '',
    brand: '',
    servingSize: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
    sodium: '',
    ingredients: '',
  });
  
  const [productImage, setProductImage] = useState<string | null>(null);

  const handleTakePhoto = () => {
    Alert.alert(
      'Add Product Photo',
      'Choose how to add a photo of the product',
      [
        { text: 'Take Photo', onPress: () => openCamera() },
        { text: 'Choose from Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = () => {
    // In real app, would open camera to take photo
    setProductImage('https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop');
    Alert.alert('Photo Captured', 'Product photo has been added');
  };

  const openGallery = () => {
    // In real app, would open photo gallery
    setProductImage('https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop');
    Alert.alert('Photo Selected', 'Product photo has been added from gallery');
  };

  const handleSaveProduct = () => {
    if (!productData.name || !productData.brand) {
      Alert.alert('Error', 'Please fill in at least the product name and brand');
      return;
    }

    Alert.alert(
      'Product Saved!',
      'Thank you for contributing to our database. Your product will be reviewed and added.',
      [
        { text: 'Add Another', onPress: () => navigation.goBack() },
        { text: 'Done', onPress: () => (navigation as any).navigate('Overview') }
      ]
    );
  };

  const updateField = (field: string, value: string) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View className="flex-1 bg-gray-100">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white">
          <View className="flex-row items-center justify-between p-4 pt-12">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">Add New Product</Text>
            <View className="w-10" />
          </View>
        </View>

        {/* Product Not Found Message */}
        <View className="bg-orange-50 mx-4 mt-4 rounded-2xl p-6 mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="search" size={24} color="#f59e0b" />
            <Text className="text-orange-600 font-semibold ml-2">Product Not Found</Text>
          </View>
          <Text className="text-gray-700 mb-2">
            We couldn't find this product in our database.
          </Text>
          <Text className="text-sm text-gray-600">
            Barcode: <Text className="font-mono">{barcode}</Text>
          </Text>
          <Text className="text-sm text-gray-600 mt-2">
            Help us by adding the product information below!
          </Text>
        </View>

        {/* Product Photo */}
        <View className="bg-white mx-4 rounded-2xl p-6 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Product Photo</Text>
          
          {productImage ? (
            <View className="items-center">
              <Image 
                source={{ uri: productImage }}
                className="w-48 h-48 rounded-2xl mb-4"
              />
              <TouchableOpacity 
                className="bg-gray-100 rounded-xl px-4 py-2"
                onPress={handleTakePhoto}
              >
                <Text className="text-gray-700 font-medium">Change Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 items-center"
              onPress={handleTakePhoto}
            >
              <Ionicons name="camera" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 font-medium mt-2">Add Product Photo</Text>
              <Text className="text-gray-400 text-sm mt-1">Tap to take a photo or choose from gallery</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Basic Information */}
        <View className="bg-white mx-4 rounded-2xl p-6 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Basic Information</Text>
          
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Product Name *</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
              placeholder="Enter product name"
              value={productData.name}
              onChangeText={(value) => updateField('name', value)}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Brand *</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
              placeholder="Enter brand name"
              value={productData.brand}
              onChangeText={(value) => updateField('brand', value)}
            />
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Serving Size</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
              placeholder="e.g., 1 cup (240ml)"
              value={productData.servingSize}
              onChangeText={(value) => updateField('servingSize', value)}
            />
          </View>
        </View>

        {/* Nutrition Information */}
        <View className="bg-white mx-4 rounded-2xl p-6 mb-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Nutrition Facts (per serving)</Text>
          
          <View className="flex-row space-x-4 mb-4">
            <View className="flex-1">
              <Text className="text-gray-700 font-medium mb-2">Calories</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
                placeholder="0"
                keyboardType="numeric"
                value={productData.calories}
                onChangeText={(value) => updateField('calories', value)}
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-700 font-medium mb-2">Protein (g)</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
                placeholder="0"
                keyboardType="numeric"
                value={productData.protein}
                onChangeText={(value) => updateField('protein', value)}
              />
            </View>
          </View>

          <View className="flex-row space-x-4 mb-4">
            <View className="flex-1">
              <Text className="text-gray-700 font-medium mb-2">Carbs (g)</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
                placeholder="0"
                keyboardType="numeric"
                value={productData.carbs}
                onChangeText={(value) => updateField('carbs', value)}
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-700 font-medium mb-2">Fat (g)</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
                placeholder="0"
                keyboardType="numeric"
                value={productData.fat}
                onChangeText={(value) => updateField('fat', value)}
              />
            </View>
          </View>

          <View className="flex-row space-x-4 mb-4">
            <View className="flex-1">
              <Text className="text-gray-700 font-medium mb-2">Fiber (g)</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
                placeholder="0"
                keyboardType="numeric"
                value={productData.fiber}
                onChangeText={(value) => updateField('fiber', value)}
              />
            </View>
            <View className="flex-1">
              <Text className="text-gray-700 font-medium mb-2">Sugar (g)</Text>
              <TextInput
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
                placeholder="0"
                keyboardType="numeric"
                value={productData.sugar}
                onChangeText={(value) => updateField('sugar', value)}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">Sodium (mg)</Text>
            <TextInput
              className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
              placeholder="0"
              keyboardType="numeric"
              value={productData.sodium}
              onChangeText={(value) => updateField('sodium', value)}
            />
          </View>
        </View>

        {/* Ingredients */}
        <View className="bg-white mx-4 rounded-2xl p-6 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">Ingredients</Text>
          <TextInput
            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 min-h-24"
            placeholder="List all ingredients separated by commas"
            multiline
            textAlignVertical="top"
            value={productData.ingredients}
            onChangeText={(value) => updateField('ingredients', value)}
          />
        </View>

        {/* Action Buttons */}
        <View className="px-4 pb-8">
          <TouchableOpacity 
            className="bg-green-700 rounded-2xl py-4 items-center mb-3"
            onPress={handleSaveProduct}
          >
            <Text className="text-white font-semibold text-lg">Save Product</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-gray-200 rounded-2xl py-4 items-center"
            onPress={() => navigation.goBack()}
          >
            <Text className="text-gray-700 font-semibold text-lg">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}