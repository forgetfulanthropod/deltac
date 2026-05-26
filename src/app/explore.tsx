import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function OverviewScreen() {
  return (
    <ScrollView contentInset={{ bottom: BottomTabInset }} contentContainerStyle={styles.scrollBody}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Delta</ThemedText>
        <ThemedText themeColor="textSecondary">Rivvr Homes · Residential</ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="subtitle">Three responsibilities</ThemedText>
          <ThemedText themeColor="textSecondary">
            Scoping (generate → select), Sourcing (auto-source → accept all), Scheduling (lean →
            diagrams → editable).
          </ThemedText>
        </ThemedView>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/')}
          style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
          <ThemedView type="backgroundElement" style={styles.button}>
            <ThemedText type="smallBold">Back to persona selection</ThemedText>
          </ThemedView>
        </Pressable>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollBody: { flexGrow: 1, flexDirection: 'row', justifyContent: 'center' },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  card: { padding: Spacing.four, borderRadius: Spacing.four, gap: Spacing.two },
  pressable: { alignSelf: 'flex-start', borderRadius: Spacing.five },
  button: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two, borderRadius: Spacing.five },
  pressed: { opacity: 0.75 },
});
