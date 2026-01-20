import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export const BackButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <View className={styles.backButton}>
      <Feather name="chevron-left" size={16} />
      <Text className={styles.backButtonText} onPress={onPress}>
        Back
      </Text>
    </View>
  );
};

const styles = {
  backButton: 'flex-row mr-4',
  backButtonText: 'ml-1',
};
