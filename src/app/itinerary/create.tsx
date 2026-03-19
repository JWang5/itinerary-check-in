import CustomAlert from '@/src/components/alert';
import BackButton from '@/src/components/backButton';
import { IconButton } from '@/src/components/iconButton';
import { CalendarPickerModal } from '@/src/components/itinerary/CalendarPickerModal';
import { EditableRouteItem } from '@/src/components/itinerary/EditableRouteItem';
import { LocationPickerModal } from '@/src/components/itinerary/LocationPickerModal';
import Loading from '@/src/components/loading';
import { Tab } from '@/src/components/Tab';
import { Layout } from '@/src/constants/theme/layout';
import { Colors, Shadows } from '@/src/constants/theme/theme';
import { Typography } from '@/src/constants/theme/typography';
import { useAuth } from '@/src/provider/authProvider';
import { CityService } from '@/src/services/cityService';
import { ItineraryService } from '@/src/services/itineraryService';
import { LocationService } from '@/src/services/locationService';
import { ItineraryItem, Location, PlannedItem } from '@/src/types/model';
import {
  combineDateAndTime,
  formatToShortDate,
  formatToTime,
  getDaysCount,
  parseTimeToMinutes,
} from '@/src/utils/date';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar as CalendarIcon, Plus, Save } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

function sortPlannedItems(items: PlannedItem[]) {
  return [...items].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
}

