import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner, useFrameProcessor } from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { runOnJS } from 'react-native-reanimated';

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

    const handleBarcodeScanned = (barcodes: any[]) => {
        if (!isScanning || barcodes.length === 0) return;

        setIsScanning(false);
        const barcode = barcodes[0];

        Alert.alert(
            'Barcode Scanned!',
            `Type: ${barcode.format}\nValue: ${barcode.value}`,
            [
                {
                    text: 'Scan Another',
                    onPress: () => setIsScanning(true),
                },
                {
                    text: 'Done',
                    onPress: () => navigation.goBack(),
                },
            ]
        );
    };

    const codeScanner = useCodeScanner({
        codeTypes: ['code-128', 'code-39','ean-13', 'ean-8', 'upc-a', 'upc-e'],
        onCodeScanned: (codes) => {
            console.log(`Scanned ${codes.length} codes!`)
        }
    })

    if (!hasPermission) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white text-lg mb-4">Camera permission required</Text>
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
                <Text className="text-white text-lg">No camera device found</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
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
                    <View className="w-10" />
                </View>

                {/* Scanning Area */}
                <View className="flex-1 items-center justify-center">
                    <View className="w-64 h-64 border-2 border-white/50 rounded-lg">
                        <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-400 rounded-tl-lg" />
                        <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-400 rounded-tr-lg" />
                        <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-400 rounded-bl-lg" />
                        <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-400 rounded-br-lg" />
                    </View>
                    <Text className="text-white text-center mt-6 px-8">
                        Position the barcode within the frame to scan
                    </Text>
                </View>

                {/* Bottom Controls */}
                <View className="p-6">
                    <TouchableOpacity
                        className="bg-orange-400 py-4 rounded-full items-center"
                        onPress={() => setIsScanning(!isScanning)}
                    >
                        <Text className="text-white font-semibold text-lg">
                            {isScanning ? 'Pause Scanning' : 'Resume Scanning'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}