import { Colors } from '@/src/constants/theme/theme';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { Layout } from '../constants/theme/layout';
import { Typography } from '../constants/theme/typography';

interface TabProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  activeStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  activeTextStyle?: StyleProp<TextStyle>;
}

export function Tab({
  label,
  isActive,
  onPress,
  style,
  activeStyle,
  textStyle,
  activeTextStyle,
}: TabProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tab, style, isActive && styles.tabActive, isActive && activeStyle]}>
      <Text
        style={[
          styles.tabText,
          textStyle,
          isActive && styles.tabTextActive,
          isActive && activeTextStyle,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: {
    paddingVertical: Layout.padding.xs,
    paddingHorizontal: Layout.padding.md,
    borderRadius: Layout.borderRadius.buttonRounded,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  tabText: {
    fontSize: Typography.body3.fontSize,
    color: Colors.text,
  },
  tabTextActive: {
    fontWeight: 'bold',
    color: Colors.inverseText,
  },
});
