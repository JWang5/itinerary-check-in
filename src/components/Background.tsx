import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

export const Background = () => {
  return (
    <View style={styles.container}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient
            id="topRightGradient"
            cx="98%"
            cy="15%"
            rx="15%"
            ry="10%"
            fx="93%"
            fy="15%"
            gradientUnits="userSpaceOnUse">
            {/* Intense core stops */}
            <Stop offset="0%" stopColor="#DBFFAE" stopOpacity="1" />
            <Stop offset="10%" stopColor="#DBFFAE" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#FFF6AE" stopOpacity="0" />
          </RadialGradient>

          <RadialGradient
            id="bottomLeftGradient"
            cx="3%"
            cy="3%"
            rx="20%"
            ry="10%"
            fx="2%"
            fy="10%"
            gradientUnits="userSpaceOnUse">
            {/* Intense core stops */}
            <Stop offset="0%" stopColor="#DBFFAE" stopOpacity="1" />
            <Stop offset="10%" stopColor="#DBFFAE" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#FFF6AE" stopOpacity="0" />
          </RadialGradient>

          <RadialGradient
            id="topMiddleGradient"
            cx="50%"
            cy="10%"
            rx="25%"
            ry="15%"
            fx="50%"
            fy="5%"
            gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#DBFFAE" stopOpacity="0.6" />
            <Stop offset="100%" stopColor="#FFF6AE" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Base layer */}
        <Rect x="0" y="0" width="100%" height="100%" fill="#fefefe" />

        {/* Render shapes */}
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#topRightGradient)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bottomLeftGradient)" />
        {/* <Rect x="0" y="0" width="100%" height="100%" fill="url(#topMiddleGradient)" /> */}
      </Svg>

      {/* The BlurView softens the edges, but the core remains intense due to the 40% stop above */}
      <BlurView intensity={80} style={StyleSheet.absoluteFillObject} tint="light" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
