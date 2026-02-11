/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './screens/**/*.{js,ts,tsx}',
    './navigation/**/*.{js,ts,tsx}',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        'jakarta': ['PlusJakartaSans-Regular'],
        'jakarta-medium': ['PlusJakartaSans-Medium'],
        'jakarta-semibold': ['PlusJakartaSans-SemiBold'],
        'jakarta-bold': ['PlusJakartaSans-Bold'],
        'jakarta-extrabold': ['PlusJakartaSans-ExtraBold'],
        'jakarta-light': ['PlusJakartaSans-Light'],
        'jakarta-extralight': ['PlusJakartaSans-ExtraLight'],
      },
    },
  },
  plugins: [],
};
