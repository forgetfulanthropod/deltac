import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BurndownPlayback } from '@/components/burndown-playback';
import { StoryGallery } from '@/components/story-gallery';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TaskRow } from '@/components/ui/task-row';
import { getStoryGalleryViews } from '@/lib/project-gallery';
import { useProject } from '@/lib/projectStore';
import { getBurndownEvents } from '@/lib/schedule';
import { useWorkerProfile } from '@/lib/workerStore';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function generateStaticParams() {
  return [{ projectId: 'sample-90' }];
}

export default function WorkerProjectDetailScreen() {
  const navigation = useNavigation();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const theme = useTheme();
  const { project, toggleTaskDone } = useProject(projectId);
  const { profile: workerProfile } = useWorkerProfile();
  const workerName = workerProfile?.name ?? 'Field Pro';

  const [playKey, setPlayKey] = useState(0);

  useEffect(() => {
    navigation.setOptions({ title: project?.name ?? 'Project' });
  }, [navigation, project?.name]);

  const percent = useMemo(() => {
    if (!project || project.totalPoints === 0) return 0;
    return Math.round((project.completedPoints / project.totalPoints) * 100);
  }, [project]);

  const burndownEvents = useMemo(
    () => (project ? getBurndownEvents(project) : undefined),
    [project]
  );

  const workerStories = useMemo(() => {
    if (!project) return [];
    return project.stories
      .map((story) => ({
        ...story,
        tasks: story.tasks.filter((t) => t.assignee === workerName),
      }))
      .filter((s) => s.tasks.length > 0);
  }, [project, workerName]);

  if (!project) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle">Project not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      contentInset={{ bottom: BottomTabInset }}
      contentContainerStyle={[styles.scrollBody, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>
            {project.name}
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.heroMeta}>
            {percent}% complete · your open tasks below
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderText}>
              <ThemedText type="subtitle">Progress</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Project burndown (read-only)
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
          <BurndownPlayback
            key={playKey}
            project={project}
            events={burndownEvents}
            percentComplete={percent}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Your tasks</ThemedText>

          {workerStories.length === 0 ? (
            <ThemedText themeColor="textSecondary">No open tasks — great work.</ThemedText>
          ) : (
            workerStories.map((story) => (
              <ThemedView key={story.id} type="backgroundElement" style={styles.card}>
                <ThemedText type="smallBold">{story.title}</ThemedText>
                <StoryGallery storyId={story.id} views={getStoryGalleryViews(project, story.id)} />
                <View style={[styles.taskList, { borderTopColor: theme.backgroundSelected }]}>
                  {story.tasks.map((task, idx) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      isLast={idx === story.tasks.length - 1}
                      subtitle={`${task.points} pts · assigned to you`}
                      onToggle={() => toggleTaskDone(task.id)}
                    />
                  ))}
                </View>
              </ThemedView>
            ))
          )}
        </ThemedView>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollBody: { flexGrow: 1, flexDirection: 'row', justifyContent: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.four,
  },
  hero: { gap: Spacing.one, paddingTop: Spacing.two },
  heroTitle: { fontSize: 40, lineHeight: 44 },
  heroMeta: { marginTop: Spacing.half },
  section: { gap: Spacing.two },
  card: { padding: Spacing.four, borderRadius: Spacing.four, gap: Spacing.two },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardHeaderText: { flex: 1, gap: Spacing.half, paddingRight: Spacing.two },
  pillPressable: { borderRadius: Spacing.five },
  pill: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Spacing.five },
  pressed: { opacity: 0.75 },
  taskList: { marginTop: Spacing.two, borderTopWidth: 1 },
  taskRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  taskRowLast: { borderBottomWidth: 0 },
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
