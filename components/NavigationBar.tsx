import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getFontStyle } from '../hooks/useFont';
import { useAuth } from '../context/AuthContext';

export const NavigationBar = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { darkMode } = useAuth();

    const handleProfilePress = () => {
        (navigation as any).navigate('Settings');
    };

    const isActive = (routeName: string) => route.name === routeName;

    return (
        <View className={`absolute bottom-4 left-4 right-4 rounded-[24px] ${darkMode ? 'bg-gray-800' : 'bg-[#181A2C]'}`} style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}>
        <View className="flex-row items-center justify-around py-4 px-6">
          <TouchableOpacity 
            className="items-center flex-1"
            onPress={() => (navigation as any).navigate('Overview')}
          >
            <Ionicons name="home" size={24} color={isActive('Overview') ? "#D1E758" : "#9CA3AF"} />
            <Text className={`text-xs mt-1 ${isActive('Overview') ? 'text-[#D1E758]' : 'text-gray-400'}`} style={getFontStyle('medium', 12)}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="items-center flex-1"
            onPress={() => (navigation as any).navigate('Search')}
          >
            <Ionicons name="search-outline" size={24} color={isActive('Search') ? "#D1E758" : "#9CA3AF"} />
            <Text className={`text-xs mt-1 ${isActive('Search') ? 'text-[#D1E758]' : 'text-gray-400'}`} style={getFontStyle('regular', 12)}>Explore</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="items-center flex-1"
            onPress={() => (navigation as any).navigate('Camera')}
          >
            <View className="w-12 h-12 bg-[#D1E758] rounded-full items-center justify-center mb-2">
              <Ionicons name="barcode-outline" size={24} color="#181A2C" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="items-center flex-1"
            onPress={() => (navigation as any).navigate('SavedItems')}
          >
            <Ionicons name="bookmark-outline" size={24} color={isActive('SavedItems') ? "#D1E758" : "#9CA3AF"} />
            <Text className={`text-xs mt-1 ${isActive('SavedItems') ? 'text-[#D1E758]' : 'text-gray-400'}`} style={getFontStyle('regular', 12)}>Saved</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="items-center flex-1"
            onPress={handleProfilePress}
          >
            <Ionicons name="person-outline" size={24} color={isActive('Settings') ? "#D1E758" : "#9CA3AF"} />
            <Text className={`text-xs mt-1 ${isActive('Settings') ? 'text-[#D1E758]' : 'text-gray-400'}`} style={getFontStyle('regular', 12)}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
}