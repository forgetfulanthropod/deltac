import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BurndownPlayback } from '@/components/burndown-playback';
import { ScopingEditor } from '@/components/scoping-editor';
import { SchedulingEditor } from '@/components/scheduling-editor';
import { SourcingPanel } from '@/components/sourcing-panel';
import { StoryGallery } from '@/components/story-gallery';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SegmentedControl } from '@/components/ui/segmented-control';
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

export default function OwnerProjectDetailScreen() {
  const navigation = useNavigation();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const theme = useTheme();
  const {
    project,
    toggleTaskDone,
    connectVendor,
    acceptAllOrders,
    orderMaterialsForStory,
    addStory,
    updateStoryTitle,
    deleteStory,
    addTask,
    deleteTask,
    updateTask,
  } = useProject(projectId);
  const { profile: workerProfile } = useWorkerProfile();

  const [playKey, setPlayKey] = useState(0);
  const [section, setSection] = useState<'Overview' | 'Scoping' | 'Sourcing' | 'Scheduling'>(
    'Overview'
  );
  const [orderMsg, setOrderMsg] = useState('');

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

  const workerNames = workerProfile ? [workerProfile.name] : ['Field Pro'];

  if (!project) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="subtitle">Project not found</ThemedText>
        <ThemedText themeColor="textSecondary">ID: {projectId}</ThemedText>
      </ThemedView>
    );
  }

  function placeOrder() {
    acceptAllOrders();
    setOrderMsg('Orders placed — materials marked as ordered.');
    setTimeout(() => setOrderMsg(''), 4200);
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
            {percent}% complete · {project.completedPoints}/{project.totalPoints} points
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {project.vision ? `${project.vision} · ` : ''}
            {project.spaceType} · {project.targetTimeline}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderText}>
              <ThemedText type="subtitle">Progress</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Burndown reflects completed tasks in order.
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
          <ThemedText type="subtitle">Stories</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Gallery + tasks — check off work to update the burndown.
          </ThemedText>

          {project.stories.map((story) => {
            const storyTotal = story.tasks.reduce((s, t) => s + t.points, 0);
            const storyDone = story.tasks
              .filter((t) => t.status === 'done')
              .reduce((s, t) => s + t.points, 0);
            const storyPct = storyTotal === 0 ? 0 : Math.round((storyDone / storyTotal) * 100);
            const galleryViews = getStoryGalleryViews(project, story.id);

            return (
              <ThemedView key={story.id} type="backgroundElement" style={styles.card}>
                <View style={styles.storyHeader}>
                  <View style={styles.storyTitleCol}>
                    <ThemedText type="smallBold">{story.title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {storyPct}% · {storyDone}/{storyTotal} pts · {story.status}
                    </ThemedText>
                  </View>
                </View>

                <StoryGallery storyId={story.id} views={galleryViews} />

                <View style={[styles.taskList, { borderTopColor: theme.backgroundSelected }]}>
                  {story.tasks.map((task, idx) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      isLast={idx === story.tasks.length - 1}
                      subtitle={`${task.points} pts${task.assignee ? ` · ${task.assignee}` : ''}${task.status === 'in-progress' ? ' · in progress' : ''}`}
                      onToggle={() => toggleTaskDone(task.id)}
                    />
                  ))}
                </View>
              </ThemedView>
            );
          })}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Responsibilities</ThemedText>
          <SegmentedControl
            options={['Overview', 'Scoping', 'Sourcing', 'Scheduling']}
            value={section}
            onChange={setSection}
          />

          {section === 'Overview' && (
            <ThemedText type="small" themeColor="textSecondary">
              Stories above track daily progress. Use Scoping, Sourcing, and Scheduling for the
              three core responsibilities.
            </ThemedText>
          )}

          {section === 'Scoping' && (
            <ScopingEditor
              project={project}
              onAddStory={(title) => addStory(title)}
              onRenameStory={(id, title) => updateStoryTitle(id, title)}
              onDeleteStory={(id) => deleteStory(id)}
              onAddTask={(sid, title, pts, photoUri) => addTask(sid, title, pts, photoUri)}
              onDeleteTask={(sid, tid) => deleteTask(sid, tid)}
            />
          )}

          {section === 'Sourcing' && (
            <SourcingPanel
              project={project}
              onConnectVendor={(v) => connectVendor(v)}
              onAcceptAll={placeOrder}
              onOrderStory={(sid) => orderMaterialsForStory(sid)}
              orderMessage={orderMsg}
            />
          )}

          {section === 'Scheduling' && (
            <SchedulingEditor
              project={project}
              workerNames={workerNames}
              onUpdateTask={(taskId, patch) => updateTask(taskId, patch)}
            />
          )}
        </ThemedView>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollBody: { flexGrow: 1, flexDirection: 'row', justifyContent: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
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
  storyTitleCol: { flex: 1, gap: 2 },
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
  segRow: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap', marginBottom: Spacing.two },
  segBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  segTextActive: { color: '#fff' },
  optionRow: { paddingVertical: Spacing.one },
  matRow: { paddingVertical: Spacing.one, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  row: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one, flexWrap: 'wrap' },
  connectBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  connected: { backgroundColor: 'rgba(143,162,142,0.35)' },
  cartBox: { padding: Spacing.three, borderRadius: Spacing.three, backgroundColor: 'rgba(0,0,0,0.03)' },
  acceptBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#8D5E3A',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  pathBox: {
    marginTop: Spacing.one,
    padding: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: Spacing.two,
    gap: 4,
  },
});
