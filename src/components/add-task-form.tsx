import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { pickImage } from '@/lib/pick-image';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AddTaskPayload = {
  title: string;
  points: number;
  photoUri?: string;
};

export function AddTaskForm({
  onSave,
  onCancel,
}: {
  onSave: (payload: AddTaskPayload) => void;
  onCancel: () => void;
}) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [pointsText, setPointsText] = useState('3');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  const inputStyle = [
    styles.input,
    { borderColor: theme.backgroundSelected, color: theme.text, backgroundColor: theme.background },
  ];

  const handlePickPhoto = async () => {
    setPicking(true);
    try {
      const uri = await pickImage();
      if (uri) setPhotoUri(uri);
    } finally {
      setPicking(false);
    }
  };

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const parsed = parseInt(pointsText, 10);
    const points = Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 999) : 1;
    onSave({
      title: trimmed,
      points,
      photoUri: photoUri ?? undefined,
    });
    setTitle('');
    setPointsText('3');
    setPhotoUri(null);
  };

  return (
    <View style={[styles.box, { borderColor: theme.backgroundSelected, backgroundColor: theme.background }]}>
      <ThemedText type="smallBold">New task</ThemedText>

      <ThemedText type="small" themeColor="textSecondary">
        Title
      </ThemedText>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="What needs to be done?"
        placeholderTextColor={theme.textSecondary}
        style={inputStyle}
        autoFocus
      />

      <ThemedText type="small" themeColor="textSecondary">
        Points
      </ThemedText>
      <TextInput
        value={pointsText}
        onChangeText={setPointsText}
        placeholder="3"
        placeholderTextColor={theme.textSecondary}
        keyboardType="number-pad"
        style={[inputStyle, styles.pointsInput]}
      />

      <ThemedText type="small" themeColor="textSecondary">
        Photo (optional)
      </ThemedText>
      {photoUri ? (
        <View style={styles.photoRow}>
          <Image source={{ uri: photoUri }} style={styles.thumb} contentFit="cover" />
          <View style={styles.photoActions}>
            <Pressable onPress={handlePickPhoto} disabled={picking}>
              <ThemedText type="small" style={{ color: theme.accent }}>
                Replace
              </ThemedText>
            </Pressable>
            <Pressable onPress={() => setPhotoUri(null)}>
              <ThemedText type="small" themeColor="textSecondary">
                Remove
              </ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          onPress={handlePickPhoto}
          disabled={picking}
          style={({ pressed }) => [
            styles.photoBtn,
            { borderColor: theme.backgroundSelected },
            pressed && { opacity: 0.8 },
          ]}>
          {picking ? (
            <ActivityIndicator color={theme.accent} />
          ) : (
            <ThemedText type="small" style={{ color: theme.accent }}>
              Upload photo
            </ThemedText>
          )}
        </Pressable>
      )}

      <View style={styles.actions}>
        <Pressable onPress={onCancel} style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Cancel
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={handleSave}
          disabled={!title.trim()}
          style={({ pressed }) => [
            styles.btn,
            styles.saveBtn,
            { backgroundColor: theme.accent },
            !title.trim() && styles.disabled,
            pressed && styles.pressed,
          ]}>
          <ThemedText type="smallBold" style={{ color: '#fff' }}>
            Add task
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: Spacing.one,
    marginTop: Spacing.two,
    padding: Spacing.three,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.two,
    fontSize: 16,
  },
  pointsInput: {
    maxWidth: 120,
  },
  photoBtn: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    borderStyle: 'dashed',
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  photoRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: Radius.sm,
  },
  photoActions: {
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  btn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
  },
  saveBtn: {},
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
});
