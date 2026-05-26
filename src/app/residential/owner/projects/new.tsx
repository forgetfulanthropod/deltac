import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Shadows, Spacing } from '@/constants/theme';

// Beautiful visions powered by real generated images
const VISIONS = [
  {
    id: 'scandinavian',
    title: 'Warm Scandinavian',
    prompt: 'Calm white oak, soft natural light, quiet luxury',
    image: require('@/assets/images/imagine/scandinavian.jpg'),
    vibe: 'Light, serene, timeless',
  },
  {
    id: 'organic',
    title: 'Modern Organic',
    prompt: 'Walnut, stone, brass and abundant life',
    image: require('@/assets/images/imagine/organic.jpg'),
    vibe: 'Grounded, rich, soulful',
  },
  {
    id: 'japandi',
    title: 'Japandi Calm',
    prompt: 'Minimal, tactile, deeply peaceful',
    image: require('@/assets/images/imagine/japandi.jpg'),
    vibe: 'Zen, crafted, quiet',
  },
  {
    id: 'coastal',
    title: 'Bright Coastal',
    prompt: 'Air, light, and the feeling of being on vacation',
    image: require('@/assets/images/imagine/coastal.jpg'),
    vibe: 'Fresh, happy, breezy',
  },
  {
    id: 'moody',
    title: 'Moody Elegant',
    prompt: 'Dark green, black marble, warm brass drama',
    image: require('@/assets/images/imagine/moody.jpg'),
    vibe: 'Intimate, luxurious, atmospheric',
  },
];

const EXAMPLE_PROMPTS = [
  'Warm Scandinavian with lots of natural light',
  'Modern organic, walnut + stone',
  'Japandi calm and minimal',
  'Bright and happy coastal',
  'Moody elegant with dark green',
];

