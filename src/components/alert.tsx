import { Colors, Shadows } from '@/src/constants/theme/theme';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Layout } from '../constants/theme/layout';
import { Typography } from '../constants/theme/typography';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: AlertButton[];
  onClose?: () => void;
  useModal?: boolean;
}

export default function Alert({
  visible,
  title,
  message,
  buttons = [],
  onClose,
  useModal = true,
}: AlertProps) {
  // If no buttons are provided, show a default "OK" button
  const alertButtons =
    buttons.length > 0
      ? buttons
      : [{ text: 'OK', onPress: onClose, style: 'default' } as AlertButton];

  const content = (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        {Platform.OS === 'ios' && (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        )}

        <TouchableWithoutFeedback>
          <View style={styles.alertContainer}>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>

            <View
              style={[
                styles.buttonContainer,
                { flexDirection: alertButtons.length > 2 ? 'column' : 'row' },
              ]}>
              {alertButtons.map((btn, index) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel = btn.style === 'cancel';

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      alertButtons.length > 2 ? styles.buttonVertical : styles.buttonHorizontal,
                      isCancel && styles.buttonCancel,
                      index > 0 && alertButtons.length <= 2 && styles.borderLeft,
                      index > 0 && alertButtons.length > 2 && styles.borderTop,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      btn.onPress?.();
                      if (!btn.onPress && onClose) onClose();
                    }}>
                    <Text
                      style={[
                        styles.buttonText,
                        isDestructive && styles.textDestructive,
                        isCancel && styles.textCancel,
                      ]}>
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );

  if (useModal) {
    return (
      <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
        {content}
      </Modal>
    );
  }

  if (!visible) return null;

  return <View style={[StyleSheet.absoluteFill, { zIndex: 9999 }]}>{content}</View>;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.modalBackground,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.padding.global,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.cardMd,
    overflow: 'hidden',
    ...Shadows.large,
  },
  contentContainer: {
    padding: Layout.padding.global,
    alignItems: 'center',
  },
  title: {
    ...Typography.h2_bold,
    color: Colors.text,
    marginBottom: Layout.margin.text,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.body3.fontSize,
    fontWeight: Typography.body3.fontWeight,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  button: {
    paddingVertical: Layout.padding.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonHorizontal: {
    flex: 1,
  },
  buttonVertical: {
    width: '100%',
  },
  buttonCancel: {
    backgroundColor: Colors.background,
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  buttonText: {
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
    color: Colors.text,
  },
  textDestructive: {
    color: Colors.error,
  },
  textCancel: {
    color: Colors.secondaryText,
  },
});
