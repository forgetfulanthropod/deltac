import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { apiHealth } from '@/lib/api/client';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useEffect, useState } from 'react';

export default function CommercialScreen() {
  const [apiStatus, setApiStatus] = useState('Checking…');

  useEffect(() => {
    void apiHealth().then((r) => setApiStatus(r.message));
  }, []);

  return (
    <ThemedView style={styles.page}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Commercial</ThemedText>
        <ThemedText themeColor="textSecondary">Multi-unit and enterprise — coming after Residential</ThemedText>

        <Card>
          <ThemedText type="subtitle">Planned capabilities</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Portfolios, units, approvals, budget rollups, and vendor programs at scale.
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
            API: {apiStatus}
          </ThemedText>
        </Card>

        <Pressable onPress={() => router.push('/')} style={styles.back}>
          <ThemedText type="smallBold">Back to Residential</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  safeArea: { flex: 1, maxWidth: MaxContentWidth, marginHorizontal: 'auto', padding: Spacing.four, gap: Spacing.three },
  back: { marginTop: Spacing.four },
});
