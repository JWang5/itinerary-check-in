import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronUp } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import AuthDialog from '../components/auth';
import { Colors } from '../constants/theme/theme';
import { Typography } from '../constants/theme/typography';
import { useAuth } from '../provider/authProvider';

const EXPLORE_PAGE = '/(tabs)/explore';
// Negative because we swipe UP
const SWIPE_THRESHOLD = -100;
const MAX_SWIPE_DISTANCE = -105; // 180 (container) - 70 (button) - 5 (margin)

export default function StartPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { session } = useAuth();
  const [isLoginVisible, setIsLoginVisible] = useState(false);

  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const loginOpacity = useRef(new Animated.Value(0)).current;
  const loginScale = useRef(new Animated.Value(0.95)).current;

  // Animations
  const pan = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Login Dialog Animations
  const contentOpacity = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Initial entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        delay: 100,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        delay: 100,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const showLoginDialog = () => {
    setIsLoginVisible(true);
    Animated.parallel([
      // Hide main content
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      // Show login dialog
      Animated.timing(loginOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        delay: 200,
      }),
      Animated.spring(loginScale, {
        toValue: 1,
        useNativeDriver: true,
        delay: 200,
      }),
    ]).start();
  };

  const hideLoginDialog = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(loginOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(loginScale, {
        toValue: 0.95,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        delay: 200,
      }),
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsLoginVisible(false);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isLoginVisible,
      onMoveShouldSetPanResponder: () => !isLoginVisible,
      onPanResponderGrant: () => {
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isLoginVisible) {
          // Allow only upward movement (negative dy)
          if (gestureState.dy < 0) {
            const constrainedDy = Math.max(gestureState.dy, MAX_SWIPE_DISTANCE);
            pan.y.setValue(constrainedDy);
          }
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!isLoginVisible) {
          if (gestureState.dy < SWIPE_THRESHOLD) {
            // Success swipe (swiped up enough)
            Animated.spring(pan, {
              toValue: { x: 0, y: MAX_SWIPE_DISTANCE },
              useNativeDriver: true,
              bounciness: 0,
            }).start(() => {
              if (sessionRef.current) {
                router.replace(EXPLORE_PAGE);
              } else {
                showLoginDialog();
              }
            });
          } else {
            // Reset
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
              bounciness: 10,
            }).start();
          }
        }
      },
    }),
  ).current;

  const animatedStyle = {
    transform: [{ translateY: pan.y }],
  };

  const textOpacity = pan.y.interpolate({
    inputRange: [SWIPE_THRESHOLD, 0],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background Image */}
      <Image
        source={require('../../assets/images/landing.png')}
        style={styles.backgroundImage}
        contentFit="cover"
        transition={500}
      />

      {/* Gradient Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(20, 40, 20, 0.8)']}
        style={styles.gradient}
      />

      {/* Blur Overlay when login is visible */}
      {isLoginVisible && <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />}

      {/* Main Content */}
      <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
        <Animated.View
          style={[
            styles.leftContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}>
          <Text style={{ ...styles.title, fontFamily: 'PingFangSaTuoTi' }}>
            {t('landing.title')}
          </Text>

          {/* <Text style={styles.subtitle}></Text> */}
        </Animated.View>

        <View style={styles.bottomSection}>
          <View style={styles.swipeContainer}>
            {/* Track background with gradient */}
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.swipeTrack}
            />

            {/* Arrows indicator */}
            <Animated.View style={[styles.arrowContainer, { opacity: textOpacity }]}>
              <ChevronUp size={24} color="#fff" style={{ opacity: 0.5, marginBottom: -10 }} />
              <ChevronUp size={24} color="#fff" style={{ opacity: 0.8, marginBottom: -10 }} />
              <ChevronUp size={24} color="#fff" />
            </Animated.View>

            {/* Draggable Button */}
            <Animated.View
              style={[styles.swipeButton, animatedStyle]}
              {...panResponder.panHandlers}>
              <View style={styles.innerButton}>
                <Text style={styles.goText}>{t('landing.go')}</Text>
              </View>
            </Animated.View>
          </View>
        </View>
      </Animated.View>

      {/* Login Dialog Overlay */}
      {isLoginVisible && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.loginOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Animated.View
              style={[
                styles.loginDialog,
                {
                  opacity: loginOpacity,
                  transform: [{ scale: loginScale }],
                },
              ]}>
              <AuthDialog onClose={hideLoginDialog} />
            </Animated.View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a2e1a', // Dark green fallback
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  leftContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 40,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  bottomSection: {
    height: 200,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  swipeContainer: {
    width: 80,
    height: 180,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  swipeTrack: {
    position: 'absolute',
    bottom: 0,
    width: 80,
    height: 180,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  arrowContainer: {
    position: 'absolute',
    top: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  swipeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    zIndex: 10,
  },
  innerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  goText: {
    color: Colors.text,
    ...Typography.h2,
  },

  // Login Overlay Styles
  loginOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.modalBackground, // Slightly dark for contrast
  },
  loginDialog: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
