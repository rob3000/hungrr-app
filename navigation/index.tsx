import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Overview from '../screens/overview';
import Details from '../screens/details';
import Camera from '../screens/camera';
import { BackButton } from '../components/BackButton';

const Stack = createStackNavigator({
  screens: {
    Overview: {
      screen: Overview,
      options: {
        headerTitle: () => (
          <View className="flex-row items-center">
            <Image source={require('../assets/logo.png')} height={8} width={8} resizeMode="contain" className='w-32'/>
          </View>
        ),
        headerRight: () => (
          <View className="flex-row items-center space-x-4 mr-4">
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={24} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity>
              <View className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsjZg0pVUfDbe4RU0YGI0VHcX9nfi75KdRM9ilQbSIJ05aJE9HhUn4ZPvd6t_s6qpePliwp0a8ZpSdu_JH9dHAH8qnr6_0vMLLSAAZB--gw77SLJWiRqXCIUqw9f3n8w0_PUBNf5-YfFyrp9D85WyNsw393GHULJsXBEdGVW_FL0xwzYxTuoi1Bb0cKjZ--AJEWvARoaPlK7ukv1HN_pzygfP0RSPdRrXLtq44jsQ-uyO4ph6CssNr8tvB0PXY_GNXKC24yVYoJF7q' }}
                  className="w-full h-full"
                />
              </View>
            </TouchableOpacity>
          </View>
        ),
        headerLeft: () => null,
        headerStyle: {
          backgroundColor: '#f3eee5',
          elevation: 0,
          shadowOpacity: 0,
        },
      },
    },
    Camera: {
      screen: Camera,
      options: {
        headerShown: false,
        presentation: 'modal',
      },
    },
    Details: {
      screen: Details,
      options: ({ navigation }) => ({
        headerLeft: () => <BackButton onPress={navigation.goBack} />,
      }),
    },
  },
});

type RootNavigatorParamList = StaticParamList<typeof Stack>;

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootNavigatorParamList {}
  }
}

const Navigation = createStaticNavigation(Stack);
export default Navigation;
