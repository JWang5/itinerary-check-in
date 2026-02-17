import {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export interface HeaderAnimationConfig {
  headerHeight: number;
  stickyHeaderHeight: number;
}

/**
 * Custom hook to handle collapsible header animations
 * Returns common animated styles and scroll handlers to be used across different screens
 */
export const useHeaderAnimation = (config: HeaderAnimationConfig) => {
  const scrollY = useSharedValue(0);
  const { headerHeight, stickyHeaderHeight } = config;
  const scrollDistance = headerHeight - stickyHeaderHeight;

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  /**
   * Style for content that should fade OUT when collapsed (expanded view content)
   */
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, scrollDistance], [1, 0], Extrapolation.CLAMP);
    return { opacity };
  });

  /**
   * Style for content that should fade IN when collapsed (sticky header content)
   */
  const stickyHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [scrollDistance, scrollDistance + 20],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  /**
   * Style for the header container itself to collapse its height
   */
  const containerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, scrollDistance],
      [headerHeight, stickyHeaderHeight],
      Extrapolation.CLAMP,
    );
    return { height };
  });

  /**
   * Style for the background blur or color that fades in on scroll
   */
  const backgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, scrollDistance], [0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  return {
    scrollY,
    onScroll,
    headerStyle,
    stickyHeaderStyle,
    containerStyle,
    backgroundStyle,
    headerHeight,
    stickyHeaderHeight,
    scrollDistance,
  };
};
