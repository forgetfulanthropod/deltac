import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AddTaskForm, type AddTaskPayload } from '@/components/add-task-form';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import type { Project } from '@/lib/projectStore';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScopingEditorProps = {
  project: Project;
  onAddStory: (title: string) => void;
  onRenameStory: (storyId: string, title: string) => void;
  onDeleteStory: (storyId: string) => void;
  onAddTask: (storyId: string, title: string, points: number, photoUri?: string) => void;
  onDeleteTask: (storyId: string, taskId: string) => void;
};

export function ScopingEditor({
  project,
  onAddStory,
  onRenameStory,
  onDeleteStory,
  onAddTask,
  onDeleteTask,
}: ScopingEditorProps) {
  const theme = useTheme();
  const [newStory, setNewStory] = useState('');
  const [addingTaskStoryId, setAddingTaskStoryId] = useState<string | null>(null);

  const inputStyle = [styles.input, { borderColor: theme.backgroundSelected, color: theme.text }];

  const handleSaveTask = (storyId: string, payload: AddTaskPayload) => {
    onAddTask(storyId, payload.title, payload.points, payload.photoUri);
    setAddingTaskStoryId(null);
  };

  return (
    <Card>
      <ThemedText type="smallBold">Edit scope</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Active vision: {project.vision ?? 'Custom'} · {project.totalPoints} points total
      </ThemedText>

      {project.stories.map((story) => (
        <View key={story.id} style={styles.storyBlock}>
          <TextInput
            value={story.title}
            onChangeText={(t) => onRenameStory(story.id, t)}
            style={inputStyle}
          />
          {story.tasks.map((task) => (
            <View key={task.id} style={styles.taskLine}>
              <View style={styles.taskMain}>
                {task.photoUri ? (
                  <Image source={{ uri: task.photoUri }} style={styles.taskThumb} contentFit="cover" />
                ) : null}
                <ThemedText type="small" style={styles.taskTitle}>
                  • {task.title} ({task.points} pts)
                </ThemedText>
              </View>
              <Pressable onPress={() => onDeleteTask(story.id, task.id)}>
                <ThemedText type="small" style={{ color: theme.accent }}>
                  Remove
                </ThemedText>
              </Pressable>
            </View>
          ))}

          {addingTaskStoryId === story.id ? (
            <AddTaskForm
              onSave={(payload) => handleSaveTask(story.id, payload)}
              onCancel={() => setAddingTaskStoryId(null)}
            />
          ) : (
            <Pressable
              onPress={() => setAddingTaskStoryId(story.id)}
              style={({ pressed }) => [styles.addTaskBtn, pressed && { opacity: 0.75 }]}>
              <ThemedText type="smallBold" style={{ color: theme.accent }}>
                + Task
              </ThemedText>
            </Pressable>
          )}

          <Pressable onPress={() => onDeleteStory(story.id)}>
            <ThemedText type="small" themeColor="textSecondary">
              Delete story
            </ThemedText>
          </Pressable>
        </View>
      ))}

      <View style={styles.addStoryRow}>
        <TextInput
          placeholder="New story title"
          placeholderTextColor={theme.textSecondary}
          value={newStory}
          onChangeText={setNewStory}
          style={inputStyle}
        />
        <Pressable
          onPress={() => {
            const t = newStory.trim();
            if (!t) return;
            onAddStory(t);
            setNewStory('');
          }}>
          <ThemedText type="smallBold" style={{ color: theme.accent }}>
            + Story
          </ThemedText>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  storyBlock: { gap: Spacing.one, marginTop: Spacing.two },
  taskLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  taskMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  taskThumb: { width: 36, height: 36, borderRadius: Radius.sm },
  taskTitle: { flex: 1 },
  addTaskBtn: { alignSelf: 'flex-start', marginTop: Spacing.one },
  addStoryRow: { flexDirection: 'row', gap: Spacing.two, alignItems: 'center', marginTop: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.two,
    fontSize: 16,
  },
});
