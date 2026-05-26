import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useWorkerProfile } from '@/lib/workerStore';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function WorkerAccountSetupScreen() {
  const { profile, saveWorkerProfile } = useWorkerProfile();
  const [name, setName] = useState(profile?.name ?? '');
  const [trade, setTrade] = useState(profile?.trade ?? 'Electrician');
  const [area, setArea] = useState(profile?.serviceArea ?? 'Metro North');
  const [avail, setAvail] = useState(profile?.availability ?? 'Mon-Fri 7am-4pm');
  const [created, setCreated] = useState(!!profile);

  const save = () => {
    saveWorkerProfile({
      name: name.trim() || 'Field Pro',
      trade,
      serviceArea: area,
      availability: avail,
    });
    setCreated(true);
  };

  return (
    <ThemedView style={styles.page}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Worker account</ThemedText>
        <ThemedText themeColor="textSecondary">Set up your profile to receive assignments</ThemedText>

        {!created ? (
          <>
            <Card>
              <ThemedText type="subtitle">Your details</ThemedText>

              <ThemedText type="small" themeColor="textSecondary">
                Display name
              </ThemedText>
              <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Field Pro" />

              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
                Primary trade
              </ThemedText>
              <TextInput value={trade} onChangeText={setTrade} style={styles.input} />

              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
                Service area
              </ThemedText>
              <TextInput value={area} onChangeText={setArea} style={styles.input} />

              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
                Availability
              </ThemedText>
              <TextInput value={avail} onChangeText={setAvail} style={styles.input} />
            </Card>

            <Pressable
              accessibilityRole="button"
              onPress={save}
              style={({ pressed }) => [styles.buttonPressable, pressed && styles.pressed]}>
              <ThemedView style={[styles.button, styles.primaryButton]}>
                <ThemedText type="smallBold">Create profile &amp; join pool</ThemedText>
              </ThemedView>
            </Pressable>
          </>
        ) : (
          <Card>
            <ThemedText type="subtitle">Profile saved</ThemedText>
            <ThemedText themeColor="textSecondary">
              {name || profile?.name || 'Field Pro'} · {trade} · {area}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
              Open tasks assigned to you appear on each project. Update status from the field as work
              completes.
            </ThemedText>
            <Pressable
              onPress={() => router.push('/residential/worker/projects/sample-90')}
              style={({ pressed }) => [
                styles.buttonPressable,
                pressed && styles.pressed,
                { marginTop: Spacing.three },
              ]}>
              <ThemedView style={[styles.button, styles.primaryButton]}>
                <ThemedText type="smallBold">View sample project tasks</ThemedText>
              </ThemedView>
            </Pressable>
          </Card>
        )}

        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.buttonPressable, pressed && styles.pressed]}>
          <ThemedView style={styles.button}>
            <ThemedText type="smallBold">Back to Projects</ThemedText>
          </ThemedView>
        </Pressable>

        <ThemedText type="small" themeColor="textSecondary" style={styles.footer}>
          Profile → Assigned tasks → Update progress
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    marginHorizontal: 'auto',
    width: '100%',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset,
    gap: Spacing.three,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: Spacing.two,
    marginTop: Spacing.one,
  },
  buttonPressable: { borderRadius: 12 },
  button: {
    padding: Spacing.three,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  primaryButton: { backgroundColor: '#8D5E3A', borderColor: '#8D5E3A' },
  pressed: { opacity: 0.85 },
  footer: { marginTop: Spacing.four, textAlign: 'center' },
});
