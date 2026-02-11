declare module '*.ttf' {
  const value: any;
  export default value;
}

export type FontWeight = 
  | 'regular'
  | 'medium' 
  | 'semiBold'
  | 'bold'
  | 'extraBold'
  | 'light'
  | 'extraLight'
  | 'italic'
  | 'mediumItalic'
  | 'semiBoldItalic'
  | 'boldItalic'
  | 'extraBoldItalic'
  | 'lightItalic'
  | 'extraLightItalic';