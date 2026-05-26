import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function WorkerAccountSetupScreen() {
  return (
    <ThemedView style={styles.page}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Worker account</ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Stub</ThemedText>
          <ThemedText themeColor="textSecondary">
            This screen will create a worker profile (trade, service area, availability) so tasks
            can be assigned and scheduled.
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
          Profile → Assignments → Updates
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