function getNextTimeValue(items: PlannedItem[]) {
  if (items.length === 0) {
    return '09:30';
  }

  const maxTime = Math.max(...items.map((item) => parseTimeToMinutes(item.time)));
  const nextMinutes = maxTime + 30;
  const hours24 = Math.floor(nextMinutes / 60) % 24;
  const minutes = nextMinutes % 60;

  return `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function createTempLocationItem(location: Location, time: string): PlannedItem {
  return {
    id: `temp_${Math.random().toString(36).slice(2, 11)}`,
    time,
    itemType: 'location',
    location,
  };
}

function createTempCustomItem(time: string): PlannedItem {
  return {
    id: `temp_${Math.random().toString(36).slice(2, 11)}`,
    time,
    itemType: 'custom',
    customName: '',
    customAddress: '',
  };
}

function toPlannedItem(item: ItineraryItem): PlannedItem | null {
  const itemType = item.itemType ?? (item.location ? 'location' : 'custom');

  if (itemType === 'location' && !item.location) {
    return null;
  }

  return {
    id: item.id,
    time: formatToTime(item.timestamp),
    itemType,
    location: item.location ?? null,
    customName: item.customName ?? '',
    customAddress: item.customAddress ?? '',
  };
}

function mapItineraryItemsToRoute(items?: ItineraryItem[]) {
  const route: Record<number, PlannedItem[]> = {};

  items?.forEach((item) => {
    const mappedItem = toPlannedItem(item);
    if (!mappedItem) {
      return;
    }

    if (!route[item.day]) {
      route[item.day] = [];
    }

    route[item.day].push(mappedItem);
  });

  return Object.entries(route).reduce(
    (acc, [day, dayItems]) => {
      acc[Number(day)] = sortPlannedItems(dayItems);
      return acc;
    },
    {} as Record<number, PlannedItem[]>,
  );
}

function getCoverImagePath(plannedRoute: Record<number, PlannedItem[]>) {
  return (
    Object.values(plannedRoute)
      .flat()
      .find((item) => item.itemType === 'location' && item.location?.imagePath)?.location
      ?.imagePath || ''
  );
}

function hasIncompleteCustomStop(plannedRoute: Record<number, PlannedItem[]>) {
  return Object.values(plannedRoute)
    .flat()
    .some(
      (item) =>
        item.itemType === 'custom' &&
        (!item.customName?.trim().length || !item.customAddress?.trim().length),
    );
}

function buildItineraryItemPayload(
  itineraryId: string,
  item: PlannedItem,
  day: number,
  timestamp: string,
): Omit<ItineraryItem, 'id'> {
  return {
    itineraryId,
    locationId: item.itemType === 'location' ? (item.location?.id ?? null) : null,
    day,
    timestamp,
    itemType: item.itemType,
    customName: item.itemType === 'custom' ? (item.customName?.trim() ?? '') : null,
    customAddress: item.itemType === 'custom' ? (item.customAddress?.trim() ?? '') : null,
    location: item.location ?? null,
  };
}

function getDayCountLabel(count: number, translate: (key: string) => string) {
  return count === 1 ? translate('common.day') : translate('common.days');
}

function formatSelectedDateRange(start: Date, end: Date, translate: (key: string) => string) {
  const totalDays = getDaysCount(start, end);
  const isSingleDayRange = start.toDateString() === end.toDateString();
  const rangeLabel = isSingleDayRange
    ? formatToShortDate(start)
    : `${formatToShortDate(start)}—${formatToShortDate(end)}`;

  return `${rangeLabel}, ${start.getFullYear()} (${totalDays} ${getDayCountLabel(totalDays, translate)})`;
}

export default function CreateItineraryScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const titleInputRef = useRef<TextInput | null>(null);
  const descriptionInputRef = useRef<TextInput | null>(null);
  const focusedInputRef = useRef<TextInput | null>(null);
  const scrollOffsetRef = useRef(0);
  const keyboardTopRef = useRef(Number.POSITIVE_INFINITY);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

  const [showPicker, setShowPicker] = useState(false);
  const [plannedRoute, setPlannedRoute] = useState<Record<number, PlannedItem[]>>({ 0: [] });
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [errorAlert, setErrorAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons?: {
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }[];
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const { t } = useTranslation();
  const daysCount = getDaysCount(selectedStartDate, selectedEndDate);
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = !!id;
  const dateRange =
    selectedStartDate && selectedEndDate
      ? formatSelectedDateRange(selectedStartDate, selectedEndDate, t)
      : null;

  const scrollInputIntoView = (input: TextInput | null, delay = 0) => {
    if (!input) {
      return;
    }

    const run = () => {
      input.measureInWindow((_, y, __, height) => {
        const keyboardTop = keyboardTopRef.current;
        if (!Number.isFinite(keyboardTop)) {
          return;
        }

        const visibleBottom = keyboardTop - Layout.padding.md;
        const inputBottom = y + height;

        if (inputBottom <= visibleBottom) {
          return;
        }

        const overlap = inputBottom - visibleBottom;

        scrollViewRef.current?.scrollTo({
          y: Math.max(0, scrollOffsetRef.current + overlap + Layout.padding.lg),
          animated: true,
        });
      });
    };

    if (delay > 0) {
      setTimeout(run, delay);
      return;
    }

    run();
  };

  const handleInputFocus = (input: TextInput | null) => {
    focusedInputRef.current = input;
    scrollInputIntoView(input, Platform.OS === 'ios' ? 80 : 140);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [locationsData, citiesData] = await Promise.all([
          LocationService.getAllLocations(),
          CityService.getAllCities(),
        ]);

        setAllLocations(locationsData);
        setCities(citiesData);

        if (id) {
          const existing = await ItineraryService.getItineraryWithItems(id);
          if (existing) {
            const start = new Date(existing.startDate);
            const end = new Date(existing.endDate);

            setTitle(existing.title);
            setDescription(existing.description || '');
            setSelectedStartDate(start);
            setSelectedEndDate(end);
            setPlannedRoute(mapItineraryItemsToRoute(existing.itineraryItems));
          }
        }
      } catch (error) {
        console.error('Failed to fetch data for picker', error);
        setErrorAlert({
          visible: true,
          title: t('common.error'),
          message: t('common.fetchError'),
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [id, t]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      keyboardTopRef.current = event.endCoordinates.screenY;
      setIsKeyboardVisible(true);

      if (focusedInputRef.current) {
        scrollInputIntoView(focusedInputRef.current, Platform.OS === 'ios' ? 0 : 50);
      }
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      keyboardTopRef.current = Number.POSITIVE_INFINITY;
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleCreate = async () => {
    if (!session?.user) return;

    if (!title.trim()) {
      setErrorAlert({
        visible: true,
        title: t('common.error'),
        message: t('itinerary.create.errorNoTitle'),
      });
      return;
    }

    if (!selectedStartDate || !selectedEndDate) {
      setErrorAlert({
        visible: true,
        title: t('common.error'),
        message: t('itinerary.create.errorNoDate'),
      });
      return;
    }

    if (selectedEndDate < selectedStartDate) {
      setErrorAlert({
        visible: true,
        title: t('common.error'),
        message: t('itinerary.create.errorInvalidDateRange'),
      });
      return;
    }

    const hasRouteItems = Object.values(plannedRoute).some((day) => day.length > 0);
    if (!hasRouteItems) {
      setErrorAlert({
        visible: true,
        title: t('common.error'),
        message: t('itinerary.create.errorNoItems'),
      });
      return;
    }

    if (hasIncompleteCustomStop(plannedRoute)) {
      setErrorAlert({
        visible: true,
        title: t('common.error'),
        message: t('itinerary.create.errorIncompleteCustomStop'),
      });
      return;
    }

    try {
      setSaving(true);

      if (isEditing && id) {
        await ItineraryService.updateItinerary({
          id,
          userId: session.user.id,
          title,
          description,
          startDate: selectedStartDate.toISOString(),
          endDate: selectedEndDate.toISOString(),
          coverImagePath: getCoverImagePath(plannedRoute),
        });

        if (deletedItemIds.length > 0) {
          await Promise.all(
            deletedItemIds.map((itemId) => ItineraryService.deleteItineraryItem(itemId)),
          );
        }

        const itemPromises: Promise<void>[] = [];

        Object.entries(plannedRoute).forEach(([day, items]) => {
          const dayNum = Number(day);

          items.forEach((item) => {
            const plannedDate = new Date(selectedStartDate);
            plannedDate.setDate(plannedDate.getDate() + dayNum);
            const timestamp = combineDateAndTime(plannedDate, item.time);
            const payload = buildItineraryItemPayload(id, item, dayNum, timestamp);

            if (!item.id.startsWith('temp_')) {
              itemPromises.push(
                ItineraryService.updateItineraryItem({
                  id: item.id,
                  ...payload,
                }),
              );
            } else {
              itemPromises.push(ItineraryService.createItineraryItem(payload));
            }
          });
        });

        await Promise.all(itemPromises);
      } else {
        const createdId = await ItineraryService.createItinerary({
          userId: session.user.id,
          title,
          description,
          startDate: selectedStartDate.toISOString(),
          endDate: selectedEndDate.toISOString(),
          coverImagePath: getCoverImagePath(plannedRoute),
        });

        const itemPromises: Promise<void>[] = [];

        Object.entries(plannedRoute).forEach(([day, items]) => {
          const dayNum = Number(day);

          items.forEach((item) => {
            const plannedDate = new Date(selectedStartDate);
            plannedDate.setDate(plannedDate.getDate() + dayNum);
            const timestamp = combineDateAndTime(plannedDate, item.time);

            itemPromises.push(
              ItineraryService.createItineraryItem(
                buildItineraryItemPayload(createdId, item, dayNum, timestamp),
              ),
            );
          });
        });

        await Promise.all(itemPromises);
      }

      router.back();
    } catch (error) {
      console.error(error);
      setErrorAlert({
        visible: true,
        title: t('common.error'),
        message: t('itinerary.create.errorSaving'),
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    return Object.values(plannedRoute).some((day) => day.length > 0);
  };

  const handleBack = () => {
    if (hasChanges()) {
      setErrorAlert({
        visible: true,
        title: t('common.discardChanges'),
        message: t('common.discardChangesMessage'),
        buttons: [
          {
            text: t('common.cancel'),
            style: 'cancel',
            onPress: () => setErrorAlert((prev) => ({ ...prev, visible: false })),
          },
          {
            text: t('common.discard'),
            style: 'destructive',
            onPress: () => {
              setErrorAlert((prev) => ({ ...prev, visible: false }));
              router.back();
            },
          },
        ],
      });
      return;
    }

    router.back();
  };

  const handleReset = async () => {
    if (isEditing && id) {
      const existing = await ItineraryService.getItineraryWithItems(id);
      if (existing) {
        const start = new Date(existing.startDate);
        const end = new Date(existing.endDate);

        setTitle(existing.title);
        setDescription(existing.description || '');
        setSelectedStartDate(start);
        setSelectedEndDate(end);
        setPlannedRoute(mapItineraryItemsToRoute(existing.itineraryItems));
        setDeletedItemIds([]);
      }
    } else {
      setTitle('');
      setDescription('');
      setSelectedStartDate(null);
      setSelectedEndDate(null);
      setPlannedRoute({ 0: [] });
      setActiveDay(0);
      setDeletedItemIds([]);
    }

    setErrorAlert((prev) => ({ ...prev, visible: false }));
  };

  const showResetConfirmation = () => {
    setErrorAlert({
      visible: true,
      title: t('common.reset'),
      message: t('itinerary.create.resetConfirm'),
      buttons: [
        {
          text: t('common.cancel'),
          style: 'cancel',
          onPress: () => setErrorAlert((prev) => ({ ...prev, visible: false })),
        },
        {
          text: t('common.reset'),
          style: 'destructive',
          onPress: handleReset,
        },
      ],
    });
  };

  if (loading && isEditing) {
    return <Loading />;
  }

  const dayData = plannedRoute[activeDay] || [];

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { paddingTop: Layout.padding.md }]}>
          <BackButton onPress={handleBack} />
          <TouchableOpacity onPress={showResetConfirmation}>
            <Text style={styles.resetText}>{t('common.reset')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.contentContainer}
          contentContainerStyle={styles.contentScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          scrollEventThrottle={16}
          onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
            scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
          }}>
          <View style={{ marginBottom: Layout.margin.lg }}>
            <View>
              <Text style={styles.sectionLabel}>{t('itinerary.create.titleLabel')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  ref={titleInputRef}
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  onFocus={() => handleInputFocus(titleInputRef.current)}
                  placeholder={t('itinerary.create.titlePlaceholder')}
                  placeholderTextColor={Colors.secondaryText}
                  maxLength={15}
                />
                <Text style={styles.charCount}>{title.length}/15</Text>
              </View>
            </View>

            <View>
              <Text style={styles.sectionLabel}>{t('itinerary.create.descriptionLabel')}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  ref={descriptionInputRef}
                  style={[styles.input, { paddingBottom: 16 }]}
                  value={description}
                  multiline
                  numberOfLines={2}
                  onChangeText={setDescription}
                  onFocus={() => handleInputFocus(descriptionInputRef.current)}
                  placeholder={t('itinerary.create.descriptionPlaceholder')}
                  placeholderTextColor={Colors.secondaryText}
                  maxLength={40}
                />
                <Text style={styles.charCount}>{description.length}/40</Text>
              </View>
            </View>

            <View>
              <Text style={styles.sectionLabel}>{t('itinerary.create.dateRangeLabel')}</Text>
              <TouchableOpacity
                style={[styles.inputContainer, { justifyContent: 'space-between' }]}
                onPress={() => setShowCalendar(true)}>
                <Text
                  style={{
                    width: 'auto',
                    color: dateRange ? Colors.text : Colors.secondaryText,
                  }}>
                  {dateRange || t('itinerary.create.dateRangePlaceholder')}
                </Text>
                <CalendarIcon size={20} color={Colors.secondaryText} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.routeSectionHeader}>
            <Text style={styles.routeSectionTitle}>{t('itinerary.create.locationsPlaned')}</Text>
          </View>

          <View style={styles.daySelectorContainer}>
            <ScrollView
              horizontal
              contentContainerStyle={{ gap: Layout.margin.md }}
              showsHorizontalScrollIndicator={false}>
              {Array.from({ length: daysCount }).map((_, index) => (
                <Tab
                  key={index}
                  label={t('itinerary.day', { day: index + 1 })}
                  isActive={activeDay === index}
                  onPress={() => setActiveDay(index)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.routeList}>
            <View style={styles.addActionsRow}>
              <TouchableOpacity
                style={[styles.addContainer, styles.addActionButton]}
                activeOpacity={0.6}
                onPress={() => setShowPicker(true)}>
                <View style={styles.emptyAddButton}>
                  <Plus size={20} color={Colors.text} />
                  <Text style={styles.emptyAddButtonText}>{t('itinerary.create.addLocation')}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.addContainer, styles.addActionButton]}
                activeOpacity={0.6}
                onPress={() => {
                  setPlannedRoute((prev) => {
                    const currentRoute = prev[activeDay] || [];
                    const newItem = createTempCustomItem(getNextTimeValue(currentRoute));

                    return {
                      ...prev,
                      [activeDay]: sortPlannedItems([...currentRoute, newItem]),
                    };
                  });
                }}>
                <View style={styles.emptyAddButton}>
                  <Plus size={20} color={Colors.text} />
                  <Text style={styles.emptyAddButtonText}>
                    {t('itinerary.create.addCustomStop')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View>
              {dayData.map((item, index) => (
                <Animated.View
                  key={item.id}
                  layout={LinearTransition.springify().damping(45).stiffness(200)}>
                  <EditableRouteItem
                    item={item}
                    time={item.time}
                    isFirst={index === 0}
                    isLast={index === dayData.length - 1}
                    onCustomFieldFocus={handleInputFocus}
                    onRemove={() => {
                      if (!item.id.startsWith('temp_')) {
                        setDeletedItemIds((prev) => [...prev, item.id]);
                      }

                      setPlannedRoute((prev) => ({
                        ...prev,
                        [activeDay]: prev[activeDay].filter(
                          (routeItem) => routeItem.id !== item.id,
                        ),
                      }));
                    }}
                    onTimeChange={(newTime) => {
                      setPlannedRoute((prev) => {
                        const updated = prev[activeDay].map((routeItem) =>
                          routeItem.id === item.id ? { ...routeItem, time: newTime } : routeItem,
                        );

                        return { ...prev, [activeDay]: sortPlannedItems(updated) };
                      });
                    }}
                    onCustomNameChange={(customName) => {
                      setPlannedRoute((prev) => ({
                        ...prev,
                        [activeDay]: prev[activeDay].map((routeItem) =>
                          routeItem.id === item.id ? { ...routeItem, customName } : routeItem,
                        ),
                      }));
                    }}
                    onCustomAddressChange={(customAddress) => {
                      setPlannedRoute((prev) => ({
                        ...prev,
                        [activeDay]: prev[activeDay].map((routeItem) =>
                          routeItem.id === item.id ? { ...routeItem, customAddress } : routeItem,
                        ),
                      }));
                    }}
                    onMoveUp={() => {
                      if (index === 0) {
                        return;
                      }

                      setPlannedRoute((prev) => {
                        const list = [...prev[activeDay]];
                        const currentTime = list[index].time;
                        const previousTime = list[index - 1].time;

                        list[index] = { ...list[index], time: previousTime };
                        list[index - 1] = { ...list[index - 1], time: currentTime };

                        return { ...prev, [activeDay]: sortPlannedItems(list) };
                      });
                    }}
                    onMoveDown={() => {
                      if (index >= dayData.length - 1) {
                        return;
                      }

                      setPlannedRoute((prev) => {
                        const list = [...prev[activeDay]];
                        const currentTime = list[index].time;
                        const nextTime = list[index + 1].time;

                        list[index] = { ...list[index], time: nextTime };
                        list[index + 1] = { ...list[index + 1], time: currentTime };

                        return { ...prev, [activeDay]: sortPlannedItems(list) };
                      });
                    }}
                  />
                </Animated.View>
              ))}
            </View>
          </View>
        </ScrollView>

        {!isKeyboardVisible ? (
          <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 20 }]}>
            <IconButton
              style={[styles.floatingButton, saving && styles.floatingButtonDisabled]}
              textColor={Colors.inverseText}
              icon={<Save size={20} />}
              onPress={handleCreate}
              text={
                saving
                  ? t('common.saving')
                  : isEditing
                    ? t('itinerary.create.updateButton')
                    : t('itinerary.create.button')
              }
              disabled={saving}
            />
          </View>
        ) : null}

        <LocationPickerModal
          visible={showPicker}
          onClose={() => setShowPicker(false)}
          locations={allLocations}
          cities={cities}
          onAddLocations={(selected) => {
            setPlannedRoute((prev) => {
              const currentRoute = prev[activeDay] || [];
              const newItems: PlannedItem[] = [];
              let nextTime = getNextTimeValue(currentRoute);

              selected.forEach((location) => {
                newItems.push(createTempLocationItem(location, nextTime));
                nextTime = getNextTimeValue([...currentRoute, ...newItems]);
              });

              return {
                ...prev,
                [activeDay]: sortPlannedItems([...currentRoute, ...newItems]),
              };
            });

            setShowPicker(false);
          }}
          loading={loading}
        />

        <CalendarPickerModal
          visible={showCalendar}
          onClose={() => setShowCalendar(false)}
          startDate={selectedStartDate}
          endDate={selectedEndDate}
          onSelect={(start, end) => {
            const newDaysCount = getDaysCount(start, end);
            setSelectedStartDate(start);
            setSelectedEndDate(end);
            setPlannedRoute((prev) => {
              const trimmed: Record<number, PlannedItem[]> = {};

              for (const [dayKey, items] of Object.entries(prev)) {
                const dayNum = Number(dayKey);

                if (dayNum < newDaysCount) {
                  trimmed[dayNum] = items;
                  continue;
                }

                items.forEach((item) => {
                  if (!item.id.startsWith('temp_')) {
                    setDeletedItemIds((ids) => [...ids, item.id]);
                  }
                });
              }

              return trimmed;
            });

            if (activeDay >= newDaysCount) {
              setActiveDay(Math.max(0, newDaysCount - 1));
            }

            setShowCalendar(false);
          }}
        />

        <CustomAlert
          visible={errorAlert.visible}
          title={errorAlert.title}
          message={errorAlert.message}
          onClose={() => setErrorAlert((prev) => ({ ...prev, visible: false }))}
          buttons={errorAlert.buttons}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.viewBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.margin.md,
    paddingHorizontal: Layout.padding.global,
  },
  resetText: {
    color: Colors.text,
    ...Typography.caption,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Layout.padding.global,
  },
  contentScroll: {
    paddingBottom: Layout.padding.globalBottom + 120,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.text,
    marginBottom: Layout.margin.xs,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  inputContainer: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: Colors.cardBackground,
    borderRadius: Layout.borderRadius.cardSm,
    paddingHorizontal: Layout.padding.md,
    paddingVertical: Layout.padding.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Layout.margin.md,
  },
  input: {
    width: '100%',
    ...Typography.body2,
    color: Colors.text,
  },
  routeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Layout.margin.md,
  },
  routeSectionTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  daySelectorContainer: {
    marginBottom: Layout.margin.sm,
  },
  routeList: {
    paddingBottom: 40,
  },
  addActionsRow: {
    flexDirection: 'row',
    gap: Layout.grid.gap.sm,
    marginBottom: Layout.margin.md,
  },
  addActionButton: {
    flex: 1,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Layout.padding.global,
    backgroundColor: Colors.background,
    paddingVertical: 20,
  },
  floatingButton: {
    backgroundColor: Colors.text,
    ...Shadows.large,
  },
  addContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.cardSm,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 64,
    paddingHorizontal: Layout.padding.md,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.margin.xs,
  },
  emptyAddButtonText: {
    color: Colors.text,
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
    textAlign: 'center',
  },
  floatingButtonDisabled: {
    opacity: 0.6,
  },
  charCount: {
    position: 'absolute',
    right: Layout.padding.md,
    bottom: Layout.padding.xs,
    fontSize: Typography.caption.fontSize - 2,
    color: Colors.secondaryText,
  },
});
