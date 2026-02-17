import CustomAlert from '@/src/components/alert';
import { Background } from '@/src/components/Background';
import { Layout } from '@/src/constants/theme/layout';
import { Colors } from '@/src/constants/theme/theme';
import { Typography } from '@/src/constants/theme/typography';
import { useAuth } from '@/src/provider/authProvider';
import { supabase } from '@/src/utils/supabase';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation();
  const { session, initialized } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: [] as any[],
  });
  const [alertVisible, setAlertVisible] = useState(false);

  // Ref to prevent double-triggering logic across remounts
  const hasHandledFailure = useRef(false);

  const showAlert = React.useCallback(
    (title: string, message: string, buttons?: any[]) => {
      setAlertConfig({
        title,
        message,
        buttons: buttons || [{ text: t('common.confirm'), onPress: () => setAlertVisible(false) }],
      });
      setAlertVisible(true);
    },
    [t],
  );

  const handleFailure = React.useCallback(
    async (msg?: string) => {
      if (hasHandledFailure.current) return;
      hasHandledFailure.current = true;

      console.warn('[ResetPassword] Handling reset failure:', msg || 'Timeout');

      // Clear any partial state
      await supabase.auth.signOut().catch(() => {});

      showAlert(t('common.error'), t('auth.invalidResetLink'), [
        { text: t('common.confirm'), onPress: () => router.replace('/') },
      ]);
    },
    [router, t, showAlert],
  );

  useEffect(() => {
    const checkUrlForErrors = async () => {
      const url = await Linking.getInitialURL();
      if (url && (url.includes('error=access_denied') || url.includes('error='))) {
        handleFailure();
      }
    };

    // 1. Immediate check for params forwarded by AuthLinking
    if (params.error || params.error_description) {
      handleFailure();
      return;
    }

    // 2. Check the raw URL for hidden hash-based errors
    checkUrlForErrors();

    // 3. Setup timeout if we are still waiting
    if (initialized && !session && !hasHandledFailure.current) {
      const timer = setTimeout(() => {
        if (!session && !hasHandledFailure.current) {
          handleFailure();
        }
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, [session, initialized, params, handleFailure]);

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      showAlert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      showAlert(t('common.error'), t('auth.passwordRule'));
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      showAlert(t('common.success'), t('auth.passwordUpdated'), [
        {
          text: t('common.confirm'),
          onPress: () => {
            supabase.auth.signOut().then(() => router.replace('/'));
          },
        },
      ]);
    } catch (error: any) {
      if (error.message?.includes('expired') || error.message?.includes('invalid')) {
        handleFailure();
      } else if (error.message?.toLowerCase().includes('old password')) {
        showAlert(t('common.error'), t('auth.passwordSameAsOld'));
      } else {
        showAlert(t('common.error'), error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!initialized || (!session && !hasHandledFailure.current)) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.text} />
        <Text style={[styles.label, { marginTop: 20 }]}>{t('auth.verifyingSession')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Background />
      <View style={styles.content}>
        <Text style={styles.title}>{t('auth.resetPassword')}</Text>
        <View style={styles.form}>
          <Text style={styles.label}>{t('auth.newPassword')}</Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholderTextColor={Colors.secondaryText}
            placeholder={t('auth.newPassword')}
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleUpdatePassword}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? t('common.loading') : t('auth.updatePassword')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              router.replace('/');
              supabase.auth.signOut().catch(() => {});
            }}
            disabled={loading}>
            <Text style={[styles.buttonText, styles.cancelButtonText]}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, justifyContent: 'center', padding: Layout.padding.xl },
  title: {
    ...Typography.h1,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.margin.xl,
  },
  form: { gap: Layout.padding.md },
  label: {
    ...Typography.caption,
    color: Colors.text,
    marginBottom: Layout.padding.xs,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    padding: Layout.padding.md,
    borderRadius: Layout.borderRadius.cardSm,
    ...Typography.body2,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.text,
    padding: Layout.padding.md,
    borderRadius: Layout.borderRadius.buttonRounded,
    alignItems: 'center',
    marginTop: Layout.padding.md,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { ...Typography.button, color: Colors.inverseText },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Layout.padding.sm,
  },
  cancelButtonText: { color: Colors.text },
});
