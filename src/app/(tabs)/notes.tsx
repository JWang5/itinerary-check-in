import { Background } from '@/src/components/Background';
import NotFound from '@/src/components/notFound';
import Skeleton from '@/src/components/skeleton';
import { StickyNote } from '@/src/components/StickyNote';
import { Tab } from '@/src/components/Tab';
import { Layout, NAVBAR_HEIGHT } from '@/src/constants/theme/layout';
import { Colors } from '@/src/constants/theme/theme';
import { Typography } from '@/src/constants/theme/typography';
import { useAuth } from '@/src/provider/authProvider';
import { CityService } from '@/src/services/cityService';
import { LocationService } from '@/src/services/locationService';
import { StickyService } from '@/src/services/stickyService';
import { useUserStickyStore } from '@/src/store/useUserStickyStore';
import { Location, Sticky } from '@/src/types/model';
import { AnimatedFlatList } from '@kanelloc/react-native-animated-header-scroll-view';
import { useFocusEffect } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FilterHeaderProps {
  searchQuery: string;
  setSearchQuery: (text: string) => void;
  allCities: { id: string; name: string }[];
  selectedCityId: string;
  setSelectedCityId: (id: string) => void;
  displayedLocations: { id: string; name: string; cityId: string }[];
  selectedLocationId: string;
  setSelectedLocationId: (id: string) => void;
  showMyStickies: boolean;
  setShowMyStickies: (show: boolean) => void;
}

const FilterHeaderComponent = React.memo(
  ({
    searchQuery,
    setSearchQuery,
    allCities,
    selectedCityId,
    setSelectedCityId,
    displayedLocations,
    selectedLocationId,
    setSelectedLocationId,
    showMyStickies,
    setShowMyStickies,
  }: FilterHeaderProps) => {
    const { t } = useTranslation();

    return (
      <View style={[styles.headerContainer]}>
        <View
          style={{
            paddingHorizontal: Layout.padding.global,
            marginBottom: Layout.padding.lg,
          }}>
          <Text style={styles.headerTitle}>{t('stickyNotes.title')}</Text>
        </View>
        {/* Row 1: Search Bar & Reset */}
        <View style={styles.searchRow}>
          <View style={styles.searchBarContainer}>
            <Search size={14} color={Colors.secondaryText} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('stickyNotes.searchPlaceholder')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.secondaryText}
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color={Colors.secondaryText} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.filterButtonRow, showMyStickies && styles.filterButtonActive]}
            activeOpacity={0.7}
            onPress={() => setShowMyStickies(!showMyStickies)}>
            <Text
              style={[styles.filterButtonText, showMyStickies && styles.filterButtonTextActive]}>
              {t('stickyNotes.myNotes')}
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity onPress={handleResetFilters}>
            <RotateCcw size={20} color={Colors.secondaryText} />
          </TouchableOpacity> */}
        </View>
        <View style={{ gap: Layout.padding.sm }}>
          {/* Row 2: City Categories */}
          <FlatList
            data={allCities}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item }) => (
              <Tab
                style={{
                  backgroundColor: Colors.buttonBackground,
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}
                label={item.name}
                isActive={selectedCityId === item.id}
                onPress={() => setSelectedCityId(item.id)}
              />
            )}
          />
          {/* Row 3: Location Categories (Conditional) */}
          {selectedCityId !== 'all' && displayedLocations.length > 0 && (
            <FlatList
              data={displayedLocations}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.categoriesList}
              renderItem={({ item }) => (
                <Tab
                  style={{
                    backgroundColor: Colors.buttonBackground,
                    borderWidth: 1,
                    borderColor: Colors.border,
                  }}
                  label={item.name}
                  isActive={selectedLocationId === item.id}
                  onPress={() => setSelectedLocationId(item.id)}
                />
              )}
            />
          )}
        </View>
      </View>
    );
  },
);

