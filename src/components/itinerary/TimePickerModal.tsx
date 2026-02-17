import { Layout } from '@/src/constants/theme/layout';
import { Colors } from '@/src/constants/theme/theme';
import { Typography } from '@/src/constants/theme/typography';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TimePickerModalProps {
  visible: boolean;
  initialTime?: string;
  onClose: () => void;
  onConfirm: (time: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const ITEM_HEIGHT = 36; // paddingVertical (8*2) + text line height (~20)
const SCROLL_HEIGHT = 180;

// Parse time string to components (supports both 24h "HH:MM" and 12h "HH:MM AM/PM")
const parseTime = (timeStr: string) => {
  // Try 24-hour format first
  const match24 = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return {
      hour: match24[1].padStart(2, '0'),
      minute: match24[2].padStart(2, '0'),
    };
  }

  // Try 12-hour format
  const match12 = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match12) {
    let hour = parseInt(match12[1]);
    const period = match12[3].toUpperCase();
    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return {
      hour: hour.toString().padStart(2, '0'),
      minute: match12[2].padStart(2, '0'),
    };
  }

  return { hour: '09', minute: '00' };
};

export const TimePickerModal = ({
  visible,
  initialTime = '09:00',
  onClose,
  onConfirm,
}: TimePickerModalProps) => {
  const { t } = useTranslation();

  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  // Reset state and scroll to selected position when modal opens
  useEffect(() => {
    if (visible) {
      const parsed = parseTime(initialTime);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);

      // Scroll to the selected values after a short delay for layout
      const timer = setTimeout(() => {
        const hourIndex = HOURS.indexOf(parsed.hour);
        const minuteIndex = MINUTES.indexOf(parsed.minute);
        // Center the selected item in the scroll view
        const hourOffset = Math.max(
          0,
          hourIndex * ITEM_HEIGHT - SCROLL_HEIGHT / 2 + ITEM_HEIGHT / 2,
        );
        const minuteOffset = Math.max(
          0,
          minuteIndex * ITEM_HEIGHT - SCROLL_HEIGHT / 2 + ITEM_HEIGHT / 2,
        );
        hourScrollRef.current?.scrollTo({ y: hourOffset, animated: false });
        minuteScrollRef.current?.scrollTo({ y: minuteOffset, animated: false });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visible, initialTime]);

  const handleConfirm = () => {
    const timeStr = `${selectedHour}:${selectedMinute}`;
    onConfirm(timeStr);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>{t('itinerary.create.selectTime')}</Text>

          <View style={styles.pickerRow}>
            {/* Hour Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>{t('common.hour')}</Text>
              <ScrollView
                ref={hourScrollRef}
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}>
                {HOURS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.pickerItem, selectedHour === h && styles.pickerItemSelected]}
                    onPress={() => setSelectedHour(h)}>
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedHour === h && styles.pickerItemTextSelected,
                      ]}>
                      {h}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Minute Picker */}
            <View style={styles.pickerColumn}>
              <Text style={styles.pickerLabel}>{t('common.minute')}</Text>
              <ScrollView
                ref={minuteScrollRef}
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}>
                {MINUTES.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.pickerItem, selectedMinute === m && styles.pickerItemSelected]}
                    onPress={() => setSelectedMinute(m)}>
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedMinute === m && styles.pickerItemTextSelected,
                      ]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>{t('common.confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.padding.global,
  },
  container: {
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.cardMd,
    padding: Layout.padding.lg,
    width: '100%',
    maxWidth: 280,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.margin.lg,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Layout.grid.gap.xl,
    marginBottom: Layout.margin.lg,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerLabel: {
    ...Typography.caption2,
    color: Colors.secondaryText,
    marginBottom: Layout.margin.xs,
    textTransform: 'uppercase',
  },
  pickerScroll: {
    height: 180,
  },
  pickerItem: {
    paddingVertical: Layout.padding.xs,
    paddingHorizontal: Layout.padding.lg,
    borderRadius: Layout.borderRadius.cardXs,
  },
  pickerItemSelected: {
    backgroundColor: Colors.text,
  },
  pickerItemText: {
    ...Typography.body2,
    color: Colors.text,
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    color: Colors.inverseText,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Layout.grid.gap.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Layout.padding.sm,
    borderRadius: Layout.borderRadius.cardSm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...Typography.button,
    color: Colors.text,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: Layout.padding.sm,
    borderRadius: Layout.borderRadius.cardSm,
    backgroundColor: Colors.text,
    alignItems: 'center',
  },
  confirmButtonText: {
    ...Typography.button,
    color: Colors.inverseText,
  },
});
