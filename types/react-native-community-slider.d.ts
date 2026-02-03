declare module '@react-native-community/slider' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  export interface SliderProps {
    style?: ViewStyle;
    disabled?: boolean;
    maximumValue?: number;
    minimumTrackTintColor?: string;
    minimumValue?: number;
    onSlidingComplete?: (value: number) => void;
    onValueChange?: (value: number) => void;
    step?: number;
    maximumTrackTintColor?: string;
    value?: number;
    thumbTintColor?: string;
    thumbImage?: any;
    trackImage?: any;
    minimumTrackImage?: any;
    maximumTrackImage?: any;
  }

  export default class Slider extends Component<SliderProps> {}
}
