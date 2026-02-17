import CustomAlert from '@/src/components/alert';
import { Layout } from '@/src/constants/theme/layout';
import { Colors } from '@/src/constants/theme/theme';
import { Typography } from '@/src/constants/theme/typography';
import { StickyService } from '@/src/services/stickyService';
import { useUserStickyStore } from '@/src/store/useUserStickyStore';
import { Sticky } from '@/src/types/model';
import { Image as ImageIcon, Send, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { IconButton } from '../iconButton';

interface AddMessageModalProps {
  isVisible: boolean;
  onClose: () => void;
  locationId: string;
  userId: string;
  onPostSuccess: (newSticky: Sticky) => void;
}

export const AddMessageModal: React.FC<AddMessageModalProps> = ({
  isVisible,
  onClose,
  locationId,
  userId,
  onPostSuccess,
}) => {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const { addUserSticky } = useUserStickyStore();
  const [newMessage, setNewMessage] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const slideAnim = useSharedValue(height);

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

  useEffect(() => {
    if (isVisible) {
      slideAnim.value = withSpring(0, {
        damping: 20,
        stiffness: 120,
        mass: 1,
      });
    } else {
      slideAnim.value = height;
    }
  }, [isVisible, height, slideAnim]);

  const animatedContentStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: slideAnim.value }],
    };
  });

  const handlePostMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    try {
      setIsPosting(true);

      // Check limit
      const canAdd = await StickyService.canUserAddSticky(userId, locationId);
      if (!canAdd) {
        showAlert(t('common.error'), t('stickyNotes.limitReached'));
        return;
      }
      const newSticky = await addUserSticky({
        userId,
        locationId,
        text: newMessage,
        color: '#FFECB3',
      });

      onPostSuccess(newSticky);
      setNewMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to post note', error);
      showAlert(t('common.error'), t('location.failedToPostNote'));
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.modalBackground }]} />
        </TouchableOpacity>
        <Animated.View style={[styles.modalContent, animatedContentStyle]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('stickyNotes.leaveNote')}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder={t('stickyNotes.shareExperience')}
            multiline
            numberOfLines={4}
            value={newMessage}
            onChangeText={setNewMessage}
            autoFocus
          />

          <View style={styles.mediaOptions}>
            <TouchableOpacity
              style={styles.mediaOption}
              onPress={() =>
                showAlert(t('stickyNotes.comingSoon'), t('stickyNotes.comingSoonContent'))
              }>
              <ImageIcon size={Typography.button.fontSize} color={Colors.text} />
              <Text style={styles.mediaOptionText}>{t('stickyNotes.addPhoto')}</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.mediaOption}
              onPress={() =>
                showAlert(t('stickyNotes.comingSoon'), t('stickyNotes.comingSoonContent'))
              }>
              <PenTool size={Typography.button.fontSize} color={Colors.text} />
              <Text style={styles.mediaOptionText}>{t('stickyNotes.sketch')}</Text>
            </TouchableOpacity> */}
          </View>
          <IconButton
            icon={<Send />}
            onPress={handlePostMessage}
            size="large"
            disabled={isPosting}
            text={isPosting ? t('stickyNotes.posting') : t('stickyNotes.postToWall')}
            textColor={Colors.inverseText}
            style={{ opacity: isPosting ? 0.7 : 1, backgroundColor: Colors.text }}
          />
        </Animated.View>
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={() => setAlertVisible(false)}
          useModal={false}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Layout.borderRadius.cardLg,
    borderTopRightRadius: Layout.borderRadius.cardLg,
    padding: Layout.padding.global,
    flexDirection: 'column',
    gap: Layout.grid.gap.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: Layout.borderRadius.cardXs,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Layout.padding.sm,
    ...Typography.body2,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  mediaOptions: {
    flexDirection: 'row',
    gap: Layout.grid.gap.sm,
  },
  mediaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    paddingVertical: Layout.padding.sm,
    paddingHorizontal: Layout.padding.md,
    borderRadius: Layout.borderRadius.cardXs,
    gap: Layout.grid.gap.sm,
  },
  mediaOptionText: {
    fontSize: Typography.button.fontSize,
    color: Colors.text,
    fontWeight: Typography.button.fontWeight,
  },
});
