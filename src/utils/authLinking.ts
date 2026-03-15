import { supabase } from '@/src/utils/supabase';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

let lastHandledUrl: string | null = null;
let isHandling = false;

const handleDeepLink = async (url: string) => {
  if (!url) return;

  if (url === lastHandledUrl || isHandling) {
    return;
  }

  isHandling = true;
  lastHandledUrl = url;
  try {
    if (
      url.includes('reset-password') ||
      url.includes('type=recovery') ||
      url.includes('confirm-signup') ||
      url.includes('type=signup') ||
      url.includes('token=') ||
      url.includes('access_token=')
    ) {
      const getParam = (name: string) => {
        const regex = new RegExp(`[?&#]${name}=([^&#]*)`);
        const match = url.match(regex);
        return match ? decodeURIComponent(match[1]) : null;
      };

      const access_token = getParam('access_token');
      const refresh_token = getParam('refresh_token');
      const token = getParam('token');
      const error = getParam('error');
      const error_description = getParam('error_description');

      if (error) {
        console.warn('[AuthLinking] Link error detected:', error);

        // Clear any half-established session
        await supabase.auth.signOut().catch(() => {});

        // Forward the error to the Reset Password screen via query params
        // because useLocalSearchParams won't see it if it's in the hash fragment.
        router.replace({
          pathname: '/auth/reset-password',
          params: { error, error_description: error_description || '' },
        });

        isHandling = false;
        return;
      }

      if ((access_token && refresh_token) || token) {
        supabase.auth.stopAutoRefresh();
        await new Promise((r) => setTimeout(r, 500));

        const sessionParams = {
          access_token: access_token || (token as string),
          refresh_token: refresh_token || (token as string),
        };

        supabase.auth
          .setSession(sessionParams)
          .then(({ error: sessErr }) => {
            if (sessErr) {
              console.error('[AuthLinking] setSession result error:', sessErr.message);
              supabase.auth.signOut().catch(() => {});
            }
            supabase.auth.startAutoRefresh();
          })
          .catch((err) => {
            console.error('[AuthLinking] setSession failure:', err.message);
            supabase.auth.startAutoRefresh();
          });
      }
    }
  } catch (err: any) {
    console.error('[AuthLinking] General error:', err.message);
  } finally {
    setTimeout(() => {
      isHandling = false;
    }, 2000);
  }
};

export const setupAuthLinking = () => {
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink(url);
  });
  const subscription = Linking.addEventListener('url', ({ url }) => {
    handleDeepLink(url);
  });
  return () => {
    subscription.remove();
  };
};
