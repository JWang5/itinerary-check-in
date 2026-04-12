import { Background } from '@/src/components/Background';
import { CachedImage } from '@/src/components/CachedImage';
import Skeleton from '@/src/components/skeleton';
import { Tab } from '@/src/components/Tab';
import { Layout, NAVBAR_HEIGHT } from '@/src/constants/theme/layout';
import { Colors, Shadows } from '@/src/constants/theme/theme';
import { Typography } from '@/src/constants/theme/typography';
import { CityService } from '@/src/services/cityService';
import { LocationService } from '@/src/services/locationService';
import { City, Location } from '@/src/types/model';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const SPACING = Layout.padding.lg;
const GRID_GAP = Layout.grid.gap.md;
const ITEM_WIDTH = (width - Layout.padding.global * 2 - GRID_GAP) / 2;

interface CategorySection {
  categoryId: string;
  categoryName: string;
  data: City[]; // Required by SectionList
}

export default function ExploreScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [sections, setSections] = useState<CategorySection[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
  }, [activeCategory]);

  const loadData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const [categoriesData, topDestinationsData] = await Promise.all([
        CityService.getCategoriesWithCities(),
        LocationService.getTopDestinations(),
      ]);

      const filteredData = categoriesData.filter((section) => section.cities.length > 0);
      const formattedSections = filteredData.map((section) => ({
        categoryId: section.categoryId,
        categoryName: section.categoryName,
        data: section.cities,
      }));
      setSections(formattedSections);
      setLocations(topDestinationsData);
    } catch (error) {
      console.error('Failed to fetch explore data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  // Get all cities from all categories (deduplicated by ID)
  const allCities = Array.from(
    new Map(sections.flatMap((section) => section.data).map((city) => [city.id, city])).values(),
  );

  // Create categories list with "All" option
  const categoriesWithAll = [
    { categoryId: 'all', categoryName: t('common.all'), data: allCities },
    ...sections,
  ];

  const renderCategory = ({ item }: { item: any }) => (
    <Tab
      label={item.categoryName}
      isActive={activeCategory === item.categoryId}
      onPress={() => setActiveCategory(item.categoryId)}
    />
  );

  const renderCityCard = ({ item }: { item: City }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: '/city/[id]',
          params: { id: item.id, name: item.name },
        })
      }>
      <CachedImage imageKey={item.imagePath} style={styles.cardImage} />
      <LinearGradient
        colors={['rgba(0,0,0,0.75)', 'transparent']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardGradient}>
        <Text style={styles.cardTitle}>{item.name}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderTopDestination = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={styles.smallCard}
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: '/location/[id]',
          params: {
            id: item.id,
            name: item.name,
            imagePath: item.imagePath,
            address: item.address,
            cityName: item.cityName,
          },
        })
      }>
      <CachedImage imageKey={item.imagePath} style={styles.smallCardImage} />
      <View style={styles.smallCardInfo}>
        <Text style={styles.smallCardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.smallCardSubtitle} numberOfLines={1}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading && sections.length === 0 && locations.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + Layout.padding.md,
          backgroundColor: Colors.background,
        }}>
        <View style={styles.header}>
          <Skeleton width={200} height={70} borderRadius={20} />
        </View>

        <View style={styles.categoriesContainer}>
          <View style={[styles.categoriesList, { flexDirection: 'row' }]}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} width={80} height={36} borderRadius={20} />
            ))}
          </View>
        </View>

        <View style={styles.carouselContent}>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Skeleton width={CARD_WIDTH} height={400} borderRadius={Layout.borderRadius.cardLg} />
            <Skeleton width={CARD_WIDTH} height={400} borderRadius={Layout.borderRadius.cardLg} />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Skeleton width={180} height={28} borderRadius={20} />
        </View>

        <View style={styles.topDestinationsList}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                width={ITEM_WIDTH}
                height={60}
                borderRadius={Layout.borderRadius.cardSm}
              />
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Background />
      <View style={{ flex: 1, paddingTop: insets.top + Layout.padding.md }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 0 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }>
          {/* Header */}
          <View style={[styles.header]}>
            <Text style={styles.headerTitle}>
              {t('explore.hi')} {'\n'}
              {t('explore.subtitle')}
            </Text>
          </View>

          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <FlatList
              data={categoriesWithAll}
              renderItem={renderCategory}
              keyExtractor={(item) => item.categoryId}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          {/* Main Carousel */}
          <FlatList
            ref={flatListRef}
            data={
              categoriesWithAll.find((section) => section.categoryId === activeCategory)?.data || []
            }
            renderItem={renderCityCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + SPACING}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
          />

          {/* Top Destination */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrapper}>
              <Text style={styles.sectionTitle}>{t('explore.popular')}</Text>
              <View style={styles.titleUnderline}>
                <LinearGradient
                  colors={Colors.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFillObject]}
                />
              </View>
            </View>
          </View>

          <View>
            <FlatList
              data={locations}
              renderItem={renderTopDestination}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.topDestinationsList}
              scrollEnabled={false}
              columnWrapperStyle={{ gap: GRID_GAP }}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.padding.global,
    marginBottom: Layout.margin.xl,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.text,
  },
  categoriesContainer: {
    marginBottom: Layout.margin.md,
  },
  categoriesList: {
    paddingHorizontal: Layout.padding.global,
    gap: Layout.grid.gap.sm,
  },
  carouselContent: {
    paddingHorizontal: Layout.padding.global,
    gap: SPACING,
    marginBottom: Layout.margin.xl,
  },
  cardContainer: {
    marginTop: 2,
    width: CARD_WIDTH,
    height: 400,
    borderRadius: Layout.borderRadius.cardLg,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.extraLarge,
    backgroundColor: Colors.background,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: Layout.padding.lg,
  },
  cardTitle: {
    ...Typography.h2,
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.padding.global,
    marginBottom: Layout.margin.md,
  },
  sectionTitleWrapper: {
    position: 'relative',
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  titleUnderline: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  topDestinationsList: {
    flex: 1,
    gap: GRID_GAP,
    paddingHorizontal: Layout.padding.global,
    paddingBottom: NAVBAR_HEIGHT,
  },
  smallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.cardSm,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Layout.padding.sm,
    width: ITEM_WIDTH,
    gap: Layout.grid.gap.sm,
    ...Shadows.soft,
  },
  smallCardImage: {
    width: Layout.size.md,
    height: Layout.size.md,
    borderRadius: Layout.borderRadius.cardXs,
  },
  smallCardInfo: {
    flex: 1,
  },
  smallCardTitle: {
    ...Typography.caption,
    color: Colors.text,
    marginBottom: Layout.margin.text,
  },
  smallCardSubtitle: {
    ...Typography.caption2,
    color: Colors.secondaryText,
  },
});
