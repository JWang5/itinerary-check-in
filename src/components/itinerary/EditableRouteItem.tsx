import { Layout } from '@/src/constants/theme/layout';
import { Colors, Shadows } from '@/src/constants/theme/theme';
import { Typography } from '@/src/constants/theme/typography';
import { PlannedItem } from '@/src/types/model';
import { formatTimeStr } from '@/src/utils/date';
import { ChevronDown, ChevronUp, Clock, MapPin, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CachedImage } from '../CachedImage';
import { TimePickerModal } from './TimePickerModal';
import { TimelineItem } from './TimelineItem';

interface EditableRouteItemProps {
  item: PlannedItem;
  time: string;
  isFirst: boolean;
  isLast: boolean;
  onRemove: () => void;
  onTimeChange: (newTime: string) => void;
  onCustomNameChange?: (value: string) => void;
  onCustomAddressChange?: (value: string) => void;
  onCustomFieldFocus?: (input: TextInput | null) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export const EditableRouteItem = ({
  item,
  time,
  isFirst,
  isLast,
  onRemove,
  onTimeChange,
  onCustomNameChange,
  onCustomAddressChange,
  onCustomFieldFocus,
  onMoveUp,
  onMoveDown,
}: EditableRouteItemProps) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const customNameInputRef = useRef<TextInput | null>(null);
  const customAddressInputRef = useRef<TextInput | null>(null);
  const { t } = useTranslation();
  const isCustomItem = item.itemType === 'custom';
  const location = item.location;

  return (
    <TimelineItem isFirst={isFirst} isLast={isLast} isActive={false}>
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

          {isCustomItem ? (
            <View style={styles.customCard}>
              <TextInput
                ref={customNameInputRef}
                value={item.customName ?? ''}
                onChangeText={onCustomNameChange}
                onFocus={() => onCustomFieldFocus?.(customNameInputRef.current)}
                placeholder={t('itinerary.create.customNamePlaceholder')}
                placeholderTextColor={Colors.secondaryText}
                style={styles.customNameInput}
              />
              <View style={styles.customAddressRow}>
                <MapPin size={14} color={Colors.text} style={{ marginTop: 4 }} />
                <TextInput
                  ref={customAddressInputRef}
                  value={item.customAddress ?? ''}
                  onChangeText={onCustomAddressChange}
                  onFocus={() => onCustomFieldFocus?.(customAddressInputRef.current)}
                  placeholder={t('itinerary.create.customAddressPlaceholder')}
                  placeholderTextColor={Colors.secondaryText}
                  style={styles.customAddressInput}
                  multiline
                />
              </View>
            </View>
          ) : (
            <>
              {location && <CachedImage imageKey={location.imagePath} style={styles.routeImage} />}

              <View style={styles.routeInfo}>
                <Text style={styles.routeName} numberOfLines={1}>
                  {location?.name}
                </Text>
                <View style={styles.routeAddressRow}>
                  <MapPin size={14} color={Colors.text} style={{ marginTop: 4 }} />
                  <Text style={styles.routeSubText} numberOfLines={2}>
                    {location?.address}
                  </Text>
                </View>
              </View>
            </>
          )}

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
  customCard: {
    flex: 1,
    justifyContent: 'center',
    gap: Layout.grid.gap.xs,
  },
  customNameInput: {
    ...Typography.caption,
    color: Colors.text,
    paddingVertical: 0,
  },
  customAddressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.margin.text,
  },
  customAddressInput: {
    ...Typography.body3,
    color: Colors.text,
    flex: 1,
    paddingVertical: 0,
    textAlignVertical: 'top',
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
