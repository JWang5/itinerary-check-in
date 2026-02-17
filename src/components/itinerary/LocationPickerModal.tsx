import { BOTTOM_OFFSET, Layout } from '@/src/constants/theme/layout';
import { Colors, Shadows } from '@/src/constants/theme/theme';
import { Typography } from '@/src/constants/theme/typography';
import { Location } from '@/src/types/model';
import { Check, MapPin, Search, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CachedImage } from '../CachedImage';
import { Tab } from '../Tab';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  locations: Location[];
  cities: { id: string; name: string }[];
  onAddLocations: (selected: Location[]) => void;
  loading: boolean;
}

export const LocationPickerModal = ({
  visible,
  onClose,
  locations,
  cities,
  onAddLocations,
  loading,
}: LocationPickerModalProps) => {
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (visible) {
      setSelectedCityId(null);
      setSearchQuery('');
    }
  }, [visible]);

  const filteredLocations = locations.filter((loc) => {
    const matchesCity = !selectedCityId || loc.cityId === selectedCityId;
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleAdd = () => {
    const selected = locations.filter((loc) => selectedIds.has(loc.id));
    onAddLocations(selected);
    setSelectedIds(new Set());
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{t('itinerary.create.selectLocations')}</Text>
          <TouchableOpacity
            onPress={handleAdd}
            disabled={selectedIds.size === 0}
            style={[styles.modalAddButton, selectedIds.size === 0 && { opacity: 0.5 }]}>
            <Text style={styles.modalAddButtonText}>
              {t('itinerary.create.addCount', { count: selectedIds.size })}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cityFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cityFilterScroll}>
            <Tab
              key={0}
              label={t('itinerary.create.allCities')}
              isActive={!selectedCityId}
              onPress={() => setSelectedCityId(null)}
            />
            {cities.map((city) => (
              <Tab
                key={city.id}
                label={city.name}
                isActive={selectedCityId === city.id}
                style={{
                  backgroundColor: Colors.buttonBackground,
                  borderWidth: 1,
                  borderColor: Colors.border,
                }}
                onPress={() => setSelectedCityId(city.id)}
              />
            ))}
          </ScrollView>
        </View>
        <View style={styles.modalSearchContainer}>
          <Search size={14} color={Colors.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={styles.modalSearchInput}
            placeholder={t('itinerary.create.searchLocations')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.secondaryText}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={Colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.modalLoading}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredLocations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.modalList}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.pickerItem} onPress={() => toggleSelection(item.id)}>
                <CachedImage imageKey={item.imagePath} style={styles.pickerImage} />
                <View style={styles.pickerInfo}>
                  <Text style={styles.pickerName}>{item.name}</Text>
                  <View style={styles.pickerCityRow}>
                    <MapPin size={12} color={Colors.secondaryText} />
                    <Text style={styles.pickerCityText}>
                      {cities.find((c) => c.id === item.cityId)?.name}
                    </Text>
                  </View>
                </View>
                <View style={[styles.checkbox, selectedIds.has(item.id) && styles.checkboxChecked]}>
                  {selectedIds.has(item.id) && <Check size={16} color={Colors.background} />}
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.modalEmpty}>
                <Text style={styles.modalEmptyText}>{t('itinerary.create.noLocationsFound')}</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.viewBackground,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.padding.global,
    paddingTop: Layout.padding.md,
    paddingBottom: Layout.padding.sm,
    // borderBottomWidth: 1,
    // borderBottomColor: Colors.border,
    // backgroundColor: Colors.background,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  modalAddButton: {
    backgroundColor: Colors.text,
    paddingHorizontal: Layout.padding.sm,
    paddingVertical: Layout.padding.xs,
    borderRadius: Layout.borderRadius.cardXs,
  },
  modalAddButtonText: {
    color: Colors.background,
    ...Typography.button,
  },
  modalSearchContainer: {
    marginHorizontal: Layout.padding.global,
    marginBottom: Layout.padding.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBackground,
    paddingHorizontal: Layout.padding.md,
    borderRadius: Layout.borderRadius.cardSm,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 40,
  },
  searchIcon: {
    marginRight: Layout.padding.xs,
  },
  modalSearchInput: {
    flex: 1,
    ...Typography.label,
    color: Colors.text,
    height: '100%',
  },
  cityFilterContainer: {
    marginBottom: Layout.padding.md,
  },
  cityFilterScroll: {
    paddingHorizontal: Layout.padding.global,
    gap: Layout.padding.xs,
  },
  modalList: {
    paddingTop: Layout.padding.md,
    paddingHorizontal: Layout.padding.global,
    paddingBottom: BOTTOM_OFFSET,
    gap: Layout.padding.md,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Layout.padding.sm,
    borderRadius: Layout.borderRadius.cardSm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.soft,
  },
  pickerImage: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.cardXs,
  },
  pickerInfo: {
    flex: 1,
    marginLeft: Layout.padding.md,
  },
  pickerName: {
    ...Typography.caption,
    color: Colors.text,
    marginBottom: Layout.margin.text,
  },
  pickerCityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.margin.text,
  },
  pickerCityText: {
    ...Typography.caption2,
    color: Colors.secondaryText,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  modalLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalEmpty: {
    padding: 40,
    alignItems: 'center',
  },
  modalEmptyText: {
    color: Colors.secondaryText,
    fontSize: 16,
    textAlign: 'center',
  },
});
