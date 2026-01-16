import { useNavigation } from '@react-navigation/native';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Overview() {
  const navigation = useNavigation();

  const weekDays = [
    { day: 'MON', date: '22' },
    { day: 'TUE', date: '23' },
    { day: 'TODAY', date: '24', isToday: true },
    { day: 'THU', date: '25' },
    { day: 'FRI', date: '26' },
    { day: 'SAT', date: '27' },
  ];

  return (
    <View className="flex-1">
      <ScrollView className="flex-1">
        {/* Subtitle */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-sm text-gray-500 tracking-wider">ATHLETE PERFORMANCE</Text>
        </View>

        {/* Weekly Calendar */}
        <View className="px-6 mb-6">
          <View className="flex-row justify-between">
            {weekDays.map((item, index) => (
              <View key={index} className={`items-center rounded-full ${
                  item.isToday ? 'bg-[#2d4a3e]' : 'bg-transparent'
                }`}>
                <Text className={`text-xs font-medium mb-2 ${item.isToday ? 'text-white' : 'text-gray-500'}`}>
                  {item.day}
                </Text>
                <View className={`w-12 h-12 rounded-full items-center justify-center ${
                  item.isToday ? 'bg-[#2d4a3e]' : 'bg-transparent'
                }`}>
                  <Text className={`text-lg font-semibold ${item.isToday ? 'text-white' : 'text-gray-900'}`}>
                    {item.date}
                  </Text>
                  {item.isToday && (
                    <View className="w-2 h-2 bg-orange-400 rounded-full mt-1" />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Training Session Card */}
        <View className="mx-6 mb-6">
          <View className="bg-[#2d4a3e] rounded-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="w-2 h-2 bg-orange-400 rounded-full mr-3" />
                <Text className="text-white text-sm font-medium">TRAINING TODAY</Text>
              </View>
              <Ionicons name="calendar-outline" size={20} color="white" />
            </View>
            
            <Text className="text-white text-2xl font-bold mb-6">Interval Run Session</Text>
            
            <View className="flex-row space-x-4">
              <View className="bg-[#ffffff1a] rounded-2xl px-4 py-3 flex-1">
                <Text className="text-green-200 text-xs font-medium mb-1">START</Text>
                <Text className="text-white text-lg font-semibold">5:00 PM</Text>
              </View>
              <View className="bg-[#ffffff1a] rounded-2xl px-4 py-3 flex-1">
                <Text className="text-green-200 text-xs font-medium mb-1">DURATION</Text>
                <Text className="text-white text-lg font-semibold">60 min</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Nutrition Status */}
        <View className="mx-6 mb-6">
          <View className="bg-white rounded-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-gray-900 text-lg font-bold">NUTRITION STATUS</Text>
              <Text className="text-green-600 text-sm font-semibold">ON TRACK</Text>
            </View>
            
            <View className="flex-row items-center">
              {/* Circular Progress */}
              <View className="relative w-32 h-32 mr-8">
                <View className="w-32 h-32 rounded-full border-8 border-gray-200" />
                <View className="absolute inset-0 w-32 h-32 rounded-full border-8 border-transparent border-t-teal-400 border-r-teal-400 border-b-orange-400 transform rotate-45" />
                <View className="absolute inset-4 items-center justify-center">
                  <Text className="text-3xl font-bold text-gray-900">1,840</Text>
                  <Text className="text-xs text-gray-500">KCAL LEFT</Text>
                </View>
              </View>
              
              {/* Nutrition Stats */}
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-600 text-sm">CARBS</Text>
                  <Text className="text-gray-900 font-semibold">75%</Text>
                </View>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-600 text-sm">PROTEIN</Text>
                  <Text className="text-gray-900 font-semibold">60%</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600 text-sm">FATS</Text>
                  <Text className="text-gray-900 font-semibold">45%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Athlete Fueling Plan */}
        <View className="mx-6 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-900 text-lg font-bold">Athlete Fueling Plan</Text>
            <TouchableOpacity>
              <Text className="text-gray-600 text-sm font-medium">EXPAND</Text>
            </TouchableOpacity>
          </View>
          
          {/* Pre-session meal */}
          <View className="bg-white rounded-2xl p-4 mb-3">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-gray-200 mr-4 overflow-hidden">
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100&h=100&fit=crop' }}
                  className="w-full h-full"
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-orange-500 text-xs font-medium mr-2">PRE-SESSION</Text>
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                  <Text className="text-green-600 text-xs font-medium">IBS SAFE</Text>
                </View>
                <Text className="text-gray-900 font-semibold mb-1">Rice & Maple PB Bowl</Text>
                <Text className="text-gray-500 text-sm">60-90 min before • Low FODMAP</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </View>
          
          {/* Post-session meal */}
          <View className="bg-white rounded-2xl p-4">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-gray-200 mr-4 overflow-hidden">
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100&h=100&fit=crop' }}
                  className="w-full h-full"
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-blue-500 text-xs font-medium mr-2">POST-SESSION</Text>
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                  <Text className="text-green-600 text-xs font-medium">IBS SAFE</Text>
                </View>
                <Text className="text-gray-900 font-semibold mb-1">Recovery Protein Shake</Text>
                <Text className="text-gray-500 text-sm">Within 30 min • 20g Protein</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </View>
        </View>

        {/* Bottom spacing for navigation */}
        <View className="h-24" />
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0">
        <View className="bg-green-700 mx-6 mb-6 rounded-full flex-row items-center justify-around py-4">
          <TouchableOpacity className="items-center">
            <Ionicons name="home" size={24} color="white" />
            <Text className="text-white text-xs mt-1">HOME</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Ionicons name="barbell" size={24} color="rgba(255,255,255,0.6)" />
            <Text className="text-white/60 text-xs mt-1">TRAINING</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="w-12 h-12 bg-orange-400 rounded-full items-center justify-center"
            onPress={() => navigation.navigate('Camera')}
          >
            <Ionicons name="camera" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Ionicons name="receipt" size={24} color="rgba(255,255,255,0.6)" />
            <Text className="text-white/60 text-xs mt-1">RECIPES</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Ionicons name="clipboard" size={24} color="rgba(255,255,255,0.6)" />
            <Text className="text-white/60 text-xs mt-1">LIST</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
