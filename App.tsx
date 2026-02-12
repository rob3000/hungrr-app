import './global.css';

import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useMemo, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

import 'react-native-gesture-handler';
import RNBootSplash from 'react-native-bootsplash';
import { loadFonts } from './utils/fonts';

import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { SavedItemsProvider } from './context/SavedItemsContext';
import Navigation from './navigation';

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
  const { darkMode, isLoading: authLoading } = useAuth();
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

  return <Navigation theme={theme} />;
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
