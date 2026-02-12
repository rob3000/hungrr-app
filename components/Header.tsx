import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export const Header = () => {
    const { darkMode } = useAuth();

    return (
        <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center">
                <View className="w-8 h-8 bg-[#D1E758] rounded-lg items-center justify-center mr-3">
                    <Text className="text-black font-bold text-lg">h</Text>
                     {/* <Image source={require('../assets/logo-small.png')} width={12} height={12} /> */}
                </View>
                <Text className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>hungrr</Text>
            </View>
            <TouchableOpacity className="w-10 h-10 items-center justify-center">
                <Ionicons name="notifications-outline" size={24} color={darkMode ? "#D1E758" : "#181A2C"} />
            </TouchableOpacity>
        </View>
    )
}