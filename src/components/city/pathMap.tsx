import { Location } from '@/src/types/model';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { BOTTOM_OFFSET, Layout } from '../../constants/theme/layout';
import { Colors, Shadows } from '../../constants/theme/theme';
import { Typography } from '../../constants/theme/typography';
import { CachedImage } from '../CachedImage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PathMapProps {
  locations: Location[];
  checkInCounts: Record<string, number>;
  cityName: string;
}

const getPathPosition = (index: number) => {
  const isLeft = index % 2 === 0;
  return {
    xRatio: isLeft ? 0.35 : 0.65,
    isLeft,
  };
};

const AnimatedLocationPoint = ({
  location,
  index,
  router,
  checkInCount,
  cityName,
}: {
  location: Location;
  index: number;
  router: any;
  checkInCount: number;
  cityName: string;
}) => {
  const pos = getPathPosition(index);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const { t } = useTranslation();

  useEffect(() => {
    opacity.value = withDelay(index * 200, withSpring(1));
    translateY.value = withDelay(index * 200, withSpring(0));
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.locationContainer,
        {
          top: 16 + index * 200,
          left: pos.xRatio * SCREEN_WIDTH,
          width: SCREEN_WIDTH - 48,
          marginLeft: -SCREEN_WIDTH / 2,
        },
        animatedStyle,
      ]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: '/location/[id]',
            params: {
              id: location.id,
              name: location.name,
              imagePath: location.imagePath,
              address: location.address,
              cityName: cityName,
            },
          })
        }
        style={styles.nodeWrapper}>
        <View
          style={[styles.topLabelBar, { transform: [{ rotate: `${((index * 7) % 9) - 4}deg` }] }]}>
          <Text style={styles.topLabelText} numberOfLines={1}>
            {location.description}
          </Text>
        </View>
        <View style={styles.locationCard}>
          {pos.isLeft ? (
            <>
              {/* Image Side */}
              <View style={styles.imageCard}>
                <CachedImage imageKey={location.imagePath} style={styles.locationImage} />
              </View>
              {/* Info Side */}
              <View style={styles.infoSide}>
                <Text style={styles.sideInfoText} numberOfLines={3}>
                  {location.name}
                </Text>
                <Text style={styles.checkInCountText}>
                  {checkInCount} {t('location.visited')}
                </Text>
              </View>
            </>
          ) : (
            <>
              {/* Info Side */}
              <View style={[styles.infoSide, styles.infoSideLeft]}>
                <Text style={styles.sideInfoText} numberOfLines={3}>
                  {location.name}
                </Text>
                <Text style={styles.checkInCountText}>
                  {checkInCount} {t('location.visited')}
                </Text>
              </View>
              {/* Image Side */}
              <View style={styles.imageCard}>
                <CachedImage imageKey={location.imagePath} style={styles.locationImage} />
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export function PathMap({ locations, checkInCounts, cityName }: PathMapProps) {
  const router = useRouter();
  const pathHeight = locations.length * 200 + BOTTOM_OFFSET; // Increased to ensure coverage

  const generatePath = () => {
    if (locations.length === 0) return '';
    const points = locations.map((_, index) => {
      const pos = getPathPosition(index);
      return {
        x: pos.xRatio * SCREEN_WIDTH,
        y: 130 + index * 200,
      };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const controlY = (prev.y + curr.y) / 2;
      // Creative curve logic
      path += ` C ${prev.x} ${controlY}, ${curr.x} ${controlY}, ${curr.x} ${curr.y}`;
    }
    return path;
  };

  return (
    <View style={[styles.container, { minHeight: pathHeight }]}>
      <Svg
        style={{ position: 'absolute', top: 0, left: 0 }}
        width={SCREEN_WIDTH}
        height={pathHeight}>
        <Path
          d={generatePath()}
          fill="none"
          stroke={Colors.border}
          strokeWidth={2}
          strokeDasharray="6, 6"
        />
      </Svg>

      {locations.map((location, index) => (
        <AnimatedLocationPoint
          key={location.id}
          location={location}
          index={index}
          router={router}
          checkInCount={checkInCounts[location.id] || 0}
          cityName={cityName}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  locationContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 2,
  },
  nodeWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  topLabelBar: {
    backgroundColor: Colors.text,
    paddingHorizontal: Layout.grid.gap.xs,
    paddingVertical: 4,
    minWidth: 100,
    alignItems: 'center',
    marginBottom: 4,
    borderRadius: 2,
  },
  topLabelText: {
    color: Colors.inverseText,
    fontSize: Typography.body4.fontSize,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.cardMd,
    ...Shadows.large,
    zIndex: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  infoSide: {
    paddingHorizontal: Layout.padding.sm,
    width: 100,
    gap: Layout.grid.gap.xs,
  },
  infoSideLeft: {
    alignItems: 'flex-end',
  },
  imageCard: {
    width: 100,
    height: 120,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  locationImage: {
    width: '100%',
    height: '100%',
  },
  sideInfoText: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.text,
  },
  checkInCountText: {
    ...Typography.caption2,
    color: Colors.secondaryText,
  },
});
