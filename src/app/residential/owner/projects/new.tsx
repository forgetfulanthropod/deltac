import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { createProjectFromVision } from '@/lib/projectStore';
import {
  getStoriesForVisionAndScope,
  SCOPE_OPTIONS,
  type ScopeOptionId,
} from '@/lib/visionTemplates';
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

const BUDGET_BANDS = ['$15–30k', '$30–60k', '$60k+'] as const;
const SPACE_TYPES = ['Kitchen', 'Bath', 'Whole home'] as const;

export default function ImagineScreen() {
  const [projectName, setProjectName] = useState('');
  const [address, setAddress] = useState('');
  const [spaceType, setSpaceType] = useState<(typeof SPACE_TYPES)[number]>('Kitchen');
  const [targetTimeline, setTargetTimeline] = useState('8 weeks');
  const [budgetBand, setBudgetBand] = useState<(typeof BUDGET_BANDS)[number]>('$30–60k');
  const [scopeOption, setScopeOption] = useState<ScopeOptionId>('mid');
  const [beforeUri, setBeforeUri] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVisions, setShowVisions] = useState(false);
  const [chosenVision, setChosenVision] = useState<(typeof VISIONS)[0] | null>(null);

  const currentBefore = beforeUri || Image.resolveAssetSource(require('@/assets/images/imagine/before.jpg')).uri;

  const pickPhoto = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => setBeforeUri(ev.target?.result as string);
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setBeforeUri(result.assets[0].uri);
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
    if (!chosenVision) return;
    const stories = getStoriesForVisionAndScope(chosenVision.id, scopeOption);
    const project = createProjectFromVision({
      name: projectName.trim() || `${chosenVision.title} Remodel`,
      address: address.trim() || undefined,
      spaceType,
      targetTimeline,
      budgetBand,
      notes: prompt.trim() || undefined,
      vision: chosenVision.title,
      stories,
    });
    router.push(`/residential/owner/projects/${project.id}`);
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

          <ThemedView type="backgroundElement" style={styles.basicsCard}>
            <ThemedText type="subtitle">Project basics</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Name, location, and constraints feed scoping options.
            </ThemedText>
            <TextInput
              value={projectName}
              onChangeText={setProjectName}
              placeholder="Kitchen refresh"
              style={styles.basicsInput}
            />
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Address or neighborhood"
              style={styles.basicsInput}
            />
            <View style={styles.chipRow}>
              {SPACE_TYPES.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setSpaceType(s)}
                  style={[styles.chip, spaceType === s && styles.chipActive]}>
                  <ThemedText type="small">{s}</ThemedText>
                </Pressable>
              ))}
            </View>
            <TextInput
              value={targetTimeline}
              onChangeText={setTargetTimeline}
              placeholder="Target timeline (e.g. 8 weeks)"
              style={styles.basicsInput}
            />
            <View style={styles.chipRow}>
              {BUDGET_BANDS.map((b) => (
                <Pressable
                  key={b}
                  onPress={() => setBudgetBand(b)}
                  style={[styles.chip, budgetBand === b && styles.chipActive]}>
                  <ThemedText type="small">{b}</ThemedText>
                </Pressable>
              ))}
            </View>
          </ThemedView>

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

              <ThemedText type="subtitle" style={{ marginTop: Spacing.three }}>
                Compare scope options
              </ThemedText>
              {SCOPE_OPTIONS.map((opt) => {
                const active = scopeOption === opt.id;
                const pts = getStoriesForVisionAndScope(chosenVision.id, opt.id).reduce(
                  (sum, s) => sum + s.tasks.reduce((t, x) => t + x.points, 0),
                  0
                );
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setScopeOption(opt.id)}
                    style={[styles.scopeRow, active && styles.scopeRowActive]}>
                    <ThemedText type="smallBold">
                      {opt.label} — {pts} pts
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {opt.note}
                    </ThemedText>
                  </Pressable>
                );
              })}

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
  basicsCard: {
    padding: Spacing.four,
    borderRadius: Radius.lg,
    gap: Spacing.two,
  },
  basicsInput: {
    backgroundColor: '#FFFBF6',
    borderRadius: Radius.md,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: '#D9D0C4',
  },
  chipActive: {
    backgroundColor: '#8D5E3A',
  },
  scopeRow: {
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#D9D0C4',
    marginTop: Spacing.two,
    gap: 4,
  },
  scopeRowActive: {
    borderColor: '#8D5E3A',
    backgroundColor: '#F0EBE3',
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

