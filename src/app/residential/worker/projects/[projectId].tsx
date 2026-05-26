import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BurndownPlayback } from '@/components/burndown-playback';
import { StoryGallery } from '@/components/story-gallery';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Task = { id: string; title: string; points: number; done: boolean };
type Story = { id: string; title: string; tasks: Task[] };

export function generateStaticParams() {
  return [{ projectId: 'sample-90' }];
}

const SAMPLE_STORIES: Story[] = [
  {
    id: 'story-rough',
    title: 'Rough work',
    tasks: [
      { id: 'wt-1', title: 'Confirm arrival window', points: 1, done: true },
      { id: 'wt-2', title: 'Install under-cabinet circuit', points: 3, done: false },
    ],
  },
  {
    id: 'story-finishes',
    title: 'Finishes',
    tasks: [
      { id: 'wt-3', title: 'Backsplash tile (assist)', points: 5, done: false },
      { id: 'wt-4', title: 'Final walkthrough prep', points: 2, done: false },
    ],
  },
];

export default function WorkerProjectDetailScreen() {
  const navigation = useNavigation();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const theme = useTheme();

  useEffect(() => {
    navigation.setOptions({ title: 'Project' });
  }, [navigation]);

  const [playKey, setPlayKey] = useState(0);
  const [doneById, setDoneById] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const s of SAMPLE_STORIES) for (const t of s.tasks) initial[t.id] = t.done;
    return initial;
  });

  const { totalPoints, donePoints } = useMemo(() => {
    const all = SAMPLE_STORIES.flatMap((s) => s.tasks);
    const total = all.reduce((sum, t) => sum + t.points, 0);
    const done = all.reduce((sum, t) => sum + (doneById[t.id] ? t.points : 0), 0);
    return { totalPoints: total, donePoints: done };
  }, [doneById]);

  const percent = totalPoints === 0 ? 0 : Math.round((donePoints / totalPoints) * 100);

  return (
    <ScrollView
      contentInset={{ bottom: BottomTabInset }}
      contentContainerStyle={[styles.scrollBody, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>
            Sample Project
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.heroMeta}>
            {percent}% complete · {donePoints}/{totalPoints} points
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Worker · {projectId}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderText}>
              <ThemedText type="subtitle">Progress</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Playback shows completion order.
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setPlayKey((k) => k + 1)}
              style={({ pressed }) => [styles.pillPressable, pressed && styles.pressed]}>
              <ThemedView style={styles.pill}>
                <ThemedText type="smallBold">Replay</ThemedText>
              </ThemedView>
            </Pressable>
          </View>

          <BurndownPlayback key={playKey} percentComplete={percent} height={140} />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Your tasks</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Gallery per story plus checklist.
          </ThemedText>

          {SAMPLE_STORIES.map((story) => (
            <ThemedView key={story.id} type="backgroundElement" style={styles.card}>
              <View style={styles.storyHeader}>
                <ThemedText type="smallBold">{story.title}</ThemedText>
              </View>

              <StoryGallery storyId={story.id} />

              <View style={[styles.taskList, { borderTopColor: theme.backgroundSelected }]}>
                {story.tasks.map((task) => {
                  const done = !!doneById[task.id];
                  return (
                    <Pressable
                      key={task.id}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: done }}
                      onPress={() => setDoneById((prev) => ({ ...prev, [task.id]: !done }))}
                      style={({ pressed }) => [
                        styles.taskRow,
                        { borderBottomColor: theme.backgroundSelected },
                        pressed && styles.pressed,
                      ]}>
                      <View style={[styles.checkDot, { borderColor: theme.backgroundSelected }]}>
                        <ThemedText style={styles.checkText}>{done ? '✓' : ''}</ThemedText>
                      </View>
                      <View style={styles.taskText}>
                        <ThemedText>{task.title}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {task.points} pts · assigned to you (stub)
                        </ThemedText>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ThemedView>
          ))}
        </ThemedView>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollBody: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.four,
  },
  hero: { gap: Spacing.one, paddingTop: Spacing.two, paddingBottom: Spacing.one },
  heroTitle: { fontSize: 40, lineHeight: 44 },
  heroMeta: { marginTop: Spacing.half },
  section: { gap: Spacing.two },
  card: { padding: Spacing.four, borderRadius: Spacing.four, gap: Spacing.two },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardHeaderText: { flex: 1, gap: Spacing.half, paddingRight: Spacing.two },
  pillPressable: { borderRadius: Spacing.five },
  pill: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Spacing.five },
  pressed: { opacity: 0.75 },
  storyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskList: { marginTop: Spacing.two, borderTopWidth: 1 },
  taskRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  checkDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontSize: 14, lineHeight: 16 },
  taskText: { flex: 1, gap: 2 },
});

