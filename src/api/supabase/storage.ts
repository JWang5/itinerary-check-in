import { IMAGE_BUCKET_PATH, IMAGE_WORKER_BASE_URL } from '@/src/constants/variables';

/**
 * Storage operations for Supabase Storage
 * Handles signed URLs for private buckets
 */
export const storageApi = {
  /**
   * Generate signed URL for private storage file using worker
   * @param key - Storage key
   * @param supabaseAccessToken - Supabase access token
   */
  async getSignedUrl(key: string, supabaseAccessToken: string): Promise<string> {
    const response = await fetch(`${IMAGE_WORKER_BASE_URL}?key=${IMAGE_BUCKET_PATH}${key}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${supabaseAccessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch signed URL');
    }
    const data = await response.json();
    return data.url;
  },
};
