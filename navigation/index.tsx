import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Login from '../screens/login';
import Signup from '../screens/signup';
import Overview from '../screens/overview';
import Details from '../screens/details';
import Camera from '../screens/camera';
import RecipeDetail from '../screens/recipe-detail';
import ProductDetail from '../screens/product-detail';
import AddProduct from '../screens/add-product';
import { BackButton } from '../components/BackButton';
import { UserIcon } from '../components/UserIcon';
import SettingsScreen from 'screens/settings';

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
    Overview: {
      screen: Overview,
      options: {
        headerTitle: () => (
          <View className="flex-row items-center">
            <Image source={require('../assets/logo.png')} height={8} width={8} resizeMode="contain" className='w-32'/>
          </View>
        ),
        headerRight: UserIcon,
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
    Details: {
      screen: Details,
      options: ({ navigation }) => ({
        headerLeft: () => <BackButton onPress={navigation.goBack} />,
      }),
    },
    Settings: {
      screen: SettingsScreen,
      options: ({ navigation }) => ({
        headerLeft: () => <BackButton onPress={navigation.goBack} />,
        headerStyle: {
          backgroundColor: '#f3eee5',
          elevation: 0,
          shadowOpacity: 0,
        },
      }),
    }
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
