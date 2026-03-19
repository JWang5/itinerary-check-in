import { Background } from '@/src/components/Background';
import { CachedImage } from '@/src/components/CachedImage';
import NotFound from '@/src/components/notFound';
import Skeleton from '@/src/components/skeleton';
import { Tab } from '@/src/components/Tab';
import { Layout, NAVBAR_HEIGHT } from '@/src/constants/theme/layout';
import { Colors, Shadows } from '@/src/constants/theme/theme';
import { Typography } from '@/src/constants/theme/typography';
import { useAuth } from '@/src/provider/authProvider';
import { ItineraryService } from '@/src/services/itineraryService';
import { Itinerary } from '@/src/types/model';
import { calculateItineraryStatus, formatToShortDate } from '@/src/utils/date';
import { AnimatedFlatList } from '@kanelloc/react-native-animated-header-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useFocusEffect, useRouter } from 'expo-router';
import { Calendar, Plus } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ItineraryCardProps {
  itinerary: Itinerary;
  startDateStr: string;
  endDateStr: string;
}

const ItineraryCard = ({ itinerary, startDateStr, endDateStr }: ItineraryCardProps) => {
  const isPassed = itinerary.status === 'past';
  const isOngoing = itinerary.status === 'ongoing';
  const { t } = useTranslation();

  return (
    <Link href={`/itinerary/${itinerary.id}`} asChild>
      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <View style={styles.cardImageContainer}>
          <CachedImage imageKey={itinerary.coverImagePath} style={styles.cardImage} />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0, 0, 0, 0.3)']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isPassed ? 'rgba(218, 218, 218, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              },
            ]}>
            {isOngoing && (
              <LinearGradient
                colors={Colors.gradient}
                style={{
                  ...StyleSheet.absoluteFillObject,
                  borderRadius: Layout.borderRadius.buttonRounded,
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            )}
            <Text
              style={[styles.statusText, { color: isPassed ? Colors.secondaryText : Colors.text }]}>
              {t(`itinerary.status.${itinerary.status}`).toUpperCase()}
            </Text>
          </View>

          <View style={styles.cardHeaderOverlay}>
            <Text style={styles.cardTitle}>{itinerary.title}</Text>
            <View style={styles.locationRow}>
              <Calendar size={14} color={Colors.inverseText} />
              <Text style={styles.locationDetailText}>
                {startDateStr}
                {endDateStr === startDateStr ? '' : `—${endDateStr}`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.upcomingContent}>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {itinerary.description}
            </Text>
            <View style={styles.upcomingFooter}>
              <Text style={styles.plannedCountText}>
                {itinerary.totalLocations} {t('itinerary.locationsPlaned')}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default function ItinerariesScreen() {
  const insets = useSafeAreaInsets();
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'planned' | 'past'>('planned');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { session } = useAuth();
  const [headerHeight, setHeaderHeight] = useState(250);

  const [refreshing, setRefreshing] = useState(false);

  const fetchPlans = useCallback(
    async (isRefresh = false) => {
      if (!session?.user) return;
      try {
        if (!isRefresh) setLoading(true);
        const stored = await ItineraryService.getItinerariesByUser(session.user.id);
        const mappedStored = stored.map((plan) => {
          return {
            ...plan,
            status: calculateItineraryStatus(plan.startDate, plan.endDate),
            coverImagePath: plan.coverImagePath,
          };
        });
        setItineraries(mappedStored);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session],
  );

  useFocusEffect(
    useCallback(() => {
      fetchPlans();
    }, [fetchPlans]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlans(true);
  };

  const filteredItineraries = itineraries.filter((plan) => {
    if (activeTab === 'planned') {
      return plan.status === 'ongoing' || plan.status === 'upcoming';
    }
    return plan.status === 'past';
  });

  const localizedItineraries = useMemo(
    () =>
      filteredItineraries.map((plan) => ({
        ...plan,
        startDateStr: formatToShortDate(plan.startDate),
        endDateStr: formatToShortDate(plan.endDate),
      })),
    [filteredItineraries],
  );

  if (loading && itineraries.length === 0) {
    return (
      <View style={styles.container}>
        <Background />
        <View
          style={{
            paddingTop: insets.top + Layout.padding.md,
            paddingHorizontal: Layout.padding.global,
          }}>
          <Skeleton
            width={150}
            height={40}
            borderRadius={8}
            style={{ marginBottom: Layout.margin.xl }}
          />
          <View style={styles.tabContainer}>
            <Skeleton width={80} height={36} borderRadius={18} />
            <Skeleton width={80} height={36} borderRadius={18} />
          </View>

          <View style={{ marginTop: Layout.margin.lg }}>
            {[1, 2].map((i) => (
              <View key={i} style={{ height: 320 }}>
                <Skeleton
                  width="100%"
                  height={200}
                  borderRadius={Layout.borderRadius.cardLg}
                  style={{ marginBottom: 16 }}
                />
                <Skeleton width="80%" height={24} borderRadius={6} style={{ marginBottom: 8 }} />
                <Skeleton width="60%" height={16} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Background />
      <View style={{ paddingTop: insets.top + Layout.padding.md }}>
        <AnimatedFlatList
          headerMaxHeight={headerHeight}
          data={localizedItineraries}
          renderItem={({ item }) => (
            <ItineraryCard
              itinerary={item}
              startDateStr={item.startDateStr}
              endDateStr={item.endDateStr}
            />
          )}
          keyExtractor={(item: Itinerary) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          HeaderComponent={
            <View
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                setHeaderHeight((prev) => {
                  if (Math.abs(prev - height) < 1) return prev;
                  return height;
                });
              }}
              style={{
                paddingHorizontal: Layout.padding.global,
                paddingBottom: Layout.padding.md,
              }}>
              <Text style={styles.headerTitle}>{t('itinerary.title')}</Text>
              <View style={styles.tabContainer}>
                <Tab
                  label={t('itinerary.tabs.planned')}
                  isActive={activeTab === 'planned'}
                  onPress={() => setActiveTab('planned')}
                />
                <Tab
                  label={t('itinerary.tabs.past')}
                  isActive={activeTab === 'past'}
                  onPress={() => setActiveTab('past')}
                />
              </View>
            </View>
          }
          TopNavBarComponent={
            <View
              style={[
                styles.topNavBar,
                { paddingTop: insets.top + Layout.padding.md, paddingBottom: Layout.padding.md },
              ]}>
              <Text style={styles.topNavBarTitle}>
                {activeTab === 'planned' ? t('itinerary.tabs.planned') : t('itinerary.tabs.past')}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <NotFound
              message={
                activeTab === 'planned'
                  ? t('itinerary.noRoutePlanned')
                  : t('itinerary.emptyPastRoute')
              }
            />
          }
        />
      </View>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/itinerary/create')}
        activeOpacity={0.8}>
        <Plus size={32} color={Colors.inverseText} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Layout.margin.xl,
  },
  listContent: {
    paddingHorizontal: Layout.padding.global,
    paddingBottom: NAVBAR_HEIGHT,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.cardLg,
    marginBottom: Layout.margin.lg,
    overflow: 'hidden',
    ...Shadows.large,
  },
  cardImageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  statusBadge: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: Layout.borderRadius.buttonRounded,
    top: Layout.padding.md,
    right: Layout.padding.md,
    paddingHorizontal: Layout.padding.md,
    paddingVertical: Layout.padding.xs,
  },
  statusText: {
    ...Typography.label,
    fontWeight: 'bold',
  },
  cardHeaderOverlay: {
    position: 'absolute',
    bottom: Layout.padding.md,
    left: Layout.padding.md,
    right: Layout.padding.md,
  },
  cardTitle: {
    ...Typography.h2,
    color: Colors.inverseText,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationDetailText: {
    ...Typography.body3,
    color: Colors.inverseText,
  },
  cardFooter: {
    paddingHorizontal: Layout.padding.global,
    paddingVertical: Layout.padding.md,
  },
  upcomingContent: {
    gap: Layout.grid.gap.md,
  },
  descriptionText: {
    ...Typography.body3,
    color: Colors.secondaryText,
  },
  upcomingFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Layout.padding.md,
  },
  plannedCountText: {
    ...Typography.body3,
    fontWeight: 'bold',
    color: Colors.text,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 72,
    height: 72,
    borderRadius: Layout.borderRadius.buttonRounded,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.large,
  },
  topNavBar: {
    width: '100%',
    backgroundColor: Colors.background,
    paddingHorizontal: Layout.padding.global,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topNavBarTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: Layout.margin.md,
  },
});
