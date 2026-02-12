import {
  View,
  Dimensions,
} from 'react-native';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Create grid lines
export const GridBackground = () => {
  const gridSize = 140;
  const verticalLines = Math.ceil(screenWidth / gridSize) + 1;
  const horizontalLines = Math.ceil(screenHeight / gridSize) + 1;

  return (
    <View className="absolute inset-0">
      {/* Vertical lines */}
      {Array.from({ length: verticalLines }).map((_, index) => (
        <View
          key={`v-${index}`}
          className="absolute bg-[#181A2C] opacity-30"
          style={{
            left: index * gridSize,
            top: 0,
            width: 1,
            height: screenHeight,
          }}
        />
      ))}
      {/* Horizontal lines */}
      {Array.from({ length: horizontalLines }).map((_, index) => (
        <View
          key={`h-${index}`}
          className="absolute bg-[#181A2C] opacity-30"
          style={{
            left: 0,
            top: index * gridSize,
            width: screenWidth,
            height: 1,
          }}
        />
      ))}
    </View>
  );
};