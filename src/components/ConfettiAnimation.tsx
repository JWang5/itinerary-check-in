import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const NUM_PARTICLES = 30;
const YUMI_IMAGE = require('@/assets/images/yumi.png');

interface ConfettiParticleProps {
  delay: number;
  startX: number;
  duration: number;
  onComplete?: () => void;
}

const ConfettiParticle = ({ delay, startX, duration, onComplete }: ConfettiParticleProps) => {
  const translateY = useSharedValue(-100);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(
        height + 100,
        {
          duration: duration,
          easing: Easing.linear,
        },
        (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        },
      ),
    );

    rotate.value = withDelay(
      delay,
      withTiming(360 * 2, {
        duration: duration,
        easing: Easing.linear,
      }),
    );

    // Fade out near the end
    opacity.value = withDelay(delay + duration * 0.8, withTiming(0, { duration: duration * 0.2 }));
  }, [delay, duration, onComplete, translateY, rotate, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: startX },
        { rotate: `${rotate.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.particle, animatedStyle]}>
      <Image source={YUMI_IMAGE} style={styles.image} contentFit="contain" />
    </Animated.View>
  );
};

interface ConfettiAnimationProps {
  visible: boolean;
  onAnimationComplete: () => void;
}

export const ConfettiAnimation = ({ visible, onAnimationComplete }: ConfettiAnimationProps) => {
  const [particles, setParticles] = React.useState<any[]>([]);
  const completedParticles = React.useRef(0);

  useEffect(() => {
    if (visible) {
      const newParticles = Array.from({ length: NUM_PARTICLES }).map((_, i) => ({
        id: i,
        startX: Math.random() * (width - 50), // Random X position
        delay: Math.random() * 1000, // Random delay up to 1s
        duration: 2000 + Math.random() * 1000, // Random duration between 2-3s
      }));
      setParticles(newParticles);
      completedParticles.current = 0;
    } else {
      setParticles([]);
    }
  }, [visible]);

  const handleParticleComplete = () => {
    completedParticles.current += 1;
    if (completedParticles.current >= NUM_PARTICLES) {
      onAnimationComplete();
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <ConfettiParticle
          key={p.id}
          startX={p.startX}
          delay={p.delay}
          duration={p.duration}
          onComplete={handleParticleComplete}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
