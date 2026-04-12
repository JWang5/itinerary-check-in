import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { storageApi, type SignedImagePayload } from '../api';
import { useAuth } from '../provider/authProvider';

const IMAGE_CACHE_STORAGE_KEY = 'secure-image-cache:v1';
const REFRESH_BUFFER_MS = 1000 * 60 * 60 * 12;

type CachedSignedImage = SignedImagePayload;

let memoryCache: Record<string, CachedSignedImage> | null = null;
let loadPromise: Promise<Record<string, CachedSignedImage>> | null = null;
let flushPromise: Promise<void> | null = null;
let pendingFlush = false;
const pending = new Map<
  string,
  {
    reject: (error: Error) => void;
    resolve: (value: string | null) => void;
  }[]
>();
let batchTimer: ReturnType<typeof setTimeout> | null = null;
let batchToken: string | null = null;

function isUsable(entry: CachedSignedImage | undefined, now = Date.now()) {
  if (!entry) return false;
  return new Date(entry.expiresAt).getTime() - REFRESH_BUFFER_MS > now;
}

async function ensureCacheLoaded() {
  if (memoryCache) {
    return memoryCache;
  }

  if (!loadPromise) {
    loadPromise = AsyncStorage.getItem(IMAGE_CACHE_STORAGE_KEY)
      .then((value) => {
        memoryCache = value ? (JSON.parse(value) as Record<string, CachedSignedImage>) : {};
        return memoryCache;
      })
      .catch(() => {
        memoryCache = {};
        return memoryCache;
      })
      .finally(() => {
        loadPromise = null;
      });
  }

  return loadPromise;
}

function persistCache() {
  if (!memoryCache) {
    return;
  }

  if (flushPromise) {
    pendingFlush = true;
    return;
  }

  flushPromise = AsyncStorage.setItem(IMAGE_CACHE_STORAGE_KEY, JSON.stringify(memoryCache)).finally(
    () => {
      flushPromise = null;
      if (pendingFlush) {
        pendingFlush = false;
        persistCache();
      }
    },
  );
}

function removeCachedEntry(imagePath: string, url?: string | null) {
  if (!memoryCache) {
    return;
  }

  const cached = memoryCache[imagePath];
  if (!cached) {
    return;
  }

  // Only evict when the failing URL matches the cached one, so we do not
  // accidentally remove a newer URL that was fetched while the image was loading.
  if (url && cached.url !== url) {
    console.log('[storageCache] Skip cache eviction: cached URL changed', imagePath);
    return;
  }

  console.log('[storageCache] Evicting cached signed URL', imagePath);
  delete memoryCache[imagePath];
  persistCache();
}

async function flushBatch() {
  batchTimer = null;

  const keys = [...pending.keys()];
  if (!keys.length || !batchToken) {
    return;
  }

  try {
    await ensureCacheLoaded();

    const urls = await storageApi.getSignedUrls(keys, batchToken);
    const now = Date.now();

    for (const key of keys) {
      const listeners = pending.get(key) || [];
      pending.delete(key);

      const entry = urls[key];
      if (entry && isUsable(entry, now)) {
        memoryCache![key] = entry;
        listeners.forEach(({ resolve }) => resolve(entry.url));
      } else {
        listeners.forEach(({ resolve }) => resolve(null));
      }
    }

    persistCache();
  } catch (error) {
    for (const key of keys) {
      const listeners = pending.get(key) || [];
      pending.delete(key);
      listeners.forEach(({ reject }) => reject(error as Error));
    }
  } finally {
    batchToken = null;
  }
}

function enqueueSignedUrlFetch(key: string, token: string) {
  return new Promise<string | null>((resolve, reject) => {
    const listeners = pending.get(key) || [];
    listeners.push({ resolve, reject });
    pending.set(key, listeners);

    if (!batchToken) {
      batchToken = token;
    }

    if (!batchTimer) {
      batchTimer = setTimeout(() => {
        void flushBatch();
      }, 10);
    }
  });
}

export const useSecureImage = (imagePath: string | null | undefined) => {
  const { session, initialized } = useAuth();
  const [data, setData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function resolveImage() {
      if (!imagePath) {
        console.log('[storageCache] Skipping image load: empty imagePath');
        setData(null);
        setIsLoading(false);
        return;
      }

      // Demo mode: imagePath is already a full public URL — return it directly
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        if (!cancelled) {
          setData(imagePath);
          setIsLoading(false);
        }
        return;
      }

      if (!session?.access_token) {
        console.log('[storageCache] Skipping image load: missing session token', {
          imagePath,
          initialized,
          hasSession: !!session,
        });
        setData(null);
        setIsLoading(!initialized);
        return;
      }

      setIsLoading(true);

      const cache = await ensureCacheLoaded();
      const shouldBypassCache = refreshKey > 0;
      const cached = shouldBypassCache ? undefined : cache[imagePath];
      if (cached && isUsable(cached)) {
        console.log('[storageCache] Using cached signed URL', imagePath);
        if (!cancelled) {
          setData(cached.url);
          setIsLoading(false);
        }
        return;
      }

      try {
        console.log('[storageCache] Fetching signed URL batch entry', imagePath);
        const url = await enqueueSignedUrlFetch(imagePath, session.access_token);
        if (!cancelled) {
          setData(url);
          setIsLoading(false);
          if (shouldBypassCache) {
            setRefreshKey(0);
          }
        }
      } catch (error) {
        console.error('[storageCache] Failed to resolve image URL:', imagePath, error);
        if (!cancelled) {
          setData(null);
          setIsLoading(false);
          if (shouldBypassCache) {
            setRefreshKey(0);
          }
        }
      }
    }

    void resolveImage();

    return () => {
      cancelled = true;
    };
  }, [imagePath, initialized, refreshKey, session]);

  const refresh = (failedUrl?: string | null) => {
    if (!imagePath) {
      return;
    }

    console.log('[storageCache] Refresh requested for image', imagePath);
    removeCachedEntry(imagePath, failedUrl);
    setRefreshKey((current) => current + 1);
  };

  return { data, isLoading, refresh };
};
