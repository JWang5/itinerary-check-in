import BackButton from '@/src/components/backButton';
import { CachedImage } from '@/src/components/CachedImage';
import { Category } from '@/src/components/category';
import { PathMap } from '@/src/components/city/pathMap';
import NotFound from '@/src/components/notFound';
import Skeleton from '@/src/components/skeleton';
import { BOTTOM_OFFSET, BUTTON_SIZE, Layout } from '@/src/constants/theme/layout';
import { Colors, Shadows } from '@/src/constants/theme/theme';
import { Typography } from '@/src/constants/theme/typography';
import { CheckInService } from '@/src/services/checkInService';
import { CityService } from '@/src/services/cityService';
import { LocationService } from '@/src/services/locationService';
import { Location } from '@/src/types/model';
import {
  AnimatedFlatList,
  AnimatedScrollView,
} from '@kanelloc/react-native-animated-header-scroll-view';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { LayoutGrid, Map as MapIcon } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CityScreen() {
  const { id, name } = useLocalSearchParams<{
    id: string;
    name?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [cityName, setCityName] = useState<string | null>(name || null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [checkInCounts, setCheckInCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [headerHeight, setHeaderHeight] = useState(150);

  const scrollY = useSharedValue(0);
  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (!name) {
          const cityName = await CityService.getCityNameById(id);
          setCityName(cityName);
        }
        const locs = await LocationService.getLocationsByCity(id);
        setLocations(locs);
      } catch (error) {
        console.error('Failed to fetch city and locations', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, name]);

  // Refresh check-in counts when screen comes into focus
  const refreshCheckInCounts = useCallback(async () => {
    if (locations.length === 0) return;
    try {
      const locationIds = locations.map((loc) => loc.id);
      const counts = await CheckInService.getCheckInCountsByLocationIds(locationIds);
      setCheckInCounts(counts);
    } catch (error) {
      console.error('Failed to refresh check-in counts', error);
    }
  }, [locations]);

  useFocusEffect(
    useCallback(() => {
      refreshCheckInCounts();
    }, [refreshCheckInCounts]),
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View
          style={{
            paddingTop: insets.top + Layout.padding.md,
            position: 'relative',
          }}>
          <View
            style={{
              paddingHorizontal: Layout.padding.global,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: Layout.margin.md,
            }}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <Skeleton width={80} height={40} borderRadius={20} />
          </View>
          <View style={styles.titleRow}>
            <Skeleton width={150} height={36} />
          </View>
        </View>
        <View style={{ gap: Layout.grid.gap.lg, paddingHorizontal: Layout.padding.global }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height={140} borderRadius={Layout.borderRadius.cardMd} />
          ))}
        </View>
      </View>
    );
  }

  if (!cityName) {
    return <NotFound message={t('city.cityNotFound')} />;
  }

  const ViewSwitcher = () => (
    <Animated.View style={[styles.viewSwitcher]}>
      <TouchableOpacity
        style={[styles.switchTab, viewMode === 'map' && styles.activeTab]}
        onPress={() => setViewMode('map')}>
        <MapIcon size={20} color={viewMode === 'map' ? Colors.inverseText : Colors.secondaryText} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.switchTab, viewMode === 'list' && styles.activeTab]}
        onPress={() => setViewMode('list')}>
        <LayoutGrid
          size={20}
          color={viewMode === 'list' ? Colors.inverseText : Colors.secondaryText}
        />
      </TouchableOpacity>
    </Animated.View>
  );

  const NavHeader = () => (
    <View style={[styles.headerTopRow, { paddingTop: insets.top + Layout.padding.md }]}>
      <BackButton onPress={() => router.back()} />
      <ViewSwitcher />
    </View>
  );

  const Header = () => (
    <View
      onLayout={(e) => {
        const height = e.nativeEvent.layout.height;
        setHeaderHeight((prev) => {
          if (Math.abs(prev - height) < 1) return prev;
          return height;
        });
      }}
      style={{
        paddingTop: insets.top + Layout.padding.md + BUTTON_SIZE,
        paddingHorizontal: Layout.padding.global,
      }}>
      <Text style={[styles.headerTitle]} numberOfLines={1}>
        {cityName}
      </Text>
    </View>
  );

  const TopHeader = () => (
    <View
      style={[
        styles.headerTopRow,
        { paddingTop: insets.top + Layout.padding.md, paddingBottom: Layout.padding.md },
      ]}>
      <View style={styles.headerLeft}>
        <BackButton onPress={() => router.back()} />
        <Text style={[styles.headerTitleSmall]} numberOfLines={1}>
          {cityName}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {viewMode === 'map' ? (
        <AnimatedScrollView
          headerMaxHeight={headerHeight}
          scrollEventThrottle={16}
          disableScale={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ width: '100%', paddingHorizontal: Layout.padding.global }}
          HeaderNavbarComponent={<NavHeader />}
          HeaderComponent={<Header />}
          TopNavBarComponent={<TopHeader />}>
          <View style={styles.content}>
            {locations.length > 0 ? (
              <PathMap
                locations={locations}
                checkInCounts={checkInCounts}
                cityName={cityName || ''}
              />
            ) : (
              <NotFound message={t('city.noLocations')} />
            )}
          </View>
        </AnimatedScrollView>
      ) : (
        <AnimatedFlatList
          data={locations}
          headerMaxHeight={headerHeight}
          keyExtractor={(item: Location) => item.id}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[styles.listContent]}
          showsVerticalScrollIndicator={false}
          HeaderNavbarComponent={<NavHeader />}
          HeaderComponent={<Header />}
          TopNavBarComponent={<TopHeader />}
          renderItem={({ item }: { item: Location }) => (
            <TouchableOpacity
              style={styles.locationCardLarge}
              onPress={() =>
                router.push({
                  pathname: '/location/[id]',
                  params: {
                    id: item.id,
                    name: item.name,
                    imagePath: item.imagePath,
                    address: item.address,
                    cityName: cityName,
                  },
                })
              }>
              <CachedImage imageKey={item.imagePath} style={styles.cardImageLarge} />
              <View style={styles.cardInfoLarge}>
                <Text style={styles.cardNameLarge} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.cardDescLarge} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>

              <View style={styles.cornerBadge}>
                <Category
                  name={`${checkInCounts[item.id] || 0} ${t('location.visited')}`}
                  isActive={true}
                  onPress={() => {}}
                />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<NotFound message={t('city.noLocations')} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.viewBackground,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Layout.grid.gap.md,
  },
  headerTopRow: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Layout.padding.global,
  },
  headerLeftLarge: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Layout.grid.gap.md,
    flex: 1,
  },
  headerTitleSmall: {
    ...Typography.h3,
    color: Colors.text,
    flex: 1,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.text,
  },
  titleRow: {
    paddingHorizontal: Layout.padding.global,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Layout.margin.md,
  },
  viewSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.buttonRounded,
    padding: 2,
    gap: 2,
  },
  switchTab: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.text,
  },
  content: {
    paddingVertical: 0,
  },
  listContent: {
    gap: Layout.grid.gap.lg,
    paddingBottom: BOTTOM_OFFSET,
    paddingHorizontal: Layout.padding.global,
  },
  locationCardLarge: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
    borderRadius: Layout.borderRadius.cardMd,
    padding: Layout.padding.sm,
    ...Shadows.soft,
  },
  cardImageLarge: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  cardInfoLarge: {
    flex: 1,
    padding: Layout.padding.md,
    justifyContent: 'center',
    gap: Layout.grid.gap.xs,
  },
  cardNameLarge: {
    marginTop: 8,
    ...Typography.caption,
    color: Colors.text,
  },
  cornerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  cardDescLarge: {
    ...Typography.caption2,
    color: Colors.secondaryText,
  },
});
