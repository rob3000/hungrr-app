import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const Separator = ({text}: {text?: string}) => {
    if (!text) {
        return <View style={styles.separator} />;
    }

    return <View style={{flexDirection: 'row', alignItems: 'center'}}>
  <View style={{flex: 1, height: 1, backgroundColor: 'rgb(107,114, 128, 0.4)'}} />
  <View>
    <Text style={{width: 150, textAlign: 'center', color: 'rgb(107,114, 128, 0.4)'}}>{text}</Text>
  </View>
  <View style={{flex: 1, height: 1, backgroundColor: 'rgb(107,114, 128, 0.4)'}} />
</View>;
};

const styles = StyleSheet.create({
  separator: {
    height: 1, // Determines the thickness of the line
    backgroundColor: '#e0e0e0', // The color of the line
    marginVertical: 10, // Adds vertical space above and below the line
  },
});

export default Separator;
