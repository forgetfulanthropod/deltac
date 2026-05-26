import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import type { Project, Story } from '@/lib/projectStore';
import { getCartSummary, getProjectMaterials } from '@/lib/projectStore';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function SourcingPanel({
  project,
  onConnectVendor,
  onAcceptAll,
  onOrderStory,
  orderMessage,
}: {
  project: Project;
  onConnectVendor: (vendor: 'Home Depot' | 'Amazon') => void;
  onAcceptAll: () => void;
  onOrderStory: (storyId: string) => void;
  orderMessage?: string;
}) {
  const theme = useTheme();
  const materials = getProjectMaterials(project);
  const cart = getCartSummary(project);

  return (
    <Card>
      <ThemedText type="smallBold">Sourcing</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Auto-sourced materials per task — connect vendors, then order.
      </ThemedText>

      {materials.map((m, i) => (
        <View key={`${m.sku}-${i}`} style={styles.matRow}>
          <ThemedText type="small">
            {m.name} ({m.sku})
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {m.vendor} · ${m.price} · {m.status}
          </ThemedText>
        </View>
      ))}

      <View style={styles.row}>
        <Pressable
          onPress={() => onConnectVendor('Home Depot')}
          style={[
            styles.connectBtn,
            project.sourcingConnected['Home Depot'] && { backgroundColor: theme.success + '55' },
          ]}>
          <ThemedText type="small">
            {project.sourcingConnected['Home Depot'] ? '✓ Home Depot' : 'Connect Home Depot'}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => onConnectVendor('Amazon')}
          style={[
            styles.connectBtn,
            project.sourcingConnected.Amazon && { backgroundColor: theme.success + '55' },
          ]}>
          <ThemedText type="small">
            {project.sourcingConnected.Amazon ? '✓ Amazon' : 'Connect Amazon'}
          </ThemedText>
        </Pressable>
      </View>

      <ThemedText style={{ marginTop: Spacing.two }}>Order by story</ThemedText>
      {project.stories.map((story: Story) => (
        <Pressable key={story.id} onPress={() => onOrderStory(story.id)} style={styles.storyOrder}>
          <ThemedText type="small">Order materials for {story.title}</ThemedText>
        </Pressable>
      ))}

      <View style={styles.cartBox}>
        <ThemedText type="smallBold">
          Cart — {cart.count} items · ${cart.total}
        </ThemedText>
        <Pressable onPress={onAcceptAll} style={[styles.acceptBtn, { backgroundColor: theme.accent }]}>
          <ThemedText type="smallBold" style={{ color: '#fff' }}>
            Accept all &amp; order
          </ThemedText>
        </Pressable>
        {orderMessage ? (
          <ThemedText type="small" style={{ color: theme.success, marginTop: Spacing.one }}>
            {orderMessage}
          </ThemedText>
        ) : null}
      </View>

      {project.orders.length > 0 && (
        <ThemedText type="small" themeColor="textSecondary">
          {project.orders.length} order(s) on file
        </ThemedText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  matRow: { paddingVertical: Spacing.one, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
  connectBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  storyOrder: { paddingVertical: Spacing.one },
  cartBox: { marginTop: Spacing.two, gap: Spacing.two },
  acceptBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
});
