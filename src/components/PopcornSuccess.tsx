import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface SuccessAnimationProps {
  visible: boolean;
  onAnimationComplete?: () => void;
}

const { width } = Dimensions.get('window');

// Configuration for our runners
const RUNNERS = [
  { emoji: '🐕', delay: 0, speed: 2000, yOffset: 0 },
  { emoji: '🐈', delay: 200, speed: 2200, yOffset: 40 },
  { emoji: '🐈‍⬛', delay: 400, speed: 1900, yOffset: -30 },
];

const Runner = ({
  emoji,
  delay,
  speed,
  yOffset,
  visible,
  onComplete,
}: {
  emoji: string;
  delay: number;
  speed: number;
  yOffset: number;
  visible: boolean;
  onComplete?: () => void;
}) => {
  const translateX = useSharedValue(-100);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Reset position
      translateX.value = -100;
      translateY.value = 0;

      // Run animation (Left to Right)
      translateX.value = withDelay(
        delay,
        withTiming(width + 100, { duration: speed, easing: Easing.linear }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        }),
      );

      // Bobbing animation (Running bounce)
      translateY.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-10, { duration: 150, easing: Easing.sin }),
            withTiming(0, { duration: 150, easing: Easing.sin }),
          ),
          -1, // Infinite repeat while running
          true, // Reverse
        ),
      );
    }
  }, [visible, delay, speed, translateX, translateY, onComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }, { translateY: translateY.value + yOffset }],
    };
  });

  return (
    <Animated.View style={[styles.runnerContainer, animatedStyle]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </Animated.View>
  );
};

export const PopcornSuccess: React.FC<SuccessAnimationProps> = ({
  visible,
  onAnimationComplete,
}) => {
  const [completedCount, setCompletedCount] = React.useState(0);

  // Reset count when visible changes to true
  useEffect(() => {
    if (visible) {
      setCompletedCount(0);
    }
  }, [visible]);

  // Check if all runners finished
  useEffect(() => {
    if (completedCount === RUNNERS.length && onAnimationComplete) {
      // Small buffer to ensure they are fully off screen
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [completedCount, onAnimationComplete]);

  const handleRunnerComplete = () => {
    setCompletedCount((prev) => prev + 1);
  };

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {RUNNERS.map((runner, index) => (
        <Runner key={index} {...runner} visible={visible} onComplete={handleRunnerComplete} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    zIndex: 9999,
    // Removed background color to just show runners overlaying the app
  },
  runnerContainer: {
    position: 'absolute',
    left: 0, // Starting from left edge (offset handled by shared value)
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  emoji: {
    fontSize: 48,
  },
});
