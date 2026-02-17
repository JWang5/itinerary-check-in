import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../constants/theme/theme';
import { Typography } from '../constants/theme/typography';

interface NotFoundProps {
  message: string;
  style?: StyleProp<ViewStyle>;
}

export default function NotFound({ message, style }: NotFoundProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    marginHorizontal: 24,
  },
  message: {
    ...Typography.body2,
    color: Colors.secondaryText,
    fontStyle: 'italic',
    fontWeight: 'normal',
  },
});
