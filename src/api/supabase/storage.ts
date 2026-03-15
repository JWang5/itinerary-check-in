import { IMAGE_BUCKET_PATH, IMAGE_WORKER_BASE_URL } from '@/src/constants/variables';

export type SignedImagePayload = {
  expiresAt: string;
  url: string;
};

function normalizeStorageKey(key: string) {
  return key.startsWith(IMAGE_BUCKET_PATH) ? key : `${IMAGE_BUCKET_PATH}${key}`;
}

function denormalizeStorageKey(key: string) {
  return key.startsWith(IMAGE_BUCKET_PATH) ? key.slice(IMAGE_BUCKET_PATH.length) : key;
}

/**
 * Handles signed URLs for private bucket images via the worker.
 */
export const storageApi = {
  /**
   * Request signed URLs for a batch of storage keys.
   * @param keys - Storage keys without bucket prefix
   * @param supabaseAccessToken - Supabase access token
   */
  async getSignedUrls(
    keys: string[],
    supabaseAccessToken: string,
  ): Promise<Record<string, SignedImagePayload>> {
    const response = await fetch(IMAGE_WORKER_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keys: keys.map(normalizeStorageKey),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch signed URLs (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
      urls: Record<string, SignedImagePayload>;
    };

    return Object.fromEntries(
      Object.entries(data.urls).map(([key, value]) => [denormalizeStorageKey(key), value]),
    );
  },
};
