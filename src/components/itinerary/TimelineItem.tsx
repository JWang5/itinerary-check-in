import { Layout } from '@/src/constants/theme/layout';
import { Colors } from '@/src/constants/theme/theme';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface TimelineItemProps {
  isFirst?: boolean;
  isLast?: boolean;
  isActive?: boolean;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  dotStyle?: StyleProp<ViewStyle>;
}

export function TimelineItem({
  isFirst = false,
  isLast = false,
  isActive = false,
  children,
  containerStyle,
  contentStyle,
  dotStyle,
}: TimelineItemProps) {
  return (
    <View style={[styles.timelineRow, containerStyle]}>
      <View style={styles.timelineDecoration}>
        <View style={styles.timelineLineContainer}>
          {!isFirst && <View style={styles.timelineLineTop} />}
          {!isLast && <View style={styles.timelineLineBottom} />}
        </View>
        <View style={[styles.timelineDot, isActive && styles.timelineDotActive, dotStyle]} />
      </View>

      <View style={[styles.contentContainer, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  timelineRow: {
    flexDirection: 'row',
    gap: Layout.grid.gap.sm,
  },
  timelineDecoration: {
    width: 20,
    alignItems: 'center',
  },
  timelineLineContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    alignItems: 'center',
  },
  timelineLineTop: {
    flex: 1,
    width: 2,
    backgroundColor: '#F1F3F5',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timelineLineBottom: {
    flex: 1,
    width: 2,
    backgroundColor: '#F1F3F5',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#CBD5E0',
    marginTop: 64,
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#F8F9FA',
  },
  timelineDotActive: {
    backgroundColor: Colors.primary,
  },
  contentContainer: {
    flex: 1,
  },
});
