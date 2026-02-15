import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Linking, ActivityIndicator, ToastAndroid, Platform, TextInput, Modal } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../services/api';
import ScanLimiterService from '../services/scan-limiter';
import { useSubscription } from '../context/SubscriptionContext';
import SubscriptionModal from '../components/SubscriptionModal';

export default function CameraScreen() {
  const navigation = useNavigation();
  const { isPro } = useSubscription();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanFeedback, setScanFeedback] = useState<string>('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const device = useCameraDevice('back');

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      // For iOS, use Alert as a fallback
      Alert.alert('', message, [{ text: 'OK' }], { cancelable: true });
    }
  };

  const checkCameraPermission = async () => {
    try {
      const status = await Camera.getCameraPermissionStatus();
      
      if (status === 'granted') {
        setHasPermission(true);
      } else if (status === 'not-determined') {
        // Request permission
        const permission = await Camera.requestCameraPermission();
        setHasPermission(permission === 'granted');
        
        if (permission === 'denied') {
          Alert.alert(
            'Camera Permission Required',
            'Camera access is needed to scan product barcodes. Please enable it in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
        }
      } else {
        // Permission was previously denied
        setHasPermission(false);
      }
    } catch (error) {
      console.error('Error checking camera permission:', error);
      setHasPermission(false);
      Alert.alert('Error', 'Failed to check camera permissions. Please try again.');
    }
  };

  const handleBarcodeScanned = async (codes: any[]) => {
    if (!isScanning || codes.length === 0 || isProcessing) return;
    
    const barcode = codes[0];
    const barcodeValue = barcode.value;
    
    if (!barcodeValue) return;
    
    // Check if user can scan (for free users)
    if (!isPro) {
      const canScan = await ScanLimiterService.canScan(isPro);
      
      if (!canScan) {
        // User has reached their scan limit
        setIsScanning(false);
        setShowSubscriptionModal(true);
        return;
      }
    }
    
    // Prevent multiple scans
    setIsScanning(false);
    setIsProcessing(true);
    setScanFeedback('Scanning...');
    
    try {
      // Call the API to look up the product
      const response = await apiClient.scanProduct(barcodeValue);
      console.info("scan result!", response)
      if (response.success && response.data) {
        setScanFeedback('Product found!');
        
        // Decrement scan count for free users after successful scan
        if (!isPro) {
          const scansRemaining = await ScanLimiterService.decrementScans();
          
          // Show warning toast if 3 or fewer scans remaining
          if (scansRemaining <= 3 && scansRemaining > 0) {
            showToast(`⚠️ ${scansRemaining} scan${scansRemaining === 1 ? '' : 's'} remaining today`);
          }
        }

        // Navigate to product detail screen
        setTimeout(() => {
          (navigation as any).navigate('ProductDetail', { product: response.data?.product });
          setIsProcessing(false);
          setScanFeedback('');
        }, 500);
      } else {
        // Product not found - navigate to add product screen
        setScanFeedback('Product not found');
        
        // Decrement scan count for free users even if product not found
        if (!isPro) {
          const scansRemaining = await ScanLimiterService.decrementScans();
          
          // Show warning toast if 3 or fewer scans remaining
          if (scansRemaining <= 3 && scansRemaining > 0) {
            showToast(`⚠️ ${scansRemaining} scan${scansRemaining === 1 ? '' : 's'} remaining today`);
          }
        }
        
        setTimeout(() => {
          (navigation as any).navigate('ProductNotFound', { barcode: barcodeValue });
          setIsProcessing(false);
          setScanFeedback('');
        }, 500);
      }
    } catch (error) {
      console.error('Error scanning barcode:', error);
      setScanFeedback('Scan failed');
      
      Alert.alert(
        'Scan Error',
        'Failed to look up product. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsScanning(true);
              setIsProcessing(false);
              setScanFeedback('');
            }
          }
        ]
      );
    }
  };

  const handleManualBarcodeSubmit = async () => {
    if (!manualBarcode.trim()) {
      Alert.alert('Error', 'Please enter a barcode');
      return;
    }

    // Check if user can scan (for free users)
    if (!isPro) {
      const canScan = await ScanLimiterService.canScan(isPro);
      
      if (!canScan) {
        setShowManualEntry(false);
        setShowSubscriptionModal(true);
        return;
      }
    }

    setShowManualEntry(false);
    setIsProcessing(true);
    setScanFeedback('Looking up barcode...');
    
    try {
      const response = await apiClient.scanProduct(manualBarcode.trim());
      console.info('MANUAL BARCODE!', response)
      if (response.success && response.data) {
        setScanFeedback('Product found!');
        
        // Decrement scan count for free users after successful scan
        if (!isPro) {
          const scansRemaining = await ScanLimiterService.decrementScans();
          
          if (scansRemaining <= 3 && scansRemaining > 0) {
            showToast(`⚠️ ${scansRemaining} scan${scansRemaining === 1 ? '' : 's'} remaining today`);
          }
        }
        
        setTimeout(() => {
          (navigation as any).navigate('ProductDetail', { product: response.data?.product });
          setIsProcessing(false);
          setScanFeedback('');
          setManualBarcode('');
        }, 500);
      } else {
        setScanFeedback('Product not found');
        
        // Decrement scan count for free users even if product not found
        if (!isPro) {
          const scansRemaining = await ScanLimiterService.decrementScans();
          
          if (scansRemaining <= 3 && scansRemaining > 0) {
            showToast(`⚠️ ${scansRemaining} scan${scansRemaining === 1 ? '' : 's'} remaining today`);
          }
        }
        
        setTimeout(() => {
          (navigation as any).navigate('ProductNotFound', { barcode: manualBarcode.trim() });
          setIsProcessing(false);
          setScanFeedback('');
          setManualBarcode('');
        }, 500);
      }
    } catch (error) {
      console.error('Error looking up barcode:', error);
      Alert.alert('Error', 'Failed to look up barcode. Please try again.');
      setIsProcessing(false);
      setScanFeedback('');
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128', 'code-39', 'upc-a', 'upc-e', 'code-93', 'codabar'],
    onCodeScanned: handleBarcodeScanned,
  });

  const handleOpenSettings = () => {
    Alert.alert(
      'Camera Permission Required',
      'To scan product barcodes, please enable camera access in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() }
      ]
    );
  };

  if (hasPermission === null) {
    // Still checking permissions
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#FB923C" />
        <Text className="text-white text-lg mt-4">Checking camera permissions...</Text>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Ionicons name="camera-outline" size={80} color="white" className="mb-6" />
        <Text className="text-white text-2xl font-bold mb-4 text-center">
          Camera Access Required
        </Text>
        <Text className="text-white/80 text-base mb-8 text-center">
          To scan product barcodes and identify IBS-safe foods, we need access to your camera.
        </Text>
        <TouchableOpacity
          className="bg-orange-400 px-8 py-4 rounded-full mb-4 w-full"
          onPress={handleOpenSettings}
        >
          <Text className="text-white font-semibold text-center text-lg">
            Open Settings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white/20 px-8 py-4 rounded-full w-full"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-medium text-center">
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View className="flex-1 bg-black items-center justify-center px-8">
        <Ionicons name="camera-outline" size={80} color="white" className="mb-6" />
        <Text className="text-white text-2xl font-bold mb-4 text-center">
          No Camera Found
        </Text>
        <Text className="text-white/80 text-base mb-8 text-center">
          We couldn't detect a camera on your device. You can try a demo scan or add products manually.
        </Text>
        <TouchableOpacity
          className="bg-white/20 px-8 py-4 rounded-full w-full"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-medium text-center">
            Go Back
          </Text>
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
            {isScanning && !isProcessing && (
              <View className="absolute top-1/2 left-0 right-0 h-0.5 bg-orange-400 opacity-80" />
            )}
            
            {/* Processing indicator */}
            {isProcessing && (
              <View className="absolute inset-0 items-center justify-center bg-black/30 rounded-lg">
                <ActivityIndicator size="large" color="#FB923C" />
              </View>
            )}
          </View>
          
          {/* Feedback text */}
          {scanFeedback ? (
            <View className="mt-6 bg-[#D1E758] rounded-full px-6 py-3">
              <Text className="text-[#181A2C] font-semibold text-center">
                {scanFeedback}
              </Text>
            </View>
          ) : (
            <Text className="text-white text-center mt-6 px-8">
              {isScanning 
                ? "Position the barcode within the frame to scan" 
                : "Scanning paused - tap play to resume"
              }
            </Text>
          )}
        </View>

        {/* Bottom Controls */}
        <View className="p-6 pb-8">          
          <TouchableOpacity
            className="bg-white/20 py-3 rounded-full items-center mb-3"
            onPress={() => setShowManualEntry(true)}
            disabled={isProcessing}
          >
            <Text className="text-white font-medium">
              Enter Barcode Manually
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="bg-white/10 py-3 rounded-full items-center"
            onPress={() => (navigation as any).navigate('ProductNotFound', { barcode: 'manual-entry' })}
            disabled={isProcessing}
          >
            <Text className="text-white font-medium">
              Add Product Without Barcode
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Manual Barcode Entry Modal */}
      <Modal
        visible={showManualEntry}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManualEntry(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-8">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-gray-900">Enter Barcode</Text>
              <TouchableOpacity onPress={() => setShowManualEntry(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-gray-600 mb-4">
              Enter the barcode number found on the product packaging
            </Text>
            
            <TextInput
              className="bg-gray-100 rounded-xl px-4 py-3 text-lg text-gray-900 mb-4 border-2 border-gray-300"
              placeholder="e.g., 058449880011"
              placeholderTextColor="#9CA3AF"
              value={manualBarcode}
              onChangeText={setManualBarcode}
              keyboardType="number-pad"
              autoFocus
            />
            
            <TouchableOpacity
              className="bg-[#D1E758] py-4 rounded-full items-center"
              onPress={handleManualBarcodeSubmit}
              disabled={!manualBarcode.trim()}
              style={{ opacity: manualBarcode.trim() ? 1 : 0.5 }}
            >
              <Text className="text-[#181A2C] font-semibold text-lg">
                Find Product
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Subscription Modal */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => {
          setShowSubscriptionModal(false);
          setIsScanning(true);
        }}
        trigger="scan_limit"
      />
    </View>
  );
}