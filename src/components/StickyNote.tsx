import CustomAlert from '@/src/components/alert';
import { Colors, Shadows } from '@/src/constants/theme/theme';
import { Sticky } from '@/src/types/model';
import { useRouter } from 'expo-router';
import { MapPin, Trash2, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Layout } from '../constants/theme/layout';
import { Typography } from '../constants/theme/typography';
import { useUserStickyStore } from '../store/useUserStickyStore';

interface StickyNoteProps {
  sticky: Sticky;
  index?: number;
  onPress?: (sticky: Sticky) => void;
  onClose?: () => void;
  onDelete?: (sticky: Sticky) => void;
  variant?: 'grid' | 'detail';
  isMe?: boolean;
  showHeader?: boolean;
}

const STICKY_TEXT_COLOR = '#48484869';
const STICKY_COLORS = ['#FFECB3'];

export const StickyNote: React.FC<StickyNoteProps> = ({
  sticky,
  index = 0,
  onPress,
  onClose,
  onDelete,
  variant = 'grid',
  isMe = false,
  showHeader = false,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  const { deleteUserSticky } = useUserStickyStore();

  // Custom Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: [] as any[],
  });

  const showAlert = (title: string, message: string, buttons?: any[]) => {
    setAlertConfig({
      title,
      message,
      buttons: buttons || [{ text: t('common.confirm'), onPress: () => setAlertVisible(false) }],
    });
    setAlertVisible(true);
  };

  const handleDelete = () => {
    showAlert(t('common.confirm'), t('location.confirmDeleteNote'), [
      { text: t('common.cancel'), style: 'cancel', onPress: () => setAlertVisible(false) },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          setAlertVisible(false);
          try {
            await deleteUserSticky(sticky.id);
            onDelete?.(sticky);
          } catch (error) {
            console.error('Failed to delete note', error);
            showAlert(t('common.error'), t('location.failedToDeleteNote'));
          }
        },
      },
    ]);
  };

  const getRandomRotation = (idx: number) => {
    const rotations = [-3, -2, -1, 1, 2, 3];
    return rotations[idx % rotations.length];
  };

  const rotation = variant === 'grid' ? `${getRandomRotation(index)}deg` : '0deg';

  const containerStyle = [
    variant === 'grid' ? styles.gridContainer : styles.detailContainer,
    {
      backgroundColor: sticky.color || STICKY_COLORS[0],
      transform: [{ rotate: rotation }],
    },
  ];

  const content = (
    <>
      <View style={variant === 'grid' ? styles.tape : styles.tapeLarge} />
      {showHeader && (
        <TouchableOpacity
          disabled={!onClose}
          onPress={() => {
            if (onClose) {
              onClose();
              router.push(`/location/${sticky.locationId}`);
            }
          }}
          style={[variant === 'grid' ? styles.stickyHeader : styles.stickyHeaderLarge]}>
          <MapPin
            style={{ marginTop: 4 }}
            size={variant === 'grid' ? 12 : 16}
            color={STICKY_TEXT_COLOR}
          />
          <Text style={variant === 'grid' ? styles.headerText : styles.stickyHeaderLargeText}>
            {sticky.locationName} • {sticky.cityName}
          </Text>
        </TouchableOpacity>
      )}
      {variant === 'grid' ? (
        <View style={styles.stickyContent}>
          <Text style={styles.stickyQuote} numberOfLines={showHeader ? 6 : 7}>
            {sticky.text}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={[styles.stickyContent, !showHeader ? { marginTop: 32 } : {}]}>
          <Text style={styles.stickyQuoteLarge}>{sticky.text}</Text>
        </ScrollView>
      )}
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View>
          {isMe && onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              style={variant === 'grid' ? {} : styles.deleteButtonDetail}>
              <Trash2 size={variant === 'grid' ? 16 : 20} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>

        <Text style={variant === 'grid' ? styles.stickyAuthor : styles.stickyAuthorLarge}>
          - {isMe ? 'ME' : sticky.displayName || 'TRAVELER'}
        </Text>
      </View>
      {variant === 'detail' && onClose && (
        <TouchableOpacity style={styles.closeDetailButton} onPress={onClose}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
      )}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
    </>
  );

  if (variant === 'grid' && onPress) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(sticky)} style={containerStyle}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => {}}>
      <View style={containerStyle}>{content}</View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    paddingHorizontal: Layout.padding.sm,
    paddingVertical: Layout.padding.xs,
    width: '48%',
    height: 180,
    ...Shadows.medium,
    position: 'relative',
    justifyContent: 'space-between',
  },
  detailContainer: {
    width: '100%',
    height: 400,
    paddingHorizontal: Layout.padding.global,
    paddingVertical: Layout.padding.md,
    ...Shadows.large,
    position: 'relative',
  },
  stickyContent: {
    flex: 1,
  },
  tape: {
    position: 'absolute',
    top: -10,
    left: '45%',
    width: 50,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    zIndex: 1,
  },
  tapeLarge: {
    position: 'absolute',
    top: -12,
    left: '45%',
    width: 80,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    zIndex: 1,
  },
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  stickyHeaderLarge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginBottom: Layout.padding.sm,
  },
  headerText: {
    flex: 1,
    flexWrap: 'wrap',
    fontSize: Typography.body4.fontSize,
    fontWeight: Typography.body4.fontWeight,
    color: STICKY_TEXT_COLOR,
  },
  stickyHeaderLargeText: {
    flex: 1,
    flexWrap: 'wrap',
    ...Typography.body2,
    color: STICKY_TEXT_COLOR,
    marginRight: 36,
  },
  stickyQuote: {
    ...Typography.body2,
    color: Colors.text,
  },
  stickyQuoteLarge: {
    ...Typography.body,
    color: Colors.text,
  },
  stickyAuthor: {
    ...Typography.body4,
    color: STICKY_TEXT_COLOR,
    textAlign: 'right',
  },
  stickyAuthorLarge: {
    ...Typography.body2,
    color: STICKY_TEXT_COLOR,
    textAlign: 'right',
  },
  closeDetailButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonGrid: {
    zIndex: 2,
  },
  deleteButtonDetail: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    backgroundColor: '#fc655453',
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 4,
  },
});
