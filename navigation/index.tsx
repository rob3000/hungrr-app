import { createStaticNavigation, StaticParamList } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Login from '../screens/login';
import Signup from '../screens/signup';
import Welcome from '../screens/welcome';
import OTPVerification from '../screens/otp-verification';
import DietaryProfile from '../screens/dietary-profile';
import Overview from '../screens/overview';
import Details from '../screens/details';
import Camera from '../screens/camera';
import RecipeDetail from '../screens/recipe-detail';
import ProductDetail from '../screens/product-detail';
import IngredientDetail from '../screens/ingredient-detail';
import AddProduct from '../screens/add-product';
import ProductNotFound from '../screens/product-not-found';
import Settings from '../screens/settings';
import SavedItems from '../screens/saved-items';
import Checkout from '../screens/checkout';
import WelcomeToPro from '../screens/welcome-to-pro';
import Search from '../screens/search';
import { CustomHeader } from '../components/CustomHeader';

const Stack = createStackNavigator({
  screenOptions: {
    animation: 'none'
  },
  screens: {
    Welcome: {
      screen: Welcome,
      options: {
        headerShown: false,
      },
    },
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
      options: ({ navigation, route }) => {
        const isFromSettings = route.params?.fromSettings;
        return isFromSettings ? {
          header: () => (
            <CustomHeader 
              title="Dietary Profile" 
              onBackPress={navigation.goBack}
              showBackButton={true}
            />
          ),
        } : {
          headerShown: false,
          gestureEnabled: false,
        };
      },
    },
    Overview: {
      screen: Overview,
      options: {
        headerShown: false,
        gestureEnabled: false,
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
    IngredientDetail: {
      screen: IngredientDetail,
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
    ProductNotFound: {
      screen: ProductNotFound,
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
    Search: {
      screen: Search,
      options: {
        headerShown: false,
      },
    },
    Details: {
      screen: Details,
      options: ({ navigation }) => ({
        header: () => (
          <CustomHeader 
            onBackPress={navigation.goBack}
            showBackButton={true}
          />
        ),
      }),
    },
    Settings: {
      screen: Settings,
      options: {
        headerShown: false,
      },
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
