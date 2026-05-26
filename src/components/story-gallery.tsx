import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { GalleryView } from '@/lib/project-gallery';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type GalleryImage = GalleryView & { id: string };

const FINISHED_POOL = [
  require('@/assets/images/imagine/scandinavian.jpg'),
  require('@/assets/images/imagine/organic.jpg'),
  require('@/assets/images/imagine/japandi.jpg'),
  require('@/assets/images/imagine/coastal.jpg'),
  require('@/assets/images/imagine/moody.jpg'),
] as const;

const TILE_W = 220;
const TILE_H = 140;

function GalleryTile({
  img,
  index,
  onPress,
}: {
  img: GalleryImage;
  index: number;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const scale = img.focus?.scale ?? 1;
  const offsetX = img.focus?.offsetX ?? 0;
  const offsetY = img.focus?.offsetY ?? 0;

  return (
    <Pressable
      accessibilityRole="imagebutton"
      accessibilityLabel={`Photo ${index + 1}`}
      onPress={onPress}
      style={({ pressed }) => [styles.tilePressable, pressed && styles.pressed]}>
      <View
        style={[
          styles.tile,
          { borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement },
        ]}>
        <View style={styles.cropFrame}>
          <Image
            source={img.source}
            style={{
              width: TILE_W * scale,
              height: TILE_H * scale,
              transform: [{ translateX: -offsetX }, { translateY: -offsetY }],
            }}
            contentFit="cover"
          />
        </View>
      </View>
    </Pressable>
  );
}

export function StoryGallery({
  storyId,
  views,
  count = 3,
  onPressImage,
}: {
  storyId: string;
  /** Finished-kitchen views (same source, different crops) */
  views?: GalleryView[];
  count?: number;
  onPressImage?: (imageId: string) => void;
}) {
  const galleryImages: GalleryImage[] = useMemo(() => {
    if (views?.length) {
      return views.slice(0, count).map((v, i) => ({
        ...v,
        id: `${storyId}-img-${i}`,
      }));
    }
    const seed = Array.from(storyId).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array.from({ length: count }).map((_, i) => {
      const idx = (seed + i) % FINISHED_POOL.length;
      return {
        id: `${storyId}-${i}`,
        source: FINISHED_POOL[idx],
        focus: { scale: 1 + i * 0.12, offsetX: i * 18, offsetY: i * 10 },
      };
    });
  }, [count, views, storyId]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}>
      {galleryImages.map((img, index) => (
        <GalleryTile
          key={img.id}
          img={img}
          index={index}
          onPress={() => onPressImage?.(img.id)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginTop: Spacing.two },
  row: { gap: Spacing.two, paddingRight: Spacing.one },
  tilePressable: { borderRadius: Spacing.four },
  pressed: { opacity: 0.85 },
  tile: {
    width: TILE_W,
    height: TILE_H,
    borderRadius: Spacing.four,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cropFrame: {
    width: TILE_W,
    height: TILE_H,
    overflow: 'hidden',
  },
});
