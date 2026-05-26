import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function NewOwnerProjectScreen() {
  return (
    <ThemedView style={styles.page}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">New project</ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Stub</ThemedText>
          <ThemedText themeColor="textSecondary">
            This screen will capture the space (photos / dimensions / notes) and generate remodel
            options to select as the project scope.
          </ThemedText>
        </ThemedView>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.buttonPressable, pressed && styles.pressed]}>
          <ThemedView type="backgroundElement" style={styles.button}>
            <ThemedText type="smallBold">Back</ThemedText>
          </ThemedView>
        </Pressable>

        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          Capture → Generate → Select → Plan
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
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  card: { padding: Spacing.four, borderRadius: Spacing.four, gap: Spacing.two },
  buttonPressable: { borderRadius: Spacing.five, alignSelf: 'flex-start' },
  button: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two, borderRadius: Spacing.five },
  pressed: { opacity: 0.75 },
  footer: { marginTop: 'auto', textAlign: 'center' },
});

