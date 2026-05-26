import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const SAMPLE_PROJECT_ID = 'sample-90';

export default function OwnerProjectsScreen() {
  return (
    <ThemedView style={styles.page}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Projects</ThemedText>
          <ThemedText themeColor="textSecondary">Project Owner</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Residential</ThemedText>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/residential/owner/projects/${SAMPLE_PROJECT_ID}`)}
            style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">Sample Project</ThemedText>
              <ThemedText themeColor="textSecondary">90% complete · tap to play progress</ThemedText>
            </ThemedView>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/residential/owner/projects/new')}
            style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">＋ New project</ThemedText>
              <ThemedText themeColor="textSecondary">
                Capture the space → generate remodel options → select scope
              </ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>

        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          Scoping · Sourcing · Scheduling
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.four,
  },
  header: { paddingTop: Spacing.four, gap: Spacing.one },
  section: { gap: Spacing.three },
  pressable: { borderRadius: Spacing.four },
  pressed: { opacity: 0.75 },
  card: { padding: Spacing.four, borderRadius: Spacing.four, gap: Spacing.one },
  footer: { marginTop: 'auto', textAlign: 'center' },
});

