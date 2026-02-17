import { useQuery } from '@tanstack/react-query';
import { storageApi } from '../api';
import { supabase } from './supabase';

const fetchImageSignedUrl = async (imageKey: string | null | undefined) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('No session');
  const token = session.access_token;
  if (!token) throw new Error('No token');
  if (imageKey === '' || imageKey === null || imageKey === undefined) {
    return null;
  }
  return storageApi.getSignedUrl(imageKey, token);
};

export const useSecureImage = (imagePath: string | null | undefined) => {
  return useQuery<string | null>({
    queryKey: ['secure-image', imagePath],
    queryFn: () => fetchImageSignedUrl(imagePath),
    staleTime: 60 * 60 * 24 * 7,
    gcTime: 60 * 60 * 24 * 7,
    enabled: !!imagePath,
  });
};
