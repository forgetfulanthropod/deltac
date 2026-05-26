import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BurndownPlayback } from '@/components/burndown-playback';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

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
    <ScrollView contentInset={{ bottom: BottomTabInset }} contentContainerStyle={styles.scrollBody}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Sample Project</ThemedText>
          <ThemedText themeColor="textSecondary">ID: {projectId}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {percent}% complete · {donePoints}/{totalPoints} points
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.block}>
          <ThemedText type="subtitle">Progress</ThemedText>
          <ThemedText themeColor="textSecondary">
            Playback shows task completion order (stub).
          </ThemedText>
          <BurndownPlayback key={playKey} percentComplete={percent} />
          <Pressable
            accessibilityRole="button"
            onPress={() => setPlayKey((k) => k + 1)}
            style={({ pressed }) => [styles.buttonPressable, pressed && styles.pressed]}>
            <ThemedView style={styles.inlineButton}>
              <ThemedText type="smallBold">Replay</ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Your tasks</ThemedText>

          {SAMPLE_STORIES.map((story) => (
            <ThemedView key={story.id} type="backgroundElement" style={styles.block}>
              <ThemedText type="smallBold">{story.title}</ThemedText>
              <ThemedView style={styles.taskList}>
                {story.tasks.map((task) => {
                  const done = !!doneById[task.id];
                  return (
                    <Pressable
                      key={task.id}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: done }}
                      onPress={() => setDoneById((prev) => ({ ...prev, [task.id]: !done }))}
                      style={({ pressed }) => [styles.taskRow, pressed && styles.pressed]}>
                      <ThemedText style={styles.checkbox}>{done ? '☑' : '☐'}</ThemedText>
                      <ThemedView style={styles.taskText}>
                        <ThemedText>{task.title}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          {task.points} pts · assigned to you (stub)
                        </ThemedText>
                      </ThemedView>
                    </Pressable>
                  );
                })}
              </ThemedView>
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
  header: { gap: Spacing.one },
  section: { gap: Spacing.three },
  block: { padding: Spacing.four, borderRadius: Spacing.four, gap: Spacing.two },
  buttonPressable: { alignSelf: 'flex-start', borderRadius: Spacing.five },
  inlineButton: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Spacing.five },
  pressed: { opacity: 0.75 },
  taskList: { marginTop: Spacing.two, gap: Spacing.two },
  taskRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start', paddingVertical: Spacing.one },
  checkbox: { width: 22, textAlign: 'center' },
  taskText: { flex: 1, gap: Spacing.half },
});

