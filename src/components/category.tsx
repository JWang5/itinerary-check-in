import { Colors, Shadows } from '@/src/constants/theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { Layout } from '../constants/theme/layout';
import { Typography } from '../constants/theme/typography';

interface CategoryProps {
  name: string;
  isActive: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  activeStyle?: StyleProp<ViewStyle>;
  withGradient?: boolean;
  textStyle?: StyleProp<TextStyle>;
  activeTextStyle?: StyleProp<TextStyle>;
}

export function Category({
  name,
  isActive,
  onPress,
  style,
  activeStyle,
  withGradient = true,
  textStyle,
  activeTextStyle,
}: CategoryProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.categoryItem, style, isActive && activeStyle]}>
      {isActive && withGradient && (
        <LinearGradient
          colors={Colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject]}
        />
      )}
      <Text
        style={[
          styles.categoryText,
          isActive && styles.categoryTextActive,
          textStyle,
          isActive && activeTextStyle,
        ]}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  categoryItem: {
    paddingVertical: 6,
    paddingHorizontal: Layout.padding.md,
    borderRadius: Layout.borderRadius.buttonRounded,
    backgroundColor: Colors.background,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'transparent',
    marginBottom: 4,
    ...Shadows.soft,
  },
  categoryText: {
    fontSize: Typography.label.fontSize,
    color: Colors.secondaryText,
    fontWeight: Typography.label.fontWeight,
  },
  categoryTextActive: {
    color: Colors.text,
    fontWeight: '700',
  },
});
