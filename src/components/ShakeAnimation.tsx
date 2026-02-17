import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const MAIBAOLE_IMAGE = require('@/assets/images/maibaole.png');

interface ShakeAnimationProps {
  visible: boolean;
  onAnimationComplete: () => void;
}

export const ShakeAnimation = ({ visible, onAnimationComplete }: ShakeAnimationProps) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Reset values
      rotation.value = 0;
      scale.value = 0;

      // 1. Scale Up
      // 1. Scale Up & Exit faster
      scale.value = withSequence(
        withTiming(1, { duration: 200 }), // Quick pop up
        withDelay(
          400, // Wait for shake (concurrently happening)
          withTiming(0, { duration: 200 }, (finished) => {
            // Quick exit
            if (finished && onAnimationComplete) {
              runOnJS(onAnimationComplete)();
            }
          }),
        ),
      );

      // 2. Shake after slight delay (sync with scale up)
      rotation.value = withDelay(
        200,
        withSequence(
          withTiming(-10, { duration: 50 }),
          withRepeat(withTiming(10, { duration: 80 }), 2, true),
          withTiming(0, { duration: 50 }),
        ),
      );
    }
  }, [visible, onAnimationComplete, rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    };
  });

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.imageContainer, animatedStyle]}>
        <Image source={MAIBAOLE_IMAGE} style={styles.image} contentFit="contain" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: 200,
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