FilterHeaderComponent.displayName = 'FilterHeaderComponent';

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const scrollY = useSharedValue(0);
  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const [stickies, setStickies] = useState<Sticky[]>([]);
  const [selectedSticky, setSelectedSticky] = useState<Sticky | null>(null);

  // Pagination States
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 20;

  // Filter States
  const [allCities, setAllCities] = useState<{ id: string; name: string }[]>([]);
  const [allLocations, setAllLocations] = useState<{ id: string; name: string; cityId: string }[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<string>('all');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [showMyStickies, setShowMyStickies] = useState(false);

  const { deleteUserSticky } = useUserStickyStore();

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCityId('all');
    setSelectedLocationId('all');
    setShowMyStickies(false);
  }, []);

  const fetchData = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        const [stickiesData, citiesData, locationsData] = await Promise.all([
          StickyService.getPaginatedStickies(0, PAGE_SIZE),
          CityService.getAllCities(),
          LocationService.getAllLocationNames(),
        ]);
        setStickies(stickiesData);
        setPage(0);
        setHasMore(stickiesData.length === PAGE_SIZE);
        setAllCities([{ id: 'all', name: t('common.all') }, ...citiesData]);
        setAllLocations(locationsData);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [t],
  );

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const moreStickies = await StickyService.getPaginatedStickies(nextPage, PAGE_SIZE);

      if (moreStickies.length < PAGE_SIZE) {
        setHasMore(false);
      }

      setStickies((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const uniqueMore = moreStickies.filter((s) => !existingIds.has(s.id));
        return [...prev, ...uniqueMore];
      });
      setPage(nextPage);
    } catch (error) {
      console.error('Failed to load more stickies', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      handleResetFilters();
      setRefreshing(true);
      fetchData(false);
    }, [fetchData, handleResetFilters]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  // TODO filter function in SQL
  const filteredStickies = useMemo(() => {
    return stickies.filter((sticky) => {
      const searchStr = (
        (sticky.text || '') +
        (sticky.locationName || '') +
        (sticky.cityName || '')
      ).toLowerCase();
      const matchesSearch = searchQuery === '' || searchStr.includes(searchQuery.toLowerCase());

      const matchesCity = selectedCityId === 'all' || sticky.cityId === selectedCityId;
      const matchesLocation =
        selectedLocationId === 'all' || sticky.locationId === selectedLocationId;
      const matchesUser = !showMyStickies || sticky.userId === session?.user?.id;

      return matchesSearch && matchesCity && matchesLocation && matchesUser;
    });
  }, [
    stickies,
    searchQuery,
    selectedCityId,
    selectedLocationId,
    showMyStickies,
    session?.user?.id,
  ]);

  const displayedLocations = useMemo(() => {
    if (selectedCityId === 'all') return [];
    const locs = allLocations.filter((loc) => loc.cityId === selectedCityId);
    return [{ id: 'all', name: t('common.all') } as Location, ...locs];
  }, [allLocations, selectedCityId, t]);

  const handleDeleteSticky = useCallback(
    async (sticky: Sticky) => {
      try {
        await deleteUserSticky(sticky.id);
        setStickies((prev) => prev.filter((s) => s.id !== sticky.id));
        if (selectedSticky?.id === sticky.id) {
          setSelectedSticky(null);
        }
      } catch (error) {
        console.error('Failed to delete sticky', error);
      }
    },
    [selectedSticky?.id, deleteUserSticky],
  );

  // Reset location filter when city changes
  useEffect(() => {
    setSelectedLocationId('all');
  }, [selectedCityId]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <View style={{ flex: 1, paddingTop: insets.top + Layout.padding.md }}>
          <View style={[styles.headerContainer]}>
            <Skeleton
              width={180}
              height={36}
              borderRadius={20}
              style={{ marginBottom: Layout.margin.md, marginHorizontal: Layout.padding.global }}
            />
            <View style={styles.searchRow}>
              <Skeleton
                height={44}
                style={{ flex: 1 }}
                borderRadius={Layout.borderRadius.buttonRounded}
              />
              <Skeleton width={24} height={24} borderRadius={12} />
            </View>
            <View style={{ gap: Layout.padding.sm }}>
              <View style={styles.categoriesList}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} width={80} height={32} borderRadius={16} />
                  ))}
                </View>
              </View>
            </View>
          </View>
          <View style={{ paddingHorizontal: Layout.padding.global, paddingTop: Layout.padding.md }}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: Layout.padding.md,
                justifyContent: 'space-between',
              }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
      </View>
    );
  }

  const TopNavBar = () => (
    <View
      style={[
        styles.topNavBar,
        { paddingTop: insets.top + Layout.padding.md, paddingBottom: Layout.padding.md },
      ]}>
      <Text style={styles.topNavBarTitle}>{t('stickyNotes.title')}</Text>
      <TouchableOpacity
        style={[styles.filterButton, showMyStickies && styles.filterButtonActive]}
        activeOpacity={0.7}
        onPress={() => setShowMyStickies(!showMyStickies)}>
        <Text style={[styles.filterButtonText, showMyStickies && styles.filterButtonTextActive]}>
          {t('stickyNotes.myNotes')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Background />
      <View style={{ flex: 1, paddingTop: insets.top + Layout.padding.md }}>
        <AnimatedFlatList
          headerMaxHeight={250}
          data={filteredStickies}
          keyExtractor={(item: Sticky) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          HeaderComponent={
            <FilterHeaderComponent
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              allCities={allCities}
              selectedCityId={selectedCityId}
              setSelectedCityId={setSelectedCityId}
              displayedLocations={displayedLocations}
              selectedLocationId={selectedLocationId}
              setSelectedLocationId={setSelectedLocationId}
              showMyStickies={showMyStickies}
              setShowMyStickies={setShowMyStickies}
            />
          }
          TopNavBarComponent={<TopNavBar />}
          contentContainerStyle={{
            paddingBottom: insets.bottom + NAVBAR_HEIGHT,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            ) : null
          }
          renderItem={({ item, index }: { item: Sticky; index: number }) => (
            <StickyNote
              showHeader={true}
              sticky={item}
              index={index}
              onPress={setSelectedSticky}
              isMe={item.userId === session?.user?.id}
            />
          )}
          ListEmptyComponent={<NotFound message={t('stickyNotes.emptyWall')} />}
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
                showHeader
                variant="detail"
                sticky={selectedSticky}
                onClose={() => setSelectedSticky(null)}
                onDelete={handleDeleteSticky}
                isMe={selectedSticky.userId === session?.user?.id}
              />
            )}
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flex: 1,
    width: '100%',
    gap: Layout.grid.gap.sm,
  },
  topNavBar: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.background,
    paddingHorizontal: Layout.padding.global,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  topNavBarTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.text,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.padding.global,
    gap: Layout.padding.xs,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: Layout.padding.md,
    borderRadius: Layout.borderRadius.cardSm,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 40,
  },
  searchIcon: {
    marginRight: Layout.padding.xs,
  },
  searchInput: {
    flex: 1,
    ...Typography.label,
    color: Colors.text,
    height: '100%',
  },
  categoriesList: {
    paddingHorizontal: Layout.padding.global,
    gap: Layout.grid.gap.xs,
    alignItems: 'center',
  },
  gridContent: {
    justifyContent: 'space-between',
    gap: Layout.padding.md,
    marginBottom: Layout.padding.md,
    paddingHorizontal: Layout.padding.global,
  },
  detailModalBackdrop: {
    flex: 1,
    backgroundColor: Colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  footerLoader: {
    paddingVertical: Layout.padding.lg,
    alignItems: 'center',
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
  filterButtonRow: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.padding.sm,
    borderRadius: Layout.borderRadius.cardSm,
    backgroundColor: Colors.buttonBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 40,
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
