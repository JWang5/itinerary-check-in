import { Colors } from '@/src/constants/theme/theme';
import { Tabs } from 'expo-router';
import { Compass, Map, StickyNote, User } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: Colors.text,
        tabBarInactiveTintColor: Colors.secondaryText,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'normal',
          marginTop: 5,
          paddingBottom: 5,
        },
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          height: Platform.OS === 'ios' ? 96 : 76,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopWidth: 0,
        },
      }}>
      <Tabs.Screen
        name="explore"
        options={{
          title: t('nav_explore'),
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
              <Compass size={24} color={focused ? Colors.inverseText : Colors.secondaryText} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: t('nav_notes'),
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
              <StickyNote size={24} color={focused ? Colors.inverseText : Colors.secondaryText} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="itinerary"
        options={{
          title: t('itineraries'),
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
              <Map size={24} color={focused ? Colors.inverseText : Colors.secondaryText} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('nav_profile'),
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabIconContainer, focused && styles.tabIconActive]}>
              <User size={24} color={focused ? Colors.inverseText : Colors.secondaryText} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  tabIconActive: {
    backgroundColor: Colors.text,
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: Platform.OS === 'ios' ? 0 : 20,
    transform: [{ translateY: -5 }],
  },
});
