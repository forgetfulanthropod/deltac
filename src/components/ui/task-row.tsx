import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius } from '@/constants/theme';
import type { Task } from '@/lib/projectStore';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function TaskRow({
  task,
  subtitle,
  onToggle,
  isLast,
}: {
  task: Task;
  subtitle?: string;
  onToggle: () => void;
  isLast?: boolean;
}) {
  const theme = useTheme();
  const done = task.status === 'done';

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      onPress={onToggle}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.backgroundSelected },
        isLast && styles.last,
        pressed && { opacity: 0.75 },
      ]}>
      <View
        style={[
          styles.dot,
          done && { backgroundColor: theme.accent, borderColor: theme.accent },
          !done && { borderColor: theme.backgroundSelected },
        ]}>
        <ThemedText style={[styles.check, done && { color: '#fff' }]}>{done ? '✓' : ''}</ThemedText>
      </View>
      {task.photoUri ? (
        <Image source={{ uri: task.photoUri }} style={styles.thumb} contentFit="cover" />
      ) : null}
      <View style={styles.text}>
        <ThemedText>{task.title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {subtitle ?? `${task.points} pts`}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  last: { borderBottomWidth: 0 },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: { fontSize: 14, lineHeight: 16 },
  thumb: { width: 40, height: 40, borderRadius: Radius.sm },
  text: { flex: 1, gap: 2 },
});
