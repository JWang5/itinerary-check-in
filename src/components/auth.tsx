import Alert from '@/src/components/alert';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Layout } from '../constants/theme/layout';
import { Colors } from '../constants/theme/theme';
import { Typography } from '../constants/theme/typography';
import { useAuth } from '../provider/authProvider';

type AuthMode = 'login' | 'signup' | 'reset';

interface AuthProps {
  onClose?: () => void;
}

export default function AuthDialog({ onClose }: AuthProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();

  const [isVerificationSent, setIsVerificationSent] = useState(false);

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

  async function handleLogin() {
    if (!email || !password) {
      showAlert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)/explore');
    } catch (error: any) {
      const errorMessage = error.message;
      switch (errorMessage) {
        case 'email not confirmed':
          showAlert(t('common.error'), t('auth.emailNotConfirmed'));
          break;
        case 'Invalid login credentials':
          showAlert(t('common.error'), t('auth.invalidCredentials'));
          break;
        default:
          showAlert(t('common.error'), errorMessage);
          break;
      }
    } finally {
      setLoading(false);
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      showAlert(t('common.error'), t('auth.fillEmail'));
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      showAlert(t('common.send'), t('auth.resetPasswordSent', { email }), [
        {
          text: t('common.confirm'),
          onPress: () => {
            setAlertVisible(false);
            setAuthMode('login');
          },
        },
      ]);
    } catch (error: any) {
      if (error.message.includes('seconds')) {
        let seconds = error.message.split('after')[1];
        seconds = seconds.split('seconds')[0];
        showAlert(t('common.error'), t('auth.rateLimit', { seconds }));
      } else {
        showAlert(t('common.error'), error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || (authMode === 'signup' && (!userName || !confirmPassword))) {
      showAlert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    if (authMode === 'signup' && password !== confirmPassword) {
      showAlert(t('common.error'), t('auth.passwordsDoNotMatch'));
      return;
    }

    // Password rule: at least 8 characters, must contain uppercase, lowercase, numbers
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (authMode === 'signup' && !passwordRegex.test(password)) {
      showAlert(t('common.error'), t('auth.passwordRule'));
      return;
    }

    setLoading(true);
    try {
      const { session, user } = await signUp(email, password, {
        data: {
          full_name: userName,
        },
      });

      if (user?.identities?.length === 0) {
        showAlert(t('common.error'), t('auth.userAlreadyExists'));
        return;
      }

      if (!session) {
        setIsVerificationSent(true);
      } else {
        showAlert(t('common.success'), t('auth.signUpSuccess'), [
          {
            text: t('common.confirm'),
            onPress: () => {
              setAlertVisible(false);
              router.replace('/(tabs)/explore');
            },
          },
        ]);
      }
    } catch (error: any) {
      const errorMessage =
        error.message === 'User already registered' ? t('auth.userAlreadyExists') : error.message;
      showAlert(t('common.error'), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (authMode === 'login') {
      handleLogin();
    } else if (authMode === 'signup') {
      handleSignUp();
    } else if (authMode === 'reset') {
      handleResetPassword();
    }
  };

  if (isVerificationSent) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.loginHeader}>
            <Text style={styles.loginTitle}>{t('auth.checkInbox')}</Text>
            <Text style={styles.loginSubtitle}>{t('auth.verificationSent', { email })}</Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setIsVerificationSent(false);
              setAuthMode('login');
            }}>
            <Text style={styles.actionButtonText}>{t('auth.backToLogin')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Alert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={() => setAlertVisible(false)}
      />

      {/* Background Blur for the card itself if needed, 
          but parent container in index.tsx handles the main blur. 
          We'll add a subtle one here for the card depth. */}
      {Platform.OS === 'ios' && (
        <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
      )}

      <View style={styles.content}>
        <View style={styles.loginHeader}>
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X color="rgba(255,255,255,0.6)" size={24} />
            </TouchableOpacity>
          )}
          <Text style={styles.loginTitle}>
            {authMode === 'login'
              ? t('auth.welcomeBack')
              : authMode === 'reset'
                ? t('auth.resetPassword')
                : t('auth.createAccount')}
          </Text>
          <Text style={styles.loginSubtitle}>
            {authMode === 'login'
              ? t('auth.startJourney')
              : authMode === 'reset'
                ? t('auth.enterEmailToReset')
                : t('auth.joinUs')}
          </Text>
        </View>

        <View style={styles.form}>
          {authMode === 'reset' ? (
            // Reset Password Form
            <>
              <View style={styles.inputContainer}>
                <Mail color="rgba(255,255,255,0.6)" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.email')}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <TouchableOpacity
                style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={Colors.text} />
                ) : (
                  <>
                    <Text style={styles.actionButtonText}>{t('auth.sendResetLink')}</Text>
                    <ArrowRight size={20} color={Colors.text} style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setAuthMode('login')}
                disabled={loading}>
                <Text style={styles.switchModeLink}>{t('auth.backToLogin')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Regular Login/Signup Form
            <>
              {authMode === 'signup' && (
                <View style={styles.inputContainer}>
                  <User color="rgba(255,255,255,0.6)" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.username')}
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={userName}
                    onChangeText={setUserName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Mail color="rgba(255,255,255,0.6)" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.email')}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock color="rgba(255,255,255,0.6)" size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.password')}
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff color="rgba(255,255,255,0.6)" size={20} />
                  ) : (
                    <Eye color="rgba(255,255,255,0.6)" size={20} />
                  )}
                </TouchableOpacity>
              </View>
              {authMode === 'login' && (
                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => setAuthMode('reset')}>
                  <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
                </TouchableOpacity>
              )}
              {authMode === 'signup' && (
                <View style={styles.inputContainer}>
                  <Lock color="rgba(255,255,255,0.6)" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('auth.confirmPassword') || 'Confirm Password'}
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>
              )}
              {authMode === 'signup' && (
                <Text style={styles.ruleHint}>{t('auth.passwordRule')}</Text>
              )}

              <TouchableOpacity
                style={[styles.actionButton, loading && styles.actionButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator color={Colors.text} />
                ) : (
                  <>
                    <Text style={styles.actionButtonText}>
                      {authMode === 'login' ? t('auth.login') : t('auth.signup')}
                    </Text>
                    <ArrowRight size={20} color={Colors.text} style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {authMode !== 'reset' && (
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {authMode === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                }}>
                <Text style={styles.switchModeLink}>
                  {authMode === 'login' ? t('auth.signup') : t('auth.login')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#1a1a1a83', // Glassmorphism background
    borderRadius: Layout.borderRadius.cardLg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ffffff16',
  },
  content: {
    padding: Layout.padding.global,
  },
  loginHeader: {
    marginBottom: Layout.margin.lg,
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  loginTitle: {
    ...Typography.h1,
    color: Colors.inverseText,
    marginBottom: Layout.margin.text,
    textAlign: 'center',
  },
  loginSubtitle: {
    ...Typography.body2,
    color: '#ffffff6c',
    textAlign: 'center',
  },
  form: {
    gap: Layout.grid.gap.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a76',
    borderRadius: Layout.borderRadius.cardSm,
    paddingHorizontal: Layout.padding.md,
    paddingVertical: Layout.padding.xs,
    borderWidth: 1,
    borderColor: '#ffffff16',
  },
  inputIcon: {
    marginRight: Layout.margin.text,
  },
  input: {
    flex: 1,
    color: Colors.inverseText,
    fontSize: Typography.body3.fontSize,
    lineHeight: 20,
  },
  ruleHint: {
    fontSize: 10,
    color: '#ffffff3d',
    paddingHorizontal: 4,
    marginTop: -4,
  },
  actionButton: {
    marginVertical: Layout.margin.md,
    backgroundColor: '#ffffffff',
    borderRadius: Layout.borderRadius.buttonRounded,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.padding.sm,
    paddingHorizontal: Layout.padding.md,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: Colors.text,
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
  },
  backButton: {
    alignItems: 'center',
    marginTop: -8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  footerText: {
    color: '#ffffff6c',
    fontSize: Typography.body3.fontSize,
  },
  switchModeLink: {
    color: Colors.inverseText,
    fontSize: Typography.body3.fontSize,
    fontWeight: Typography.body3.fontWeight,
    textDecorationLine: 'underline',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    color: '#ffffff6c',
    fontSize: Typography.body4.fontSize,
    textDecorationLine: 'underline',
  },
});
