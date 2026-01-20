import './global.css';

import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useMemo } from 'react';

import 'react-native-gesture-handler';

import Navigation from './navigation';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { SavedItemsProvider } from './context/SavedItemsContext';

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
  const { darkMode } = useAuth();
  const theme = useMemo(() => (darkMode ? MyDarkTheme : MyTheme), [darkMode]);

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
