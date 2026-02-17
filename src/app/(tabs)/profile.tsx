import Alert from '@/src/components/alert';
import { Background } from '@/src/components/Background';
import { CachedImage } from '@/src/components/CachedImage';
import Skeleton from '@/src/components/skeleton';
import { Layout } from '@/src/constants/theme/layout';
import { Colors, Shadows } from '@/src/constants/theme/theme';
import { Typography } from '@/src/constants/theme/typography';
import { useAuth } from '@/src/provider/authProvider';
import { LocationService } from '@/src/services/locationService';
import { ProfileService } from '@/src/services/profileService';
import { useUserCheckInStore } from '@/src/store/useUserCheckInStore';
import { useUserStickyStore } from '@/src/store/useUserStickyStore';
import { Location, User } from '@/src/types/model';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Check, Edit3, MapPin, Settings, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CHECKIN_SIZE = (width - 48) / 3;
const DEFAULT_AVATAR = require('@/assets/images/avatar.png');

export default function ProfileScreen() {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { userCheckedInLocationIds, fetchUserCheckedInLocationIds } = useUserCheckInStore();
  const { userStickies, fetchUserStickies } = useUserStickyStore();

  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR);
  const [displayName, setDisplayName] = useState<string>(t('common.guest'));
  const [newName, setNewName] = useState<string>(t('common.guest'));
  const [isEditingName, setIsEditingName] = useState(false);
  const [email, setEmail] = useState<string>('@Guest');

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    buttons?: {
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }[];
  }>({ title: '', message: '' });

  const [visitedLocations, setVisitedLocations] = useState<Location[]>([]);
  const [citiesCount, setCitiesCount] = useState<number>(0);

  const showAlert = (
    title: string,
    message: string,
    buttons?: {
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }[],
  ) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const hideAlert = () => setAlertVisible(false);

  useEffect(() => {
    if (!session?.user) return;
    session?.user?.email && setEmail(session?.user?.email);
    ProfileService.getProfileById(session?.user?.id).then((user) => {
      setUser(user);
      if (user?.avatarUrl) {
        setAvatarUrl(user.avatarUrl);
      }
      if (user?.displayName) {
        setDisplayName(user.displayName);
        setNewName(user.displayName);
      }
    });
  }, [session?.user]);

  const handleSaveName = async () => {
    if (newName.trim() === '') {
      setNewName(displayName);
      setIsEditingName(false);
      showAlert(t('common.error'), t('profile.nameCannotBeEmpty'));
      return;
    }

    if (newName === displayName) {
      setIsEditingName(false);
      return;
    }
    if (!user?.id) return;
    try {
      const updatedProfile = await ProfileService.updateProfile(user?.id, {
        display_name: newName.trim(),
      });
      setUser(updatedProfile);
      setDisplayName(newName.trim());
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating name:', error);
      setNewName(displayName);
      setIsEditingName(false);
      showAlert(t('common.error'), t('profile.errorUpdatingName'));
    }
  };

  const handleCancelEdit = () => {
    setNewName(displayName);
    setIsEditingName(false);
  };

  const fetchProfileData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const validLocations = await LocationService.getLocationsByIds(userCheckedInLocationIds);
      setVisitedLocations(validLocations);
      const uniqueCityIds = new Set(validLocations.map((loc) => loc.cityId));
      setCitiesCount(uniqueCityIds.size);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsInitialized(true);
      setRefreshing(false);
    }
  }, [user?.id, userCheckedInLocationIds]);

  useEffect(() => {
    if (!user?.id) return;
    fetchProfileData();
  }, [user?.id, userCheckedInLocationIds, fetchProfileData]);

  const onRefresh = useCallback(() => {
    if (!user?.id) return;
    setRefreshing(true);
    fetchUserCheckedInLocationIds(user?.id);
    fetchUserStickies(user?.id);
  }, [fetchUserCheckedInLocationIds, fetchUserStickies, user?.id]);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(nextLang);
    hideAlert();
  };

  const handleLogout = async () => {
    hideAlert();
    await signOut();
    router.replace('/');
  };

  const showSettings = () => {
    showAlert(
      t('profile.settings', 'Settings'),
      t('profile.settingsDesc', 'Manage your account preferences'),
      [
        {
          text:
            i18n.language === 'en' ? t('profile.switchToChinese') : t('profile.switchToEnglish'),
          onPress: toggleLanguage,
        },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: handleLogout,
        },
        {
          text: t('common.cancel'),
          style: 'cancel',
          onPress: hideAlert,
        },
      ],
    );
  };

  if (!isInitialized) {
    return (
      <View style={[styles.container, { backgroundColor: Colors.background }]}>
        <View
          style={{
            flex: 1,
            paddingTop: insets.top + Layout.padding.md,
            paddingHorizontal: Layout.padding.global,
          }}>
          <View style={styles.header}>
            <Skeleton width={40} height={40} borderRadius={20} />
          </View>
          <View style={styles.profileHeader}>
            <Skeleton width={80} height={80} borderRadius={40} />
            <View style={{ flex: 1 }}>
              <Skeleton width={150} height={28} style={{ marginBottom: 8 }} />
              <Skeleton width={200} height={16} />
            </View>
          </View>
          <View style={styles.statsContainer}>
            <Skeleton width="30%" height={80} borderRadius={12} />
            <Skeleton width="30%" height={80} borderRadius={12} />
            <Skeleton width="30%" height={80} borderRadius={12} />
          </View>
          <View style={styles.sectionHeader}>
            <Skeleton width={140} height={28} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                width={CHECKIN_SIZE - 12}
                height={CHECKIN_SIZE - 12}
                borderRadius={20}
              />
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Background />
      <View style={{ flex: 1, paddingTop: insets.top + Layout.padding.md }}>
        {/* Custom Alert */}
        <Alert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons || [{ text: t('common.ok', 'OK'), onPress: hideAlert }]}
          onClose={hideAlert}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={showSettings}>
              <Settings size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={avatarUrl}
                style={styles.avatar}
                contentFit="cover"
                cachePolicy="disk"
              />
            </View>
            <View style={styles.profileInfo}>
              {isEditingName ? (
                <View style={styles.editNameContainer}>
                  <TextInput
                    style={styles.userNameInput}
                    value={newName}
                    onChangeText={setNewName}
                    autoFocus
                    onBlur={handleSaveName}
                    onSubmitEditing={handleSaveName}
                  />
                  <View style={styles.editActions}>
                    <TouchableOpacity onPress={handleSaveName} style={styles.editActionBtn}>
                      <Check size={20} color={Colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleCancelEdit} style={styles.editActionBtn}>
                      <X size={20} color={Colors.secondaryText} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.nameTouchable}
                  onPress={() => setIsEditingName(true)}>
                  <Text style={styles.userName}>{displayName}</Text>
                  <Edit3 size={14} color={Colors.secondaryText} />
                </TouchableOpacity>
              )}
              <Text style={styles.userHandle}>{email}</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{visitedLocations.length}</Text>
              <Text style={styles.statLabel}>{t('profile.checkins')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{citiesCount}</Text>
              <Text style={styles.statLabel}>{t('profile.cities')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStickies.length}</Text>
              <Text style={styles.statLabel}>{t('profile.stickies')}</Text>
            </View>
          </View>

          <View style={styles.sectionTitleWrapper}>
            <Text style={styles.sectionTitle}>{t('profile.memories')}</Text>
            <View style={styles.titleUnderline}>
              <LinearGradient
                colors={Colors.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFillObject]}
              />
            </View>
          </View>

          {visitedLocations.length > 0 ? (
            <View style={styles.checkInsGrid}>
              {visitedLocations.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={styles.checkInItem}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: '/location/[id]',
                      params: {
                        id: loc.id,
                        name: loc.name,
                        imagePath: loc.imagePath,
                        address: loc.address,
                        cityName: loc.cityName,
                      },
                    })
                  }>
                  <CachedImage imageKey={loc.imagePath} style={styles.checkInImage} />
                  <View style={styles.checkInOverlay}>
                    <Text style={styles.checkInName} numberOfLines={1}>
                      {loc.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MapPin size={40} color={Colors.secondaryText} />
              <Text style={styles.emptyText}>{t('profile.noCheckins')}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: Layout.padding.globalBottom,
    paddingHorizontal: Layout.padding.global,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.buttonBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.margin.xl,
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Layout.margin.text,
  },
  userHandle: {
    fontSize: Typography.label.fontSize,
    color: Colors.secondaryText,
    fontWeight: Typography.label.fontWeight,
  },
  editNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Layout.margin.text,
  },
  userNameInput: {
    ...Typography.h2,
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 2,
    minWidth: 120,
  },
  editActions: {
    flexDirection: 'row',
    gap: 4,
  },
  editActionBtn: {
    padding: 4,
  },
  nameTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Layout.margin.text,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.margin.xl,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.cardMd,
    padding: Layout.padding.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft,
  },
  statNumber: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Layout.margin.text,
  },
  statLabel: {
    ...Typography.h4,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: Layout.margin.md,
  },
  sectionTitleWrapper: {
    position: 'relative',
    marginBottom: Layout.margin.md,
  },
  titleUnderline: {
    height: 6,
    borderRadius: 2,
    width: 90,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  checkInsGrid: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  checkInItem: {
    height: CHECKIN_SIZE,
    width: CHECKIN_SIZE,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.cardBackground,
  },
  checkInImage: {
    width: '100%',
    height: '100%',
  },
  checkInOverlay: {
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  checkInName: {
    color: Colors.inverseText,
    ...Typography.h4,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyText: {
    ...Typography.body2,
    color: Colors.secondaryText,
    fontStyle: 'italic',
    fontWeight: 'normal',
  },
});
