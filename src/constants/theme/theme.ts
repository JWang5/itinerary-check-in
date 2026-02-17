/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#f47c48ff';

export const Colors = {
  text: '#1a1a1a',
  secondaryText: '#999fa7ff',
  inverseText: '#ffffff',
  disabledText: '#E2E8F0',
  viewBackground: '#fefefe',
  background: '#ffffff',
  modalBackground: 'rgba(0,0,0,0.2)',
  cardOverlay: '#1a1a1a4c',
  tabIconDefault: '#95A5A6',
  tabIconSelected: tintColorLight,
  primary: tintColorLight,
  cardBackground: '#f5f5f5',
  cardBackgroundTranslucent: '#e3e3e376',
  buttonBackground: '#f5f5f5',
  buttonBackgroundTranslucent: '#f5f5f5bc',
  inputBackground: '#f7f7f7',
  border: '#EAEAEA',
  error: '#f47c48ff',
  skeleton: '#eaeaeaff',
  gradient: ['#dbffaecc', '#fff6aeb5'] as any,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Shadows = {
  small: {
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  large: {
    shadowColor: '#908f8fff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  extraLarge: {
    shadowColor: '#1a1a1a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  soft: {
    shadowColor: '#a3aab4ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
};
