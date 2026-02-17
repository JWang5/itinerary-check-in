import CustomAlert from '@/src/components/alert';
import BackButton from '@/src/components/backButton';
import { CachedImage } from '@/src/components/CachedImage';
import { ConfettiAnimation } from '@/src/components/ConfettiAnimation';
import { IconButton } from '@/src/components/iconButton';
import { AddMessageModal } from '@/src/components/location/addMessageModal';
import NotFound from '@/src/components/notFound';
import { ShakeAnimation } from '@/src/components/ShakeAnimation';
import Skeleton from '@/src/components/skeleton';
import { StickyNote } from '@/src/components/StickyNote';
import { BOTTOM_OFFSET, BUTTON_SIZE, Layout } from '@/src/constants/theme/layout';
import { Colors, Shadows } from '@/src/constants/theme/theme';
import { Typography } from '@/src/constants/theme/typography';
import { useAuth } from '@/src/provider/authProvider';
import { CheckInService } from '@/src/services/checkInService';
import { LocationService } from '@/src/services/locationService';
import { StickyService } from '@/src/services/stickyService';
import { useUserCheckInStore } from '@/src/store/useUserCheckInStore';
import { useUserStickyStore } from '@/src/store/useUserStickyStore';
import { Location, Sticky } from '@/src/types/model';
import { AnimatedFlatList } from '@kanelloc/react-native-animated-header-scroll-view';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Copy, MapPin, Plus } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LocationHeaderProps {
  insets: any;
  location: Partial<Location>;
  checkInCounts: number;
  stickyCount: number;
  isCheckedIn: boolean;
  handleCheckIn: () => void;
  showMyStickies: boolean;
  setShowMyStickies: (show: boolean) => void;
  t: any;
  onLayout?: (event: LayoutChangeEvent) => void;
}

const LocationHeader = React.memo(
  ({
    insets,
    location,
    checkInCounts,
    stickyCount,
    isCheckedIn,
    handleCheckIn,
    showMyStickies,
    setShowMyStickies,
    t,
    onLayout,
  }: LocationHeaderProps) => (
    <Animated.View
      onLayout={onLayout}
      style={{
        paddingTop: insets.top + BUTTON_SIZE + Layout.padding.md + 4,
        paddingHorizontal: Layout.padding.global,
      }}>
      <CachedImage style={styles.backgroundCircle} imageKey={location.imagePath} />
      <Animated.View style={[styles.headerInfo, { marginBottom: Layout.margin.md }]}>
        <TouchableOpacity
          onPress={() => {
            if (location.name) {
              Clipboard.setStringAsync(location.name);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }}
          style={styles.nameContainer}>
          <Text style={styles.locationName}>
            {location.name} &nbsp;
            <Copy size={16} color={Colors.secondaryText} />
          </Text>
        </TouchableOpacity>

        <View style={styles.locationTag}>
          <Text style={styles.locationTagText}>{location.cityName || 'City not available'}</Text>
        </View>

        {location.address && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (location.address) {
                Clipboard.setStringAsync(location.address);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            }}
            style={styles.addressContainer}>
            <MapPin size={16} color={Colors.text} style={{ marginTop: 4 }} />
            <Text style={styles.locationAddress} numberOfLines={2}>
              {location.address} &nbsp; <Copy size={14} color={Colors.secondaryText} />
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      <Animated.View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{checkInCounts}</Text>
          <Text style={styles.statLabel}>{t('location.travelers')}</Text>
        </View>
        <View style={styles.statsDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{stickyCount}</Text>
          <Text style={styles.statLabel}>{t('location.stickyNotes')}</Text>
        </View>
        <View style={styles.statsDivider} />
        <View style={[styles.statBox, { flex: 1, alignItems: 'stretch' }]}>
          <IconButton
            icon={<MapPin />}
            text={isCheckedIn ? t('location.visited') : t('location.checkIn')}
            onPress={handleCheckIn}
            withGradient
            size="small"
            style={{ width: '100%' }}
          />
        </View>
      </Animated.View>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrapper}>
          <Text style={styles.sectionTitle}>{t('location.wallOfNotes')}</Text>
          <View style={styles.titleUnderline}>
            <LinearGradient
              colors={Colors.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFillObject]}
            />
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            showMyStickies && styles.filterButtonActive,
            { marginLeft: 'auto' },
          ]}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => setShowMyStickies(!showMyStickies)}>
          <Text style={[styles.filterButtonText, showMyStickies && styles.filterButtonTextActive]}>
            {t('stickyNotes.onlyMyNotes')}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  ),
);
LocationHeader.displayName = 'LocationHeader';

