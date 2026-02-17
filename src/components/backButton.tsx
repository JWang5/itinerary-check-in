import { BUTTON_SIZE } from '@/src/constants/theme/layout';
import { Colors } from '@/src/constants/theme/theme';
import { ArrowLeft } from 'lucide-react-native';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

export default function BackButton({
  onPress,
  style,
}: {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity style={[styles.backButton, style]} onPress={onPress}>
      <ArrowLeft size={BUTTON_SIZE} color={Colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
