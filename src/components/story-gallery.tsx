import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type GalleryImage = { id: string; source: number; label?: string };

// Starter-friendly placeholder assets. Replace with real project photos later.
const ASSET_POOL = [
  require('@/assets/images/logo-glow.png'),
  require('@/assets/images/react-logo.png'),
  require('@/assets/images/expo-logo.png'),
  require('@/assets/images/tutorial-web.png'),
] as const;

export function StoryGallery({
  storyId,
  count = 3,
  onPressImage,
}: {
  storyId: string;
  count?: number;
  onPressImage?: (imageId: string) => void;
}) {
  const theme = useTheme();

  const images: GalleryImage[] = useMemo(() => {
    // Simple deterministic selection based on storyId.
    const seed = Array.from(storyId).reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array.from({ length: count }).map((_, i) => {
      const idx = (seed + i) % ASSET_POOL.length;
      return { id: `${storyId}-${i}`, source: ASSET_POOL[idx], label: `Photo ${i + 1}` };
    });
  }, [count, storyId]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}>
      {images.map((img) => (
        <Pressable
          key={img.id}
          accessibilityRole="imagebutton"
          accessibilityLabel={img.label}
          onPress={() => onPressImage?.(img.id)}
          style={({ pressed }) => [styles.tilePressable, pressed && styles.pressed]}>
          <View
            style={[
              styles.tile,
              { borderColor: theme.backgroundElement, backgroundColor: theme.background },
            ]}>
            <Image source={img.source} style={styles.image} contentFit="cover" />
          </View>
        </Pressable>
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
    width: 220,
    height: 140,
    borderRadius: Spacing.four,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
});