export default function ImagineScreen() {
  const [beforeUri, setBeforeUri] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVisions, setShowVisions] = useState(false);
  const [chosenVision, setChosenVision] = useState<(typeof VISIONS)[0] | null>(null);

  const currentBefore = beforeUri || Image.resolveAssetSource(require('@/assets/images/imagine/before.jpg')).uri;

  // Web-friendly photo upload
  const pickPhoto = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => setBeforeUri(ev.target?.result as string);
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      // On native we would use expo-image-picker / camera
      alert('On mobile this would open the camera or photo library (demo uses the example photo)');
    }
  };

  const generateVisions = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // Fake beautiful AI thinking time (feels premium)
    setTimeout(() => {
      setIsGenerating(false);
      setShowVisions(true);
    }, 680);
  };

  const chooseVision = (vision: (typeof VISIONS)[0]) => {
    setChosenVision(vision);
    // After a short moment, offer to start the project
  };

  const startProject = () => {
    // For now we take them to the rich sample project experience
    // (in a fuller version this would create a real project with the chosen vision pre-attached)
    router.push('/residential/owner/projects/sample-90');
  };

  const reset = () => {
    setBeforeUri(null);
    setPrompt('');
    setShowVisions(false);
    setChosenVision(null);
  };

  return (
    <ThemedView style={styles.page}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={{ gap: Spacing.four, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
          {/* Hero header - emotional & on-brand */}
          <View style={styles.hero}>
            <ThemedText type="title" style={styles.heroTitle}>
              Point the camera.{'\n'}Dream it better.
            </ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              See your space transformed in seconds. Choose the vision you love.
            </ThemedText>
          </View>

          {/* The Before photo — the star of the experience */}
          <View style={styles.beforeSection}>
            <View style={styles.photoLabel}>
              <ThemedText type="smallBold" style={{ color: '#8D5E3A' }}>BEFORE</ThemedText>
            </View>
            <Image source={{ uri: currentBefore }} style={styles.beforeImage} resizeMode="cover" />

            <Pressable onPress={pickPhoto} style={styles.changePhotoBtn}>
              <ThemedText type="smallBold">Use your own photo</ThemedText>
            </Pressable>
          </View>

          {/* The magic prompt */}
          <View style={styles.promptSection}>
            <ThemedText type="subtitle" style={{ marginBottom: Spacing.two }}>
              Now imagine…
            </ThemedText>

            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder="a warm, light-filled Scandinavian kitchen with white oak and stone…"
              placeholderTextColor="#9A9086"
              style={styles.promptInput}
              multiline
            />

            {/* Example chips — "choose from a list of options" */}
            <View style={styles.chipRow}>
              {EXAMPLE_PROMPTS.map((ex, index) => (
                <Pressable
                  key={index}
                  onPress={() => setPrompt(ex)}
                  style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]}>
                  <ThemedText type="small">{ex}</ThemedText>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={generateVisions}
              disabled={!prompt.trim() || isGenerating}
              style={[styles.generateButton, (!prompt.trim() || isGenerating) && { opacity: 0.6 }]}>
              <ThemedText type="smallBold" style={{ color: 'white', fontSize: 17 }}>
                {isGenerating ? 'Creating beautiful visions…' : 'Generate 4 beautiful visions'}
              </ThemedText>
            </Pressable>
          </View>

          {/* The gorgeous vision results */}
          {showVisions && (
            <View style={{ gap: Spacing.three }}>
              <ThemedText type="subtitle">Choose the one that feels right</ThemedText>

              {VISIONS.map((vision) => {
                const isChosen = chosenVision?.id === vision.id;
                return (
                  <Pressable
                    key={vision.id}
                    onPress={() => chooseVision(vision)}
                    style={[styles.visionCard, isChosen && styles.visionCardChosen]}>
                    <Image source={vision.image} style={styles.visionImage} resizeMode="cover" />

                    <View style={styles.visionContent}>
                      <View>
                        <ThemedText type="subtitle" style={{ fontSize: 22, lineHeight: 26 }}>
                          {vision.title}
                        </ThemedText>
                        <ThemedText style={{ marginTop: 4, color: '#8D5E3A', fontWeight: '600' }}>
                          {vision.vibe}
                        </ThemedText>
                      </View>

                      <ThemedText style={{ marginTop: Spacing.two, opacity: 0.9 }}>
                        {vision.prompt}
                      </ThemedText>

                      <Pressable
                        onPress={() => chooseVision(vision)}
                        style={[styles.chooseButton, isChosen && { backgroundColor: '#5B6B5A' }]}>
                        <ThemedText type="smallBold" style={{ color: 'white' }}>
                          {isChosen ? '✓ Vision chosen' : 'Choose this vision'}
                        </ThemedText>
                      </Pressable>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Beautiful confirmation + next step */}
          {chosenVision && (
            <View style={styles.confirmation}>
              <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
                Beautiful choice.
              </ThemedText>
              <ThemedText style={{ textAlign: 'center', marginTop: 8, opacity: 0.85 }}>
                This is the feeling we’ll design toward.
              </ThemedText>

              <Pressable onPress={startProject} style={styles.startProjectButton}>
                <ThemedText type="smallBold" style={{ color: 'white', fontSize: 17 }}>
                  Start planning this project →
                </ThemedText>
              </Pressable>

              <Pressable onPress={reset} style={{ marginTop: Spacing.three }}>
                <ThemedText style={{ textAlign: 'center', opacity: 0.6 }}>Start over with a new vision</ThemedText>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    marginHorizontal: 'auto',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  hero: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  heroTitle: {
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '600',
    color: '#2A2521',
  },
  heroSubtitle: {
    marginTop: Spacing.two,
    fontSize: 17,
    lineHeight: 24,
    color: '#665E57',
  },
  beforeSection: {
    marginTop: Spacing.one,
  },
  photoLabel: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(250,247,242,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  beforeImage: {
    width: '100%',
    height: 260,
    borderRadius: Radius.lg,
    ...Shadows.card,
  },
  changePhotoBtn: {
    marginTop: Spacing.two,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F0EBE3',
  },
  promptSection: {
    gap: Spacing.two,
  },
  promptInput: {
    minHeight: 92,
    backgroundColor: '#FFFBF6',
    borderRadius: Radius.lg,
    padding: 18,
    fontSize: 17,
    lineHeight: 24,
    borderWidth: 1,
    borderColor: '#D9D0C4',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F0EBE3',
    borderRadius: 999,
  },
  generateButton: {
    marginTop: Spacing.two,
    backgroundColor: '#8D5E3A',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  visionCard: {
    backgroundColor: '#FFFBF6',
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'transparent',
    ...Shadows.card,
  },
  visionCardChosen: {
    borderColor: '#8D5E3A',
  },
  visionImage: {
    width: '100%',
    height: 220,
  },
  visionContent: {
    padding: 20,
    gap: 6,
  },
  chooseButton: {
    marginTop: Spacing.three,
    backgroundColor: '#8D5E3A',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  confirmation: {
    backgroundColor: '#F0EBE3',
    borderRadius: Radius.xl,
    padding: 28,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  startProjectButton: {
    marginTop: 24,
    backgroundColor: '#5B6B5A',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 999,
  },
});

