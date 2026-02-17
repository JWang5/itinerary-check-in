import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Colors } from '../constants/theme/theme';

export default function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
