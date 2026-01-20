import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function CameraScreen() {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const device = useCameraDevice('back');

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    const status = await Camera.getCameraPermissionStatus();
    if (status === 'granted') {
      setHasPermission(true);
    } else {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'granted');
    }
  };

  // Mock database of known products
  const knownProducts = [
    '058449880011', // Nature's Path Oats
    '1234567890123', // Mock barcode 1
    '9876543210987', // Mock barcode 2
  ];

  const handleBarcodeScanned = (codes: any[]) => {
    if (!isScanning || codes.length === 0) return;
    
    setIsScanning(false);
    const barcode = codes[0];
    const barcodeValue = barcode.value;
    
    // Simulate API lookup delay
    setTimeout(() => {
      if (knownProducts.includes(barcodeValue)) {
        // Product found - navigate to product detail
        (navigation as any).navigate('ProductDetail', { barcode: barcodeValue });
      } else {
        // Product not found - navigate to add product screen
        (navigation as any).navigate('AddProduct', { barcode: barcodeValue });
      }
    }, 500);
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'upc-a', 'upc-e'],
    onCodeScanned: handleBarcodeScanned,
  });

  const handleManualScan = () => {
    // Simulate scanning a known product
    const mockBarcode = Math.random() > 0.5 ? '058449880011' : 'unknown123456789';
    
    if (knownProducts.includes(mockBarcode)) {
      (navigation as any).navigate('ProductDetail', { barcode: mockBarcode });
    } else {
      (navigation as any).navigate('AddProduct', { barcode: mockBarcode });
    }
  };

  if (!hasPermission) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Ionicons name="camera-outline" size={64} color="white" className="mb-4" />
        <Text className="text-white text-lg mb-4 text-center px-8">
          Camera permission required to scan barcodes
        </Text>
        <TouchableOpacity
          className="bg-orange-400 px-6 py-3 rounded-lg"
          onPress={checkCameraPermission}
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Ionicons name="camera-outline" size={64} color="white" className="mb-4" />
        <Text className="text-white text-lg mb-4">No camera device found</Text>
        <TouchableOpacity
          className="bg-orange-400 px-6 py-3 rounded-lg"
          onPress={handleManualScan}
        >
          <Text className="text-white font-semibold">Try Demo Scan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isScanning}
        codeScanner={codeScanner}
      />
      
      {/* Overlay */}
      <View className="flex-1 justify-between">
        {/* Header */}
        <View className="flex-row justify-between items-center p-6 pt-12">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">Scan Barcode</Text>
          <TouchableOpacity
            onPress={() => setIsScanning(!isScanning)}
            className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
          >
            <Ionicons 
              name={isScanning ? "pause" : "play"} 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>

        {/* Scanning Area */}
        <View className="flex-1 items-center justify-center">
          <View className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
            {/* Corner brackets */}
            <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-400 rounded-tl-lg" />
            <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-400 rounded-tr-lg" />
            <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-400 rounded-bl-lg" />
            <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-400 rounded-br-lg" />
            
            {/* Scanning line animation */}
            {isScanning && (
              <View className="absolute top-1/2 left-0 right-0 h-0.5 bg-orange-400 opacity-80" />
            )}
          </View>
          
          <Text className="text-white text-center mt-6 px-8">
            {isScanning 
              ? "Position the barcode within the frame to scan" 
              : "Scanning paused - tap play to resume"
            }
          </Text>
          
          <View className="flex-row items-center mt-4 bg-black/30 rounded-full px-4 py-2">
            <Ionicons name="information-circle-outline" size={16} color="white" />
            <Text className="text-white text-sm ml-2">
              Supports UPC, EAN, QR codes
            </Text>
          </View>
        </View>

        {/* Bottom Controls */}
        <View className="p-6">
          <TouchableOpacity
            className="bg-orange-400 py-4 rounded-full items-center mb-3"
            onPress={handleManualScan}
          >
            <Text className="text-white font-semibold text-lg">
              Try Demo Scan
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="bg-white/20 py-3 rounded-full items-center"
            onPress={() => (navigation as any).navigate('AddProduct', { barcode: 'manual-entry' })}
          >
            <Text className="text-white font-medium">
              Add Product Manually
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}