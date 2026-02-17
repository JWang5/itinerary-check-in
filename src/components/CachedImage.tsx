import { Image } from 'expo-image';
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
  const { data, isLoading } = useSecureImage(imageKey);

  if (isLoading) {
    return <Skeleton width={style.width} height={style.height} borderRadius={style.borderRadius} />;
  }

  return (
    <Image
      source={data || DEFAULT_LOCATION_IMAGE}
      style={style}
      cachePolicy="disk"
      contentFit="cover"
      transition={200}
    />
  );
}
