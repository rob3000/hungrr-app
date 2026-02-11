import * as Font from 'expo-font';

export const loadFonts = async () => {
  await Font.loadAsync({
    'PlusJakartaSans-Regular': require('../assets/fonts/plus_jakarta_sans/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('../assets/fonts/plus_jakarta_sans/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('../assets/fonts/plus_jakarta_sans/PlusJakartaSans-SemiBold.ttf'),
    'PlusJakartaSans-Bold': require('../assets/fonts/plus_jakarta_sans/PlusJakartaSans-Bold.ttf'),
    'PlusJakartaSans-ExtraBold': require('../assets/fonts/plus_jakarta_sans/PlusJakartaSans-ExtraBold.ttf'),
    'PlusJakartaSans-Light': require('../assets/fonts/plus_jakarta_sans/PlusJakartaSans-Light.ttf'),
    'PlusJakartaSans-ExtraLight': require('../assets/fonts/plus_jakarta_sans/PlusJakartaSans-ExtraLight.ttf'),
    'PlusJakartaSans-Italic': require('../assets/fonts/plus_jakarta_sans/PlusJakartaSans-Italic.ttf'),
    'PlusJakartaSans-MediumItalic': require('../assets/fonts/plus_jakarta_sans/PlusJakartaSans-MediumItalic.ttf'),
    'PlusJakartaSans-SemiBoldItalic': require('../assets/fonts/plus_jakarta_sans/PlusJakartaSans-SemiBoldItalic.ttf'),
    'PlusJakartaSans-BoldItalic': require('../assets/fonts/plus_jakarta_sans/PlusJakartaSans-BoldItalic.ttf'),
    'PlusJakartaSans-ExtraBoldItalic': require('../assets/fonts/plus_jakarta_sans/PlusJakartaSans-ExtraBoldItalic.ttf'),
    'PlusJakartaSans-LightItalic': require('../assets/fonts/plus_jakarta_sans/PlusJakartaSans-LightItalic.ttf'),
    'PlusJakartaSans-ExtraLightItalic': require('../assets/fonts/plus_jakarta_sans/PlusJakartaSans-ExtraLightItalic.ttf'),
  });
};

// Font family mappings for easier use
export const fonts = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semiBold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  extraBold: 'PlusJakartaSans-ExtraBold',
  light: 'PlusJakartaSans-Light',
  extraLight: 'PlusJakartaSans-ExtraLight',
  italic: 'PlusJakartaSans-Italic',
  mediumItalic: 'PlusJakartaSans-MediumItalic',
  semiBoldItalic: 'PlusJakartaSans-SemiBoldItalic',
  boldItalic: 'PlusJakartaSans-BoldItalic',
  extraBoldItalic: 'PlusJakartaSans-ExtraBoldItalic',
  lightItalic: 'PlusJakartaSans-LightItalic',
  extraLightItalic: 'PlusJakartaSans-ExtraLightItalic',
} as const;