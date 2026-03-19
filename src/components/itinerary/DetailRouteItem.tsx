import { Layout } from '@/src/constants/theme/layout';
import { Colors, Shadows } from '@/src/constants/theme/theme';
import { Typography } from '@/src/constants/theme/typography';
import { ItineraryItem } from '@/src/types/model';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CachedImage } from '../CachedImage';
import { TimelineItem } from './TimelineItem';

interface DetailRouteItemProps {
  item: ItineraryItem;
  time: string;
  isFirst: boolean;
  isLast: boolean;
  isActive?: boolean;
}

export const DetailRouteItem = ({ item, time, isFirst, isLast, isActive = false }: DetailRouteItemProps) => {
  const router = useRouter();
  const isCustomItem = item.itemType === 'custom';
  const location = item.location;

  return (
    <TimelineItem isFirst={isFirst} isLast={isLast} isActive={isActive}>
      <View style={styles.routeItemContainer}>
        <Text style={styles.itemTime}>{time}</Text>
        {isCustomItem ? (
          <View style={styles.routeItem}>
            <View style={styles.routeInfo}>
              <Text style={styles.routeName} numberOfLines={1}>
                {item.customName ?? ''}
              </Text>
              <View style={styles.routeAddressRow}>
                <MapPin size={14} color={Colors.text} style={{ marginTop: 4 }} />
                <Text style={styles.routeAddress} numberOfLines={2}>
                  {item.customAddress ?? ''}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.routeItem}
            onPress={() => {
              if (location?.id) {
                router.push(`/location/${location.id}`);
              }
            }}>
            <CachedImage imageKey={location?.imagePath} style={styles.routeImage} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeName} numberOfLines={1}>
                {location?.name}
              </Text>
              <View style={styles.routeAddressRow}>
                <MapPin size={14} color={Colors.text} style={{ marginTop: 4 }} />
                <Text style={styles.routeAddress} numberOfLines={2}>
                  {location?.address}
                </Text>
              </View>
              <Text style={styles.routeDescription} numberOfLines={2}>
                {location?.description}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </TimelineItem>
  );
};

const styles = StyleSheet.create({
  routeItemContainer: {
    flex: 1,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.cardMd,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Layout.padding.sm,
    ...Shadows.soft,
    marginBottom: Layout.margin.md,
  },
  itemTime: {
    ...Typography.body3,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Layout.margin.xs,
    paddingHorizontal: 4,
  },
  routeImage: {
    width: 90,
    height: '100%',
    borderRadius: Layout.borderRadius.cardSm,
  },
  routeInfo: {
    flex: 1,
    marginLeft: Layout.margin.sm,
    gap: Layout.grid.gap.xs,
  },
  routeName: {
    ...Typography.caption,
    color: Colors.text,
  },
  routeAddressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.margin.text,
  },
  routeAddress: {
    ...Typography.body3,
    color: Colors.text,
    flex: 1,
  },
  routeDescription: {
    ...Typography.body4,
    color: Colors.secondaryText,
    marginLeft: 16,
  },
});
