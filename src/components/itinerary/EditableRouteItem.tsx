import { Layout } from '@/src/constants/theme/layout';
import { Colors, Shadows } from '@/src/constants/theme/theme';
import { Typography } from '@/src/constants/theme/typography';
import { Location } from '@/src/types/model';
import { formatTimeStr } from '@/src/utils/date';
import { ChevronDown, ChevronUp, Clock, MapPin, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CachedImage } from '../CachedImage';
import { TimePickerModal } from './TimePickerModal';
import { TimelineItem } from './TimelineItem';

interface EditableRouteItemProps {
  location: Location;
  time: string;
  isFirst: boolean;
  isLast: boolean;
  onRemove: () => void;
  onTimeChange: (newTime: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const EditableRouteItem = ({
  location,
  time,
  isFirst,
  isLast,
  onRemove,
  onTimeChange,
  onMoveUp,
  onMoveDown,
}: EditableRouteItemProps) => {
  const [showTimePicker, setShowTimePicker] = useState(false);

  return (
    <TimelineItem isFirst={isFirst} isLast={isLast} isActive={isFirst}>
      <View style={styles.routeItemContainer}>
        <TouchableOpacity style={styles.timeInput} onPress={() => setShowTimePicker(true)}>
          <Clock size={14} color={Colors.secondaryText} />
          <Text style={styles.timeText}>{formatTimeStr(time)}</Text>
        </TouchableOpacity>
        <View style={styles.routeItem}>
          <View style={styles.orderButtons}>
            <TouchableOpacity
              onPress={onMoveUp}
              disabled={isFirst}
              style={[styles.orderButton, isFirst && styles.disabledButton]}>
              <ChevronUp size={20} color={Colors.secondaryText} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onMoveDown}
              disabled={isLast}
              style={[styles.orderButton, isLast && styles.disabledButton]}>
              <ChevronDown size={20} color={Colors.secondaryText} />
            </TouchableOpacity>
          </View>

          <CachedImage imageKey={location.imagePath} style={styles.routeImage} />

          <View style={styles.routeInfo}>
            <Text style={styles.routeName} numberOfLines={1}>
              {location.name}
            </Text>
            <View style={styles.routeAddressRow}>
              <MapPin size={14} color={Colors.text} style={{ marginTop: 4 }} />
              <Text style={styles.routeSubText} numberOfLines={2}>
                {location.address}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
            <X size={20} color={Colors.secondaryText} />
          </TouchableOpacity>
        </View>
      </View>

      <TimePickerModal
        visible={showTimePicker}
        initialTime={time}
        onClose={() => setShowTimePicker(false)}
        onConfirm={(newTime) => {
          onTimeChange(newTime);
          setShowTimePicker(false);
        }}
      />
    </TimelineItem>
  );
};

const styles = StyleSheet.create({
  routeItemContainer: {
    flex: 1,
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Layout.borderRadius.cardXs,
    paddingHorizontal: Layout.padding.sm,
    paddingVertical: Layout.padding.xs,
    alignSelf: 'flex-start',
    marginBottom: Layout.margin.xs,
  },
  timeText: {
    ...Typography.body3,
    fontWeight: '700',
    color: Colors.text,
  },
  routeItem: {
    flex: 1,
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
  orderButtons: {
    marginRight: Layout.margin.sm,
    gap: Layout.grid.gap.xs,
    alignItems: 'center',
  },
  orderButton: {
    padding: 4,
  },
  disabledButton: {
    opacity: 0.3,
  },
  routeImage: {
    width: 70,
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
  routeSubText: {
    ...Typography.body3,
    color: Colors.text,
    flex: 1,
  },
  routeAddressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.margin.text,
  },
  removeButton: {
    padding: 8,
  },
});
