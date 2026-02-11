import './global.css';

import { DefaultTheme, DarkTheme, NavigationContainer } from '@react-navigation/native';
import { useMemo, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

import 'react-native-gesture-handler';
import RNBootSplash from 'react-native-bootsplash';
import { loadFonts } from './utils/fonts';

import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { SavedItemsProvider } from './context/SavedItemsContext';

// Import screens
import Welcome from './screens/welcome';
import Login from './screens/login';
import Signup from './screens/signup';
import OTPVerification from './screens/otp-verification';
import DietaryProfile from './screens/dietary-profile';
import Overview from './screens/overview';
import Details from './screens/details';
import Camera from './screens/camera';
import RecipeDetail from './screens/recipe-detail';
import ProductDetail from './screens/product-detail';
import AddProduct from './screens/add-product';
import Settings from './screens/settings';
import SavedItems from './screens/saved-items';
import Checkout from './screens/checkout';
import WelcomeToPro from './screens/welcome-to-pro';
import Search from './screens/search';
import { BackButton } from './components/BackButton';
import { TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgb(45, 74, 62)',
    background: 'rgb(243, 238, 229)',
    card: 'rgb(255, 255, 255)',
    text: 'rgb(28, 28, 30)',
    border: 'rgb(216, 216, 216)',
    notification: 'rgb(255, 59, 48)',
  },
};

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: 'rgb(45, 74, 62)',
    background: 'rgb(18, 18, 18)',
    card: 'rgb(28, 28, 28)',
    text: 'rgb(229, 229, 231)',
    border: 'rgb(39, 39, 41)',
    notification: 'rgb(255, 69, 58)',
  },
};

function AppContent() {
  const { darkMode, isLoading: authLoading, isLoggedIn } = useAuth();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const theme = useMemo(() => (darkMode ? MyDarkTheme : MyTheme), [darkMode]);

  useEffect(() => {
    async function loadAppFonts() {
      try {
        await loadFonts();
        setFontsLoaded(true);
      } catch (error) {
        console.warn('Error loading fonts:', error);
        setFontsLoaded(true); // Continue even if fonts fail to load
      }
    }
    
    loadAppFonts();
  }, []);

  useEffect(() => {
    // Hide splash screen once app is ready
    if (!authLoading && fontsLoaded) {
      RNBootSplash.hide({ fade: true });
    }
  }, [authLoading, fontsLoaded]);

  if (authLoading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3eee5' }}>
        <ActivityIndicator size="large" color="#2d5f4f" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        initialRouteName={isLoggedIn ? "Overview" : "Welcome"}
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen 
          name="OTPVerification" 
          component={OTPVerification}
          initialParams={{
            email: '',
            sessionToken: '',
            name: '',
            isSignup: false,
          }}
        />
        <Stack.Screen 
          name="DietaryProfile" 
          component={DietaryProfile}
          options={{
            gestureEnabled: false,
          }}
        />

        {/* Main App Screens */}
        <Stack.Screen 
          name="Overview" 
          component={Overview}
          options={({ navigation }) => ({
            headerShown: true,
            headerTitle: () => (
              <View className="flex-row items-center">
                <Image source={require('./assets/logo.png')} height={8} width={8} resizeMode="contain" className='w-32'/>
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
          })}
        />
        <Stack.Screen 
          name="Camera" 
          component={Camera}
          options={{
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="RecipeDetail" component={RecipeDetail} />
        <Stack.Screen name="ProductDetail" component={ProductDetail} />
        <Stack.Screen name="AddProduct" component={AddProduct} />
        <Stack.Screen name="SavedItems" component={SavedItems} />
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen 
          name="Details" 
          component={Details}
          options={({ navigation }) => ({
            headerShown: true,
            headerLeft: () => <BackButton onPress={navigation.goBack} />,
          })}
        />
        <Stack.Screen 
          name="Settings" 
          component={Settings}
          options={({ navigation }) => ({
            headerShown: true,
            headerLeft: () => <BackButton onPress={navigation.goBack} />,
            headerStyle: {
              backgroundColor: '#f3eee5',
              elevation: 0,
              shadowOpacity: 0,
            },
          })}
        />
        <Stack.Screen 
          name="Checkout" 
          component={Checkout}
          initialParams={{
            plan: {
              id: '',
              name: '',
              price: 0,
              interval: 'monthly' as const,
              currency: 'USD',
              isBestValue: false,
              features: [],
            },
          }}
        />
        <Stack.Screen 
          name="WelcomeToPro" 
          component={WelcomeToPro}
          options={{
            gestureEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <SavedItemsProvider>
          <AppContent />
        </SavedItemsProvider>
      </SubscriptionProvider>
    </AuthProvider>
  );
}
