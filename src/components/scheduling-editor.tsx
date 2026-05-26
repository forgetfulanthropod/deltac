import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import type { Project } from '@/lib/projectStore';
import { getCriticalPathSteps, getTimelineRows } from '@/lib/schedule';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function SchedulingEditor({
  project,
  onUpdateTask,
  workerNames,
}: {
  project: Project;
  onUpdateTask: (
    taskId: string,
    patch: { scheduledStart?: string; scheduledEnd?: string; assignee?: string; dependencies?: string[] }
  ) => void;
  workerNames: string[];
}) {
  const theme = useTheme();
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [assignee, setAssignee] = useState('');

  const path = getCriticalPathSteps(project);
  const timeline = getTimelineRows(project);

  const editing = editTaskId
    ? project.stories.flatMap((s) => s.tasks).find((t) => t.id === editTaskId)
    : undefined;

  return (
    <Card>
      <ThemedText type="smallBold">Schedule</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Critical path and timeline — tap a task to edit dates and assignment.
      </ThemedText>

      <ThemedText style={{ marginTop: Spacing.two }}>Critical path</ThemedText>
      {path.map((step, i) => (
        <ThemedText key={i} type="small">
          {i + 1}. {step.title} ({step.status})
        </ThemedText>
      ))}

      <ThemedText style={{ marginTop: Spacing.two }}>Timeline</ThemedText>
      {timeline.map((row, i) => {
        const task = project.stories
          .flatMap((s) => s.tasks)
          .find((t) => t.title === row.taskTitle);
        return (
          <Pressable
            key={`${row.taskTitle}-${i}`}
            onPress={() => {
              if (!task) return;
              setEditTaskId(task.id);
              setStart(task.scheduledStart ?? '');
              setEnd(task.scheduledEnd ?? '');
              setAssignee(task.assignee ?? '');
            }}
            style={styles.timelineRow}>
            <ThemedText type="small">
              {row.storyTitle}: {row.taskTitle}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {row.points} pts
              {row.assignee ? ` · ${row.assignee}` : ''}
              {row.start ? ` · ${row.start}` : ''}
            </ThemedText>
          </Pressable>
        );
      })}

      {editing && (
        <View style={[styles.editBox, { borderColor: theme.backgroundSelected }]}>
          <ThemedText type="smallBold">Edit: {editing.title}</ThemedText>
          <TextInput
            placeholder="Start (e.g. Mon 5/12)"
            placeholderTextColor={theme.textSecondary}
            value={start}
            onChangeText={setStart}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
          <TextInput
            placeholder="End"
            placeholderTextColor={theme.textSecondary}
            value={end}
            onChangeText={setEnd}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
          <TextInput
            placeholder="Assignee"
            placeholderTextColor={theme.textSecondary}
            value={assignee}
            onChangeText={setAssignee}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
          {workerNames.length > 0 && (
            <View style={styles.chips}>
              {workerNames.map((w) => (
                <Pressable key={w} onPress={() => setAssignee(w)} style={styles.chip}>
                  <ThemedText type="small">{w}</ThemedText>
                </Pressable>
              ))}
            </View>
          )}
          <Pressable
            onPress={() => {
              onUpdateTask(editing.id, {
                scheduledStart: start || undefined,
                scheduledEnd: end || undefined,
                assignee: assignee || undefined,
              });
              setEditTaskId(null);
            }}>
            <ThemedText type="smallBold" style={{ color: theme.accent }}>
              Save
            </ThemedText>
          </Pressable>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  timelineRow: { paddingVertical: Spacing.one },
  editBox: { marginTop: Spacing.two, padding: Spacing.two, borderWidth: 1, borderRadius: Spacing.three, gap: Spacing.one },
  input: { borderWidth: 1, borderRadius: Spacing.two, padding: Spacing.two, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one },
  chip: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.half },
});
