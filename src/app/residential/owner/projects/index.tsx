import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useProjects } from '@/lib/projectStore';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function OwnerProjectsScreen() {
  const { projects } = useProjects();

  return (
    <ThemedView style={styles.page}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Projects</ThemedText>
          <ThemedText themeColor="textSecondary">Project Owner</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Residential</ThemedText>

          {projects.map((project) => {
            const pct =
              project.totalPoints === 0
                ? 0
                : Math.round((project.completedPoints / project.totalPoints) * 100);
            const isSample = project.id === 'sample-90';
            return (
              <Pressable
                key={project.id}
                accessibilityRole="button"
                onPress={() => router.push(`/residential/owner/projects/${project.id}`)}
                style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
                <ThemedView type="backgroundElement" style={styles.card}>
                  <ThemedText type="smallBold">{project.name}</ThemedText>
                  <ThemedText themeColor="textSecondary">
                    {pct}% complete · {project.completedPoints}/{project.totalPoints} pts
                    {isSample ? ' · sample' : ''}
                  </ThemedText>
                  {project.vision ? (
                    <ThemedText type="small" themeColor="textSecondary">
                      {project.vision} · {project.spaceType}
                    </ThemedText>
                  ) : null}
                </ThemedView>
              </Pressable>
            );
          })}

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/residential/owner/projects/new')}
            style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">＋ New project</ThemedText>
              <ThemedText themeColor="textSecondary">
                Imagine your space → choose a vision → start the plan
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
