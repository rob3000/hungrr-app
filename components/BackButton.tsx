import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export const BackButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <View className={styles.backButton} >
      <TouchableOpacity onPress={onPress}>
        <Feather name="chevron-left" size={30} />
      </TouchableOpacity> 
    </View>
  );
};

const styles = {
  backButton: 'flex-row mr-4',
  backButtonText: 'ml-1',
};