export default function LocationScreen() {
  const { id, name, imagePath, address, cityName } = useLocalSearchParams<{
    id: string;
    name?: string;
    imagePath?: string;
    address?: string;
    cityName?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const { isUserCheckedIn, addUserCheckInInLocation, removeUserCheckInByLocation } =
    useUserCheckInStore();
  const { deleteUserSticky } = useUserStickyStore();

  // Use params if available, otherwise fetch from API (for deep linking)
  const [location, setLocation] = useState<Partial<Location> | null>(
    name
      ? { id, name, imagePath: imagePath || '', address: address || '', cityName: cityName || '' }
      : null,
  );
  const [stickies, setStickies] = useState<Sticky[]>([]);
  const [showMyStickies, setShowMyStickies] = useState(false);

  const filteredStickies = React.useMemo(() => {
    return showMyStickies ? stickies.filter((s) => s.userId === session?.user?.id) : stickies;
  }, [stickies, showMyStickies, session?.user?.id]);

  const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);
  const [selectedSticky, setSelectedSticky] = useState<Sticky | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showShakeAnimation, setShowShakeAnimation] = useState(false);

  const [checkInCounts, setCheckInCounts] = useState<number>(0);
  const [stickyCount, setStickyCount] = useState<number>(0);
  const [headerHeight, setHeaderHeight] = useState(435);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    buttons?: any[];
  }>({
    title: '',
    message: '',
  });

  const showAlert = (title: string, message: string, buttons?: any[]) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const handleHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    setHeaderHeight((prev) => {
      if (Math.abs(prev - height) < 1) return prev;
      return height;
    });
  }, []);

  // Check-in logic
  const isCheckedIn = location?.id ? isUserCheckedIn(location.id) : false;

  const handleCheckIn = useCallback(async () => {
    if (!session?.user?.id) {
      showAlert(t('common.error'), t('location.mustBeLoggedInToCheckIn'));
      return;
    }
    if (!location?.id) return;

    if (isCheckedIn) {
      showAlert(t('location.confirmUncheck'), t('location.uncheckDescription'), [
        { text: t('common.cancel'), style: 'cancel', onPress: () => setAlertVisible(false) },
        {
          text: t('location.uncheck'),
          style: 'destructive',
          onPress: async () => {
            setAlertVisible(false);
            try {
              await removeUserCheckInByLocation(session.user.id, location.id!);
              setCheckInCounts((prev) => Math.max(0, prev - 1));
            } catch (error) {
              console.error('Failed to uncheck', error);
              showAlert(t('common.error'), t('common.fetchError'));
            }
          },
        },
      ]);
      return;
    }

    try {
      await addUserCheckInInLocation(session.user.id, location.id);
      setCheckInCounts((prev) => prev + 1);
      setShowShakeAnimation(true);
      // showAlert(t('common.nice'), t('location.checkedInAt', { locationName: location.name }));
    } catch (error) {
      console.error('Failed to check in', error);
      showAlert(t('common.error'), t('location.failedToCheckIn'));
    }
  }, [
    session?.user?.id,
    location?.id,
    // location?.name,
    isCheckedIn,
    addUserCheckInInLocation,
    removeUserCheckInByLocation,
    t,
  ]);

  // Pagination States
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 20;

  const scrollY = useSharedValue(0);
  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const moreStickies = await StickyService.getPaginatedStickiesByLocationId(
        id,
        nextPage,
        PAGE_SIZE,
      );

      if (moreStickies.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setStickies((prev) => [...prev, ...moreStickies]);
      setPage(nextPage);
    } catch (error) {
      console.error('Failed to load more stickies', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // if location is not passed, fetch location data from database
        if (!name) {
          const locData = await LocationService.getLocationWithCityNameById(id);
          setLocation(locData);
        }
        // fetch check in counts for this location
        const checkInCount = await CheckInService.getCheckInCountByLocationId(id);
        setCheckInCounts(checkInCount);

        // fetch stickies and sticky count due to pagination
        const [stickiesData, stickyCountData] = await Promise.all([
          StickyService.getPaginatedStickiesByLocationId(id, 0, PAGE_SIZE),
          StickyService.getStickyCountByLocationId(id),
        ]);
        setStickies(stickiesData);
        setPage(0);
        setHasMore(stickiesData.length === PAGE_SIZE);
        setStickyCount(stickyCountData);
      } catch (error) {
        console.error('Failed to fetch location data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, name]);

  // useEffect(() => {
  //   if (session?.user?.id) {
  //     fetchUserCheckedInLocationIds(session?.user?.id);
  //   }
  // }, [session?.user?.id, fetchUserCheckedInLocationIds]);

  const handleDeleteSticky = useCallback(
    async (sticky: Sticky) => {
      try {
        await deleteUserSticky(sticky.id);
        if (selectedSticky?.id === sticky.id) {
          setSelectedSticky(null);
        }
        setStickies((prev) => prev.filter((s) => s.id !== sticky.id));
        setStickyCount((prev) => prev - 1);
      } catch (error) {
        console.error('Failed to delete sticky', error);
      }
    },
    [selectedSticky?.id, deleteUserSticky],
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Skeleton width="100%" height={350} style={styles.backgroundCircle} />
        <View
          style={{ top: insets.top + 16, height: 300, paddingHorizontal: Layout.padding.global }}>
          <Skeleton width={40} height={40} borderRadius={20} />
        </View>
        <View style={{ padding: Layout.padding.global }}>
          <Skeleton width={200} height={32} style={{ marginBottom: 20 }} />
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: Layout.padding.md,
              justifyContent: 'space-between',
            }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                width="47%"
                height={180}
                borderRadius={Layout.borderRadius.cardSm}
              />
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (!location) {
    return <NotFound message={t('location.locationNotFound')} />;
  }

  return (
    <View style={[styles.container]}>
      <AnimatedFlatList
        contentContainerStyle={{ paddingBottom: BOTTOM_OFFSET }}
        columnWrapperStyle={styles.gridContent}
        keyExtractor={(item: Sticky) => item.id}
        numColumns={2}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<NotFound message={t('location.emptyWall')} />}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : null
        }
        data={filteredStickies}
        renderItem={({ item, index }: { item: Sticky; index: number }) => (
          <StickyNote
            sticky={item}
            index={index}
            onPress={setSelectedSticky}
            onDelete={handleDeleteSticky}
            isMe={item.userId === session?.user?.id}
          />
        )}
        headerMaxHeight={headerHeight}
        HeaderComponent={
          <LocationHeader
            insets={insets}
            location={location}
            checkInCounts={checkInCounts}
            stickyCount={stickyCount}
            isCheckedIn={isCheckedIn}
            handleCheckIn={handleCheckIn}
            showMyStickies={showMyStickies}
            setShowMyStickies={setShowMyStickies}
            t={t}
            onLayout={handleHeaderLayout}
          />
        }
        HeaderNavbarComponent={
          <View
            pointerEvents="box-none"
            style={[
              styles.headerTopRow,
              { paddingTop: insets.top + Layout.padding.md, paddingBottom: Layout.padding.md },
            ]}>
            <BackButton onPress={() => router.back()} />
          </View>
        }
        TopNavBarComponent={
          <View
            style={{
              paddingTop: insets.top + Layout.padding.md,
              paddingBottom: Layout.padding.md,
              flex: 1,
              width: '100%',
              backgroundColor: Colors.background,
              paddingHorizontal: Layout.padding.global,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
              <BackButton onPress={() => router.back()} />
              <View style={styles.sectionTitleWrapper}>
                <Text style={styles.sectionTitle}>{t('location.wallOfNotes')}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.filterButton, showMyStickies && styles.filterButtonActive]}
              activeOpacity={0.7}
              onPress={() => setShowMyStickies(!showMyStickies)}>
              <Text
                style={[styles.filterButtonText, showMyStickies && styles.filterButtonTextActive]}>
                {t('stickyNotes.onlyMyNotes')}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 20 }]}>
        <IconButton
          style={styles.floatingButton}
          textColor={Colors.inverseText}
          icon={<Plus />}
          text={t('location.leaveNote')}
          onPress={() => setIsMessageModalVisible(true)}
        />
      </View>

      <AddMessageModal
        isVisible={isMessageModalVisible}
        onClose={() => setIsMessageModalVisible(false)}
        locationId={id}
        userId={session?.user?.id || ''}
        onPostSuccess={(newSticky) => {
          setStickies([newSticky, ...stickies]);
          setStickyCount((prev) => prev + 1);
          setShowSuccessAnimation(true);
        }}
      />

      <Modal
        visible={!!selectedSticky}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedSticky(null)}>
        <TouchableOpacity
          style={styles.detailModalBackdrop}
          activeOpacity={1}
          onPress={() => setSelectedSticky(null)}>
          {selectedSticky && (
            <StickyNote
              variant="detail"
              sticky={selectedSticky}
              onClose={() => setSelectedSticky(null)}
              onDelete={handleDeleteSticky}
              isMe={selectedSticky.userId === session?.user?.id}
            />
          )}
        </TouchableOpacity>
      </Modal>
      <ConfettiAnimation
        visible={showSuccessAnimation}
        onAnimationComplete={() => setShowSuccessAnimation(false)}
      />
      <ShakeAnimation
        visible={showShakeAnimation}
        onAnimationComplete={() => setShowShakeAnimation(false)}
      />
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
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
  backgroundCircle: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 360,
    height: 360,
    borderRadius: 180,
  },
  headerTopRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: Layout.padding.global,
  },
  headerInfo: {
    justifyContent: 'flex-start',
    gap: Layout.grid.gap.xs,
    backgroundColor: '#ffffffb5',
    paddingVertical: Layout.padding.xs,
    paddingRight: Layout.padding.sm,
    borderRadius: Layout.borderRadius.cardMd,
    width: '75%',
  },
  locationName: {
    ...Typography.h1,
    color: Colors.text,
  },
  locationTag: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    backgroundColor: Colors.text,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Layout.borderRadius.cardXs,
  },
  locationTagText: {
    ...Typography.body2,
    color: Colors.inverseText,
  },
  locationAddress: {
    flex: 1,
    ...Typography.body2,
    color: Colors.text,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Layout.margin.sm,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.margin.text,
    width: '100%',
  },
  gridContent: {
    paddingHorizontal: Layout.padding.global,
    justifyContent: 'space-between',
    gap: Layout.padding.md,
    marginBottom: Layout.padding.lg,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Layout.padding.global,
  },
  floatingButton: {
    backgroundColor: Colors.text,
    ...Shadows.large,
  },
  detailModalBackdrop: {
    flex: 1,
    backgroundColor: Colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.margin.xl,
    paddingBottom: Layout.padding.md,
    backgroundColor: Colors.background,
  },
  sectionTitleWrapper: {
    position: 'relative',
  },
  sectionTitle: {
    textAlign: 'center',
    ...Typography.h3,
    color: Colors.text,
  },
  titleUnderline: {
    height: 6,
    borderRadius: 3,
    zIndex: 1,
  },
  verifiedStamp: {
    position: 'absolute',
    top: 380,
    right: 24,
    width: 65,
    height: 65,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-15deg' }],
    zIndex: 999,
  },
  verifiedStampInner: {
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text,
  },
  footerLoader: {
    paddingVertical: Layout.padding.lg,
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.cardMd,
    gap: Layout.grid.gap.sm,
    padding: Layout.padding.md,
    ...Shadows.soft,
  },
  statBox: {
    alignItems: 'center',
    minWidth: 48,
  },
  statNumber: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Layout.margin.text,
  },
  statLabel: {
    ...Typography.h4,
    color: Colors.secondaryText,
  },
  statsDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.padding.sm,
    borderRadius: Layout.borderRadius.cardSm,
    backgroundColor: Colors.buttonBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 38,
  },
  filterButtonActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  filterButtonText: {
    ...Typography.label,
    fontWeight: '600',
    color: Colors.text,
  },
  filterButtonTextActive: {
    color: Colors.inverseText,
  },
});
