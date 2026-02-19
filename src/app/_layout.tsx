import { Colors } from '@/src/constants/theme/theme';
import '@/src/i18n'; // Initialize i18n
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAssets } from 'expo-asset';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../provider/authProvider';
import { useUserCheckInStore } from '../store/useUserCheckInStore';
import { useUserStickyStore } from '../store/useUserStickyStore';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav({
  loaded,
  error,
  assetsLoaded,
}: {
  loaded: boolean;
  error: any;
  assetsLoaded: boolean;
}) {
  const { session, initialized } = useAuth();
  const router = useRouter();

  const { fetchUserCheckedInLocationIds } = useUserCheckInStore();
  const { fetchUserStickies } = useUserStickyStore();

  const segments = useSegments();

  useEffect(() => {
    if (!initialized) return;

    // Hide splash screen only when everything (fonts, auth, and basic assets) is ready
    if ((loaded || error) && assetsLoaded) {
      SplashScreen.hideAsync();
    }

    const inApp =
      segments[0] === '(tabs)' ||
      segments[0] === 'city' ||
      segments[0] === 'location' ||
      segments[0] === 'itinerary';

    if (!session) {
      // Allow access to index (landing) and any potential public routes
      // If a deep link comes in with a valid session, the AuthProvider/supabase will eventually update 'session'
      // and the effect below (or in index.tsx) will handle the specific redirect.

      // Only redirect to landing if we are in a protected route
      if (inApp) {
        router.replace('/');
      }
    } else if (session && !inApp) {
      // Initialize global state for the user
      fetchUserCheckedInLocationIds(session.user.id);
      fetchUserStickies(session.user.id);
    }
  }, [
    initialized,
    session,
    router,
    fetchUserCheckedInLocationIds,
    fetchUserStickies,
    segments,
    loaded,
    error,
    assetsLoaded,
  ]);

  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Back',
        headerTintColor: Colors.primary,
        headerStyle: { backgroundColor: Colors.background },
        contentStyle: { backgroundColor: Colors.background },
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1a2e1a' },
        }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="city/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="location/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="itinerary/[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="itinerary/create"
        options={{ presentation: 'modal', headerShown: false }}
      />
      <Stack.Screen name="auth/reset-password" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    PingFangSaTuoTi: require('@/assets/fonts/PingFangSaTuoTi-2.ttf'),
    MaoKen: require('@/assets/fonts/maoken.ttf'),
  });

  const [assets, assetsError] = useAssets([require('@/assets/images/landing.png')]);
  const [isUpdateChecking, setIsUpdateChecking] = useState(true);

  useEffect(() => {
    async function onFetchUpdateAsync() {
      try {
        if (__DEV__) {
          setIsUpdateChecking(false);
          return;
        }

        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (error) {
        // If there's an error checking for updates, we still want to let the user in
        console.warn('OTA Update Error:', error);
      } finally {
        setIsUpdateChecking(false);
      }
    }

    onFetchUpdateAsync();
  }, []);

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
    if (assetsError) {
      console.error('Asset loading error:', assetsError);
    }
  }, [error, assetsError]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <RootLayoutNav
            loaded={loaded && !isUpdateChecking}
            error={error}
            assetsLoaded={!!assets}
          />
          <StatusBar style="dark" />
        </GestureHandlerRootView>
      </AuthProvider>
    </QueryClientProvider>
  );
}
