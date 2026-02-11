import { fonts } from '../utils/fonts';
import type { FontWeight } from '../types/fonts';

export const useFont = (weight: FontWeight = 'regular') => {
  return fonts[weight];
};

// Helper function to get font style object for React Native components
export const getFontStyle = (weight: FontWeight = 'regular', size?: number) => {
  const style: { fontFamily: string; fontSize?: number } = {
    fontFamily: fonts[weight],
  };
  
  if (size) {
    style.fontSize = size;
  }
  
  return style;
};