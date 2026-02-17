import CustomAlert from '@/src/components/alert';
import BackButton from '@/src/components/backButton';
import { CalendarPickerModal } from '@/src/components/itinerary/CalendarPickerModal';
import { LocationPickerModal } from '@/src/components/itinerary/LocationPickerModal';
import { Layout } from '@/src/constants/theme/layout';
import { Colors, Shadows } from '@/src/constants/theme/theme';
import { useAuth } from '@/src/provider/authProvider';
import { CityService } from '@/src/services/cityService';
import { ItineraryService } from '@/src/services/itineraryService';
import { LocationService } from '@/src/services/locationService';
import { Location, PlannedItem } from '@/src/types/model';
import {
  combineDateAndTime,
  formatToShortDate,
  formatToTime,
  getDaysCount,
  parseTimeToMinutes,
} from '@/src/utils/date';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar as CalendarIcon, Plus, Save } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/src/components/iconButton';
import { EditableRouteItem } from '@/src/components/itinerary/EditableRouteItem';
import Loading from '@/src/components/loading';
import { Tab } from '@/src/components/Tab';
import { Typography } from '@/src/constants/theme/typography';

export default function CreateItineraryScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateRange, setDateRange] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const { session } = useAuth();

  // Calendar State
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

  // Selection State
  const [showPicker, setShowPicker] = useState(false);
  const [plannedRoute, setPlannedRoute] = useState<Record<number, PlannedItem[]>>({ 0: [] });
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Alert States
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all locations and cities for filter tags
        const [locationsData, citiesData] = await Promise.all([
          LocationService.getAllLocations(),
          CityService.getAllCities(),
        ]);
        setAllLocations(locationsData);
        setCities(citiesData);

        // If editing, load existing itinerary
        if (id) {
          const existing = await ItineraryService.getItineraryWithItems(id);
          if (existing) {
            // fill form fields
            setTitle(existing.title);
            setDescription(existing.description || '');
            const start = new Date(existing.startDate);
            const end = new Date(existing.endDate);
            setSelectedStartDate(start);
            setSelectedEndDate(end);

            const diffDaysCount = getDaysCount(start, end);
            setDateRange(
              `${formatToShortDate(start)}${'—'}${formatToShortDate(end)}, ${start.getFullYear()} (${diffDaysCount} ${t('common.days')})`,
            );

            // Map itineraryItems to plannedRoute
            const route: Record<number, PlannedItem[]> = {};
            existing.itineraryItems?.forEach((item) => {
              if (!item.location) return; // skip items without location data
              const day = item.day;
              if (!route[day]) route[day] = [];
              route[day].push({
                id: item.id,
                location: item.location,
                time: formatToTime(item.timestamp),
              });
            });
            const sortedRoute = Object.entries(route).reduce(
              (acc, [key, value]) => {
                acc[Number(key)] = value.sort(
                  (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time),
                );
                return acc;
              },
              {} as Record<number, PlannedItem[]>,
            );
            setPlannedRoute(sortedRoute);
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
    fetchData();
  }, [id, t]);

  const handleCreate = async () => {
    if (!session?.user) return;
    // Validate title
    if (!title.trim()) {
      setErrorAlert({
        visible: true,
        title: t('common.error'),
        message: t('itinerary.create.errorNoTitle'),
      });
      return;
    }
    // Validate date range
    if (!selectedStartDate || !selectedEndDate) {
      setErrorAlert({
        visible: true,
        title: t('common.error'),
        message: t('itinerary.create.errorNoDate'),
      });
      return;
    }
    // Validate at least one location is added
    const hasLocations = Object.values(plannedRoute).some((day) => day.length > 0);
    if (!hasLocations) {
      setErrorAlert({
        visible: true,
        title: t('common.error'),
        message: t('itinerary.create.errorNoLocations'),
      });
      return;
    }

    try {
      setSaving(true);
      if (isEditing) {
        // Calculate updated cover image from the first location
        const firstLocation = Object.values(plannedRoute).flat()[0]?.location;
        const coverImagePath = firstLocation?.imagePath;
        // Update basic info
        await ItineraryService.updateItinerary({
          id,
          userId: session.user.id,
          title,
          description,
          startDate: selectedStartDate.toISOString(),
          endDate: selectedEndDate.toISOString(),
          coverImagePath,
        });

        // Delete removed items first
        if (deletedItemIds.length > 0) {
          await Promise.all(
            deletedItemIds.map((itemId) => ItineraryService.deleteItineraryItem(itemId)),
          );
        }

        // Create an array of promises for items
        const itemPromises: Promise<any>[] = [];
        Object.entries(plannedRoute).forEach(([day, items]) => {
          const dayNum = parseInt(day);
          items.forEach((item) => {
            const plannedDate = new Date(selectedStartDate);
            plannedDate.setDate(plannedDate.getDate() + dayNum);
            const timestamp = combineDateAndTime(plannedDate, item.time);

            // If ID exists and doesn't start with 'temp_', it's a persistent item from DB
            if (item.id && !item.id.startsWith('temp_')) {
              itemPromises.push(
                ItineraryService.updateItineraryItem({
                  id: item.id,
                  itineraryId: id,
                  locationId: item.location.id,
                  day: dayNum,
                  timestamp: timestamp,
                }),
              );
            } else {
              // New item or temporary item
              itemPromises.push(
                ItineraryService.createItineraryItem({
                  itineraryId: id,
                  locationId: item.location.id,
                  day: dayNum,
                  timestamp: timestamp,
                }),
              );
            }
          });
        });
        await Promise.all(itemPromises);
      } else {
        // Get first location image for cover, with safety check
        const firstLocation = Object.values(plannedRoute).flat()[0]?.location;
        const createdId = await ItineraryService.createItinerary({
          userId: session.user.id,
          title,
          description,
          startDate: selectedStartDate.toISOString(),
          endDate: selectedEndDate.toISOString(),
          coverImagePath: firstLocation?.imagePath,
        });

        // Add all items
        const itemPromises: Promise<void>[] = [];
        Object.entries(plannedRoute).forEach(([day, items]) => {
          const dayNum = parseInt(day);
          items.forEach((item) => {
            const plannedDate = new Date(selectedStartDate);
            plannedDate.setDate(plannedDate.getDate() + dayNum);
            const timestamp = combineDateAndTime(plannedDate, item.time);
            itemPromises.push(
              ItineraryService.createItineraryItem({
                itineraryId: createdId,
                locationId: item.location.id,
                day: dayNum,
                timestamp: timestamp,
              }),
            );
          });
        });
        await Promise.all(itemPromises);
      }
      router.back();
    } catch (err) {
      console.error(err);
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
    const hasLocations = Object.values(plannedRoute).some((day) => day.length > 0);
    return hasLocations;
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
            onPress: () => setErrorAlert((p) => ({ ...p, visible: false })),
          },
          {
            text: t('common.discard'),
            style: 'destructive',
            onPress: () => {
              setErrorAlert((p) => ({ ...p, visible: false }));
              router.back();
            },
          },
        ],
      });
    } else {
      router.back();
    }
  };

  const handleReset = async () => {
    if (isEditing) {
      const existing = await ItineraryService.getItineraryWithItems(id);
      if (existing) {
        setTitle(existing.title);
        setDescription(existing.description || '');
        const start = new Date(existing.startDate);
        const end = new Date(existing.endDate);
        setSelectedStartDate(start);
        setSelectedEndDate(end);

        const diffDaysCount = getDaysCount(start, end);
        setDateRange(
          `${formatToShortDate(start)} - ${formatToShortDate(end)}, ${start.getFullYear()} (${diffDaysCount} days)`,
        );

        const route: Record<number, PlannedItem[]> = {};
        existing.itineraryItems?.forEach((item) => {
          if (!item.location) return; // skip items without location data
          const day = item.day;
          if (!route[day]) route[day] = [];
          route[day].push({
            id: item.id,
            location: item.location,
            time: formatToTime(item.timestamp),
          });
        });
        // Sort each day's items by time (same as initial load)
        const sortedRoute = Object.entries(route).reduce(
          (acc, [key, value]) => {
            acc[Number(key)] = value.sort(
              (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time),
            );
            return acc;
          },
          {} as Record<number, PlannedItem[]>,
        );
        setPlannedRoute(sortedRoute);
        setDeletedItemIds([]);
      }
    } else {
      setTitle('');
      setDescription('');
      setDateRange(null);
      setSelectedStartDate(null);
      setSelectedEndDate(null);
      setPlannedRoute({ 0: [] });
      setActiveDay(0);
      setDeletedItemIds([]);
    }
    setErrorAlert((p) => ({ ...p, visible: false }));
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
          onPress: () => setErrorAlert((p) => ({ ...p, visible: false })),
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
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: Layout.padding.md }]}>
        <BackButton onPress={handleBack} />
        <TouchableOpacity onPress={showResetConfirmation}>
          <Text style={styles.resetText}>{t('common.reset')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.contentScroll}
        showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: Layout.margin.lg }}>
          <View>
            <Text style={styles.sectionLabel}>{t('itinerary.create.titleLabel')}</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
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
                style={[styles.input, { paddingBottom: 16 }]}
                value={description}
                multiline
                numberOfLines={2}
                onChangeText={setDescription}
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
                style={[{ width: 'auto', color: dateRange ? Colors.text : Colors.secondaryText }]}>
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
            {Array.from({ length: daysCount }).map((_, i) => (
              <Tab
                key={i}
                label={t('itinerary.day', { day: i + 1 })}
                isActive={activeDay === i}
                onPress={() => setActiveDay(i)}
              />
            ))}
          </ScrollView>
        </View>
        <View style={styles.routeList}>
          <TouchableOpacity
            style={[{ padding: Layout.padding.md }, styles.addContainer]}
            activeOpacity={0.6}
            onPress={() => setShowPicker(true)}>
            <View style={styles.emptyAddButton}>
              <Plus size={20} color={Colors.text} />
              <Text style={styles.emptyAddButtonText}>{t('itinerary.create.addLocation')}</Text>
            </View>
          </TouchableOpacity>

          <View>
            {dayData.map((item, index) => (
              <Animated.View
                key={item.id}
                layout={LinearTransition.springify().damping(45).stiffness(200)}>
                <EditableRouteItem
                  location={item.location}
                  time={item.time}
                  isFirst={index === 0}
                  isLast={index === dayData.length - 1}
                  onRemove={() => {
                    // Track deleted item if it's a persistent item (not temp)
                    if (item.id && !item.id.startsWith('temp_')) {
                      setDeletedItemIds((prev) => [...prev, item.id!]);
                    }
                    setPlannedRoute((prev) => ({
                      ...prev,
                      [activeDay]: prev[activeDay].filter((it) => it.id !== item.id),
                    }));
                  }}
                  onTimeChange={(newTime) =>
                    setPlannedRoute((prev) => {
                      const updated = prev[activeDay].map((it) =>
                        it.id === item.id ? { ...it, time: newTime } : it,
                      );
                      // Sort by time
                      updated.sort(
                        (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time),
                      );
                      return { ...prev, [activeDay]: updated };
                    })
                  }
                  onMoveUp={() => {
                    if (index > 0) {
                      setPlannedRoute((prev) => {
                        const list = [...prev[activeDay]];
                        // Swap times between current item and the one above
                        const currentTime = list[index].time;
                        const aboveTime = list[index - 1].time;
                        list[index] = { ...list[index], time: aboveTime };
                        list[index - 1] = { ...list[index - 1], time: currentTime };
                        // Sort by time
                        list.sort(
                          (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time),
                        );
                        return { ...prev, [activeDay]: list };
                      });
                    }
                  }}
                  onMoveDown={() => {
                    if (index < dayData.length - 1) {
                      setPlannedRoute((prev) => {
                        const list = [...prev[activeDay]];
                        // Swap times between current item and the one below
                        const currentTime = list[index].time;
                        const belowTime = list[index + 1].time;
                        list[index] = { ...list[index], time: belowTime };
                        list[index + 1] = { ...list[index + 1], time: currentTime };
                        // Sort by time
                        list.sort(
                          (a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time),
                        );
                        return { ...prev, [activeDay]: list };
                      });
                    }
                  }}
                />
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>

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

      <LocationPickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        locations={allLocations}
        cities={cities}
        onAddLocations={(selected) => {
          setPlannedRoute((prev) => {
            const currentRoute = prev[activeDay] || [];

            // Find the latest time in current route, or start at 09:00
            let lastMinutes = 9 * 60; // 9:00 as default start
            if (currentRoute.length > 0) {
              const maxTime = Math.max(
                ...currentRoute.map((item) => parseTimeToMinutes(item.time)),
              );
              lastMinutes = maxTime;
            }

            // Add new items with 30-minute intervals after the last item
            const newItems: PlannedItem[] = selected.map((loc, idx) => {
              const newMinutes = lastMinutes + (idx + 1) * 30;
              const hours24 = Math.floor(newMinutes / 60) % 24;
              const minutes = newMinutes % 60;
              const timeStr = `${hours24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

              return {
                id: `temp_${Math.random().toString(36).slice(2, 11)}`,
                location: loc,
                time: timeStr,
              };
            });

            const combined = [...currentRoute, ...newItems];
            // Sort by time
            combined.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

            return {
              ...prev,
              [activeDay]: combined,
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
          setSelectedStartDate(start);
          setSelectedEndDate(end);
          const newDaysCount = getDaysCount(start, end);
          setDateRange(
            `${formatToShortDate(start)}${'—'}${formatToShortDate(end)}, ${start.getFullYear()} (${newDaysCount} ${t('common.days')})`,
          );

          // If the new date range is shorter, remove route items on days that no longer exist
          setPlannedRoute((prev) => {
            const trimmed: Record<number, PlannedItem[]> = {};
            for (const [dayKey, items] of Object.entries(prev)) {
              const dayNum = Number(dayKey);
              if (dayNum < newDaysCount) {
                trimmed[dayNum] = items;
              } else {
                // Track persistent items being removed so they get deleted on save
                items.forEach((item) => {
                  if (item.id && !item.id.startsWith('temp_')) {
                    setDeletedItemIds((ids) => [...ids, item.id!]);
                  }
                });
              }
            }
            return trimmed;
          });

          // Reset active day if it's now out of bounds
          if (activeDay >= newDaysCount) {
            setActiveDay(Math.max(0, newDaysCount - 1));
          }

          setShowCalendar(false);
        }}
      />

      {/* Alerts */}
      <CustomAlert
        visible={errorAlert.visible}
        title={errorAlert.title}
        message={errorAlert.message}
        onClose={() => setErrorAlert((prev) => ({ ...prev, visible: false }))}
        buttons={errorAlert.buttons}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    paddingBottom: Layout.padding.globalBottom,
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
  routeCount: {
    ...Typography.caption,
    color: Colors.text,
  },
  daySelectorContainer: {
    marginBottom: Layout.margin.sm,
  },
  dayActionRow: {
    position: 'relative',
    marginBottom: Layout.margin.md,
  },
  dayAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.margin.xs,
    backgroundColor: Colors.background,
  },
  dayAddButtonText: {
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
    color: Colors.text,
  },
  routeList: {
    paddingBottom: 40,
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
  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addContainer: {
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius.cardSm,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Layout.margin.md,
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.margin.xs,
  },
  emptyAddButtonText: {
    color: Colors.text,
    fontSize: Typography.button.fontSize,
    fontWeight: Typography.button.fontWeight,
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
