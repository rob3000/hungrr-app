import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Login from '../screens/login';
import Signup from '../screens/signup';
import OTPVerification from '../screens/otp-verification';
import DietaryProfile from '../screens/dietary-profile';
import Overview from '../screens/overview';
import Details from '../screens/details';
import Camera from '../screens/camera';
import RecipeDetail from '../screens/recipe-detail';
import ProductDetail from '../screens/product-detail';
import AddProduct from '../screens/add-product';
import Settings from '../screens/settings';
import SavedItems from '../screens/saved-items';
import Checkout from '../screens/checkout';
import WelcomeToPro from '../screens/welcome-to-pro';
import { BackButton } from '../components/BackButton';

const Stack = createStackNavigator({
  screens: {
    Login: {
      screen: Login,
      options: {
        headerShown: false,
      },
    },
    Signup: {
      screen: Signup,
      options: {
        headerShown: false,
      },
    },
    OTPVerification: {
      screen: OTPVerification,
      options: {
        headerShown: false,
      },
      // Define route params for type safety
      initialParams: {
        email: '',
        sessionToken: '',
        name: '',
        isSignup: false,
      },
    },
    DietaryProfile: {
      screen: DietaryProfile,
      options: {
        headerShown: false,
        gestureEnabled: false,
      },
    },
    Overview: {
      screen: Overview,
      options: ({ navigation }) => ({
        headerTitle: () => (
          <View className="flex-row items-center">
            <Image source={require('../assets/logo.png')} height={8} width={8} resizeMode="contain" className='w-32'/>
          </View>
        ),
        headerRight: () => (
          <View className="flex-row items-center space-x-4 mr-4">
            <TouchableOpacity className="mr-4">
              <Ionicons name="notifications-outline" size={24} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
              <View className="w-8 h-8 rounded-full bg-[#2d5f4f] items-center justify-center">
                <Ionicons name="person" size={18} color="white" />
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
      }),
    },
    Camera: {
      screen: Camera,
      options: {
        headerShown: false,
        presentation: 'modal',
      },
    },
    RecipeDetail: {
      screen: RecipeDetail,
      options: {
        headerShown: false,
      },
    },
    ProductDetail: {
      screen: ProductDetail,
      options: {
        headerShown: false,
      },
    },
    AddProduct: {
      screen: AddProduct,
      options: {
        headerShown: false,
      },
    },
    SavedItems: {
      screen: SavedItems,
      options: {
        headerShown: false,
      },
    },
    Details: {
      screen: Details,
      options: ({ navigation }) => ({
        headerLeft: () => <BackButton onPress={navigation.goBack} />,
      }),
    },
    Settings: {
      screen: Settings,
      options: ({ navigation }) => ({
        headerLeft: () => <BackButton onPress={navigation.goBack} />,
        headerStyle: {
          backgroundColor: '#f3eee5',
          elevation: 0,
          shadowOpacity: 0,
        },
      }),
    },
    Checkout: {
      screen: Checkout,
      options: {
        headerShown: false,
      },
      initialParams: {
        plan: {
          id: '',
          name: '',
          price: 0,
          interval: 'monthly' as const,
          currency: 'USD',
          isBestValue: false,
          features: [],
        },
      },
    },
    WelcomeToPro: {
      screen: WelcomeToPro,
      options: {
        headerShown: false,
        gestureEnabled: false,
      },
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
