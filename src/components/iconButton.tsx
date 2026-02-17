import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { Layout } from '../constants/theme/layout';
import { Colors } from '../constants/theme/theme';
import { Typography } from '../constants/theme/typography';

interface IconProps {
  size?: number;
  color?: string;
}

type IconButtonSize = 'small' | 'medium' | 'large';

interface IconButtonProps {
  icon: React.ReactElement<IconProps>;
  text: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  withGradient?: boolean;
  textColor?: string;
  size?: IconButtonSize;
}

const ICON_SIZE = 20;

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  text,
  onPress,
  disabled = false,
  style,
  withGradient = false,
  textColor,
  size = 'large',
}) => {
  // Clone the icon element with consistent size and color
  const styledIcon = React.cloneElement(icon as React.ReactElement<IconProps>, {
    size: ICON_SIZE,
    color: textColor,
  });

  return (
    <TouchableOpacity
      style={[
        styles.buttonContainer,
        disabled && styles.disabled,
        size === 'small' ? styles.buttonSmall : styles.buttonLarge,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}>
      {withGradient && (
        <LinearGradient
          colors={Colors.gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {styledIcon}
      <Text style={[styles.buttonText, { color: textColor }]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Layout.borderRadius.buttonRounded,
    gap: Layout.grid.gap.sm,
    overflow: 'hidden',
  },
  buttonSmall: {
    paddingVertical: Layout.padding.sm,
    paddingHorizontal: 24,
  },
  buttonMedium: {
    paddingVertical: Layout.padding.sm,
    paddingHorizontal: 36,
  },
  buttonLarge: {
    paddingVertical: Layout.padding.sm,
    paddingHorizontal: 48,
  },
  buttonText: {
    fontWeight: Typography.button.fontWeight,
    fontSize: Typography.button.fontSize,
  },
  disabled: {
    opacity: 0.5,
  },
});
