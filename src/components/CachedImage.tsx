import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { DEFAULT_LOCATION_IMAGE } from '../constants/variables';
import { useSecureImage } from '../utils/storageCache';
import Skeleton from './skeleton';

export function CachedImage({
  imageKey,
  style,
}: {
  imageKey: string | null | undefined;
  style: any;
}) {
  const { data: source, isLoading, refresh } = useSecureImage(imageKey);
  const [hasRetried, setHasRetried] = useState(false);

  useEffect(() => {
    setHasRetried(false);
  }, [imageKey, source]);

  if (isLoading) {
    return <Skeleton width={style.width} height={style.height} borderRadius={style.borderRadius} />;
  }

  return (
    <Image
      key={`${imageKey ?? 'fallback'}:${source ?? 'default'}`}
      source={source || DEFAULT_LOCATION_IMAGE}
      recyclingKey={`${imageKey ?? 'fallback'}:${source ?? 'default'}`}
      style={style}
      cachePolicy="disk"
      contentFit="cover"
      transition={200}
      onError={() => {
        // Skip retry for direct public URLs — there is no signed URL to refresh
        const isDirect = imageKey?.startsWith('https://') || imageKey?.startsWith('http://');
        if (!source || hasRetried || isDirect) {
          return;
        }

        console.log(
          '[CachedImage] Image load failed, retrying with refreshed signed URL',
          imageKey,
        );
        setHasRetried(true);
        refresh(source);
      }}
    />
  );
}
