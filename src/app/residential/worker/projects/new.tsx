import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function WorkerAccountSetupScreen() {
  const [trade, setTrade] = useState('Electrician');
  const [area, setArea] = useState('Metro North');
  const [avail, setAvail] = useState('Mon-Fri 7am-4pm');
  const [created, setCreated] = useState(false);

  return (
    <ThemedView style={styles.page}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Worker account</ThemedText>
        <ThemedText themeColor="textSecondary">Set up your profile to receive assignments</ThemedText>

        {!created ? (
          <>
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="subtitle">Your details (stub)</ThemedText>

              <ThemedText type="small" themeColor="textSecondary">Primary trade</ThemedText>
              <TextInput value={trade} onChangeText={setTrade} style={styles.input} />

              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
                Service area
              </ThemedText>
              <TextInput value={area} onChangeText={setArea} style={styles.input} />

              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
                Availability
              </ThemedText>
              <TextInput value={avail} onChangeText={setAvail} style={styles.input} />
            </ThemedView>

            <Pressable
              accessibilityRole="button"
              onPress={() => setCreated(true)}
              style={({ pressed }) => [styles.buttonPressable, pressed && styles.pressed]}>
              <ThemedView style={[styles.button, styles.primaryButton]}>
                <ThemedText type="smallBold">Create profile &amp; join pool</ThemedText>
              </ThemedView>
            </Pressable>
          </>
        ) : (
          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="subtitle">Profile created (demo)</ThemedText>
            <ThemedText themeColor="textSecondary">
              You are now visible for task assignments on projects. In the full app you would see
              matching jobs, claim tasks, confirm availability, and update status from the field.
            </ThemedText>
            <Pressable
              onPress={() => router.push('/residential/worker/projects/sample-90')}
              style={({ pressed }) => [styles.buttonPressable, pressed && styles.pressed, { marginTop: Spacing.three }]}>
              <ThemedView style={[styles.button, styles.primaryButton]}>
                <ThemedText type="smallBold">View sample project tasks</ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>
        )}

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.buttonPressable, pressed && styles.pressed]}>
          <ThemedView style={styles.button}>
            <ThemedText type="smallBold">Back to Projects</ThemedText>
          </ThemedView>
        </Pressable>

        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          Profile → Claim tasks → Update progress → Get paid
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
  input: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: Spacing.two,
    padding: Spacing.two,
    marginTop: Spacing.one,
    color: '#000',
    fontSize: 16,
  },
  buttonPressable: { borderRadius: Spacing.five, alignSelf: 'flex-start' },
  button: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.two, borderRadius: Spacing.five },
  primaryButton: { backgroundColor: '#208AEF' },
  pressed: { opacity: 0.75 },
  footer: { marginTop: 'auto', textAlign: 'center' },
});

