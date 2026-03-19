import { Layout } from '@/src/constants/theme/layout';
import { Colors } from '@/src/constants/theme/theme';
import { Typography } from '@/src/constants/theme/typography';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CalendarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  startDate: Date | null;
  endDate: Date | null;
  onSelect: (start: Date, end: Date) => void;
}

export const CalendarPickerModal = ({
  visible,
  onClose,
  startDate,
  endDate,
  onSelect,
}: CalendarPickerModalProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [localStart, setLocalStart] = useState<Date | null>(startDate);
  const [localEnd, setLocalEnd] = useState<Date | null>(endDate);
  const { t, i18n } = useTranslation();

  const getDayValue = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  // Sync local state with props when the modal opens
  useEffect(() => {
    if (visible) {
      setLocalStart(startDate);
      setLocalEnd(endDate);
      setCurrentMonth(startDate ?? new Date());
    }
  }, [visible, startDate, endDate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const handleDatePress = (date: Date) => {
    const pressedDay = getDayValue(date);
    const startDay = localStart ? getDayValue(localStart) : null;

    if (!localStart || (localStart && localEnd)) {
      setLocalStart(date);
      setLocalEnd(null);
    } else if (startDay !== null && pressedDay < startDay) {
      setLocalStart(date);
      setLocalEnd(null);
    } else if (startDay !== null && pressedDay > startDay) {
      setLocalEnd(date);
    }
  };

  const isSelected = (date: Date) => {
    const dayValue = getDayValue(date);

    if (localStart && dayValue === getDayValue(localStart)) return true;
    if (localEnd && dayValue === getDayValue(localEnd)) return true;
    return false;
  };

  const isInRange = (date: Date) => {
    const dayValue = getDayValue(date);

    if (localStart && localEnd) {
      const startDay = getDayValue(localStart);
      const endDay = getDayValue(localEnd);
      return dayValue > startDay && dayValue < endDay;
    }

    return false;
  };

  const isPast = (date: Date) => {
    return date < today;
  };

  const monthName = currentMonth.toLocaleString(i18n.language, { month: 'long', year: 'numeric' });

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.calendarOverlay}>
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              onPress={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
                )
              }>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.calendarMonthText}>{monthName}</Text>
            <TouchableOpacity
              onPress={() =>
                setCurrentMonth(
                  new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
                )
              }>
              <ChevronRight size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdaysRow}>
            {[
              'common.sun',
              'common.mon',
              'common.tue',
              'common.wed',
              'common.thu',
              'common.fri',
              'common.sat',
            ].map((d) => (
              <Text key={d} style={styles.weekdayText}>
                {t(d)}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {days.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  date && isSelected(date) && styles.dayCellSelected,
                  date && isInRange(date) && styles.dayCellInRange,
                ]}
                disabled={!date || isPast(date)}
                onPress={() => date && handleDatePress(date)}>
                {date && (
                  <Text
                    style={[
                      styles.dayText,
                      isSelected(date) && styles.dayTextSelected,
                      isInRange(date) && styles.dayTextInRange,
                      isPast(date) && styles.dayTextDisabled,
                    ]}>
                    {date.getDate()}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.calendarActions}>
            <TouchableOpacity style={styles.calendarCancelButton} onPress={onClose}>
              <Text style={styles.calendarCancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.calendarApplyButton, !localStart && { opacity: 0.6 }]}
              disabled={!localStart}
              onPress={() => localStart && onSelect(localStart, localEnd ?? localStart)}>
              <Text style={styles.calendarApplyText}>{t('common.apply')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  calendarOverlay: {
    flex: 1,
    backgroundColor: Colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.padding.global,
  },
  calendarContainer: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.cardLg,
    padding: Layout.padding.global,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.margin.lg,
  },
  calendarMonthText: {
    ...Typography.h3,
    color: Colors.text,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.margin.md,
  },
  weekdayText: {
    width: '14.28%',
    textAlign: 'center',
    ...Typography.caption2,
    fontWeight: 'bold',
    color: Colors.secondaryText,
    textTransform: 'uppercase',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Layout.borderRadius.cardSm,
  },
  dayCellSelected: {
    backgroundColor: Colors.text,
  },
  dayCellInRange: {
    backgroundColor: Colors.cardBackgroundTranslucent,
    borderRadius: 8,
  },
  dayText: {
    ...Typography.body2,
    fontWeight: '700',
    color: Colors.text,
  },
  dayTextSelected: {
    color: Colors.inverseText,
  },
  dayTextInRange: {
    color: Colors.text,
  },
  dayTextDisabled: {
    color: Colors.disabledText,
  },
  calendarActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Layout.grid.gap.md,
    marginTop: Layout.margin.md,
  },
  calendarCancelButton: {
    paddingHorizontal: Layout.padding.md,
    paddingVertical: Layout.padding.sm,
  },
  calendarCancelText: {
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
    color: Colors.secondaryText,
  },
  calendarApplyButton: {
    backgroundColor: Colors.text,
    paddingHorizontal: Layout.padding.md,
    paddingVertical: Layout.padding.sm,
    borderRadius: Layout.borderRadius.cardSm,
  },
  calendarApplyText: {
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
    color: Colors.inverseText,
  },
});
