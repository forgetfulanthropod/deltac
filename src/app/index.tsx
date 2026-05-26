import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { setPersona } from '@/lib/persona';
import { MaxContentWidth, Radius, Shadows, Spacing } from '@/constants/theme';

export default function DeltaEntry() {
  return (
    <ThemedView style={styles.page}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={{ fontSize: 52, lineHeight: 54 }}>Delta</ThemedText>
          <ThemedText style={{ fontSize: 18, color: '#8D5E3A', marginTop: 4 }}>
            by Rivvr Homes
          </ThemedText>
        </ThemedView>

        <ThemedText style={{ fontSize: 22, lineHeight: 28, marginTop: 12 }}>
          See what your home could become.
        </ThemedText>

        <ThemedText style={{ marginTop: 8, opacity: 0.7, fontSize: 15 }}>
          Point your camera at any space. Watch it transform.
        </ThemedText>

        {/* Big beautiful primary action */}
        <Pressable
          onPress={() => router.push('/residential/owner/projects/new')}
          style={({ pressed }) => [styles.primaryCta, pressed && { transform: [{ scale: 0.985 }] }]}>
          <ThemedText type="smallBold" style={{ color: 'white', fontSize: 17 }}>
            Imagine a new space →
          </ThemedText>
        </Pressable>

        <ThemedText style={{ marginTop: 32, marginBottom: 8, opacity: 0.5, fontSize: 13 }}>
          OR CONTINUE AS
        </ThemedText>

        <Pressable
          onPress={() => {
            setPersona('owner');
            router.push('/residential/owner/projects');
          }}
          style={styles.secondaryCta}>
          <ThemedText>Project Owner — full workspace</ThemedText>
        </Pressable>

        <Pressable
          onPress={() => {
            setPersona('worker');
            router.push('/residential/worker/projects');
          }}
          style={[styles.secondaryCta, { marginTop: 8 }]}>
          <ThemedText>Worker — find work &amp; update progress</ThemedText>
        </Pressable>

        <Pressable onPress={() => router.push('/commercial')} style={[styles.secondaryCta, { marginTop: 8 }]}>
          <ThemedText>Commercial — enterprise (preview)</ThemedText>
        </Pressable>

        <ThemedText type="small" style={styles.footer}>
          Beautiful homes start with a clear vision.
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FAF7F2' },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    marginHorizontal: 'auto',
    paddingHorizontal: Spacing.four,
    paddingTop: 80,
  },
  header: {
    marginBottom: 12,
  },
  primaryCta: {
    marginTop: 32,
    backgroundColor: '#8D5E3A',
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: 'center',
    ...Shadows.card,
  },
  secondaryCta: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F0EBE3',
    borderRadius: Radius.lg,
  },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    opacity: 0.4,
    paddingBottom: 20,
  },
});
