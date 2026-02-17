import Alert from '@/src/components/alert';
import BackButton from '@/src/components/backButton';
import { CachedImage } from '@/src/components/CachedImage';
import { DetailRouteItem } from '@/src/components/itinerary/DetailRouteItem';
import Skeleton from '@/src/components/skeleton';
import { Tab } from '@/src/components/Tab';
import { Layout } from '@/src/constants/theme/layout';
import { Colors } from '@/src/constants/theme/theme';
import { Typography } from '@/src/constants/theme/typography';
import { ItineraryService } from '@/src/services/itineraryService';
import {
  formatToShortDate,
  formatToTime,
  getDaysCount,
  parseTimeToMinutes,
} from '@/src/utils/date';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Pencil, Trash2 } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ItineraryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [itinerary, setItinerary] = useState<any>(null);
  const [activeDay, setActiveDay] = useState(0);

  const [isInitialized, setIsInitialized] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    buttons?: {
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }[];
  }>({ title: '', message: '' });

  const showAlert = (
    title: string,
    message: string,
    buttons?: {
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }[],
  ) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideAlert = () => {
    setAlertVisible(false);
  };

  const handleDelete = () => {
    showAlert(t('common.confirm'), t('itinerary.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel', onPress: hideAlert },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            if (id) {
              await ItineraryService.deleteItinerary(id);
              router.back();
            }
          } catch (error) {
            console.error(error);
            showAlert(t('common.error'), t('itinerary.deleteError'));
          }
        },
      },
    ]);
  };

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const fetchItinerary = useCallback(async () => {
    if (!id) return;
    try {
      const found = await ItineraryService.getItineraryWithItems(id);
      if (found) {
        setItinerary(found);
      }
    } finally {
      setIsInitialized(true);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchItinerary();
    }, [fetchItinerary]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItinerary();
    setRefreshing(false);
  };

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        {/* Header Skeleton */}
        <View style={styles.headerContainer}>
          <Skeleton width="100%" height="100%" borderRadius={0} />
          <LinearGradient colors={['transparent', '#fff']} style={styles.headerGradient} />
          <SafeAreaView style={styles.headerTopActions}>
            <Skeleton width={44} height={44} borderRadius={22} />
            <Skeleton width={44} height={44} borderRadius={22} />
          </SafeAreaView>
          <View style={styles.headerContent}>
            <Skeleton width="80%" height={32} borderRadius={8} style={{ marginBottom: 8 }} />
            <Skeleton width="60%" height={18} borderRadius={6} style={{ marginBottom: 8 }} />
          </View>
        </View>

        {/* Content Skeleton */}
        <View style={styles.content}>
          {/* Day Selector Skeleton */}
          <View style={styles.daySelectorContainer}>
            <View style={{ flexDirection: 'row', gap: Layout.grid.gap.md }}>
              <Skeleton width={70} height={36} borderRadius={18} />
              <Skeleton width={70} height={36} borderRadius={18} />
              <Skeleton width={70} height={36} borderRadius={18} />
            </View>
          </View>

          {/* Route Items Skeleton */}
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.routeItemSkeleton}>
              <Skeleton width={60} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
              <View style={styles.routeCardSkeleton}>
                <Skeleton width={90} height={80} borderRadius={Layout.borderRadius.cardSm} />
                <View style={{ flex: 1, marginLeft: Layout.margin.sm, gap: 8 }}>
                  <Skeleton width="70%" height={16} borderRadius={4} />
                  <Skeleton width="90%" height={14} borderRadius={4} />
                  <Skeleton width="50%" height={12} borderRadius={4} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (!itinerary) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <Text style={{ color: Colors.secondaryText }}>Itinerary not found</Text>
        </View>
      </View>
    );
  }

  const startDate = new Date(itinerary.startDate);
  const endDate = new Date(itinerary.endDate);
  const daysCount = getDaysCount(startDate, endDate);

  const dayData = (itinerary.itineraryItems || [])
    .filter((item: any) => item.day === activeDay)
    .sort(
      (a: any, b: any) =>
        parseTimeToMinutes(formatToTime(a.timestamp)) -
        parseTimeToMinutes(formatToTime(b.timestamp)),
    );

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{
          paddingBottom: insets.bottom + Layout.padding.globalBottom,
        }}>
        <View style={styles.headerContainer}>
          <CachedImage imageKey={itinerary.coverImagePath} style={styles.headerImage} />
          <LinearGradient colors={['transparent', '#fff']} style={styles.headerGradient} />
          <SafeAreaView style={styles.headerTopActions}>
            <BackButton onPress={() => router.back()} style={styles.circularButton} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={styles.circularButton}
                onPress={() => router.push(`/itinerary/create?id=${id}`)}>
                <Pencil size={20} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.circularButton} onPress={handleDelete}>
                <Trash2 size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <View style={styles.headerContent}>
            <Text numberOfLines={2} style={styles.headerTitle}>
              {itinerary.title}
            </Text>
          </View>
        </View>
        <View style={styles.content}>
          <View style={{ marginBottom: Layout.margin.md }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: Layout.grid.gap.xs,
              }}>
              <Calendar style={{ marginTop: 3 }} size={16} color={Colors.secondaryText} />
              <Text style={styles.headerDate}>
                {formatToShortDate(itinerary.startDate)}
                {'—'}
                {formatToShortDate(itinerary.endDate)}
              </Text>
            </View>

            {itinerary.description ? (
              <Text numberOfLines={2} style={styles.headerDescription}>
                {itinerary.description}
              </Text>
            ) : null}
          </View>
          <View style={styles.daySelectorContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.daySelectorScroll}>
              {Array.from({ length: daysCount }).map((_, i) => (
                <Tab
                  key={i}
                  label={t('itinerary.day', { day: i + 1 })}
                  isActive={activeDay === i}
                  onPress={() => setActiveDay(i)}
                />
              ))}
            </ScrollView>
          </View>

          <View>
            {dayData.map((item: any, index: number) => (
              <DetailRouteItem
                key={item.id}
                location={item.location}
                time={formatToTime(item.timestamp)}
                isFirst={index === 0}
                isLast={index === dayData.length - 1}
              />
            ))}
            {dayData.length === 0 && (
              <View style={styles.emptyRoute}>
                <Text style={styles.emptyRouteText}>{t('itinerary.emptyRoute')}</Text>
              </View>
            )}
          </View>
        </View>
      </Animated.ScrollView>
      <Alert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.viewBackground,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  headerTopActions: {
    position: 'absolute',
    top: Layout.padding.md,
    left: Layout.padding.global,
    right: Layout.padding.global,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  circularButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.buttonBackgroundTranslucent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    position: 'absolute',
    bottom: 0,
    left: Layout.padding.global,
    right: Layout.padding.global,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Layout.margin.text,
    width: '80%',
  },
  headerDescription: {
    ...Typography.body2,
    color: Colors.text,
  },
  headerDate: {
    ...Typography.body2,
    color: Colors.secondaryText,
    marginBottom: Layout.margin.text,
  },
  content: {
    paddingHorizontal: Layout.padding.global,
  },
  daySelectorContainer: {
    marginBottom: Layout.margin.md,
  },
  daySelectorScroll: {
    gap: Layout.grid.gap.md,
  },
  emptyRoute: {
    padding: Layout.padding.xl,
    alignItems: 'center',
    borderRadius: Layout.borderRadius.cardMd,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginTop: Layout.margin.xl,
  },
  emptyRouteText: {
    ...Typography.body2,
    color: Colors.secondaryText,
    fontStyle: 'italic',
  },
  routeItemSkeleton: {
    marginBottom: Layout.margin.md,
  },
  routeCardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.cardMd,
    padding: Layout.padding.sm,
  },
});
