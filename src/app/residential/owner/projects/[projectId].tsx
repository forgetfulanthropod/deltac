import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BurndownPlayback } from '@/components/burndown-playback';
import { StoryGallery } from '@/components/story-gallery';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Task = { id: string; title: string; points: number; done: boolean };
type Story = { id: string; title: string; tasks: Task[] };

export function generateStaticParams() {
  return [{ projectId: 'sample-90' }];
}

const SAMPLE_STORIES: Story[] = [
  {
    id: 'story-kitchen-demo',
    title: 'Kitchen demo + prep',
    tasks: [
      { id: 't-1', title: 'Protect floors + isolate dust', points: 2, done: true },
      { id: 't-2', title: 'Remove cabinets + dispose', points: 5, done: true },
      { id: 't-3', title: 'Rough-in inspection', points: 3, done: true },
    ],
  },
  {
    id: 'story-electrical',
    title: 'Electrical + lighting',
    tasks: [
      { id: 't-4', title: 'Install recessed lighting', points: 5, done: true },
      { id: 't-5', title: 'Under-cabinet circuit', points: 3, done: false },
    ],
  },
  {
    id: 'story-finishes',
    title: 'Finishes',
    tasks: [
      { id: 't-6', title: 'Backsplash tile', points: 8, done: false },
      { id: 't-7', title: 'Paint + trim touch-ups', points: 3, done: false },
    ],
  },
];

export default function OwnerProjectDetailScreen() {
  const navigation = useNavigation();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const theme = useTheme();

  useEffect(() => {
    navigation.setOptions({ title: 'Project' });
  }, [navigation]);

  const [playKey, setPlayKey] = useState(0);
  const [doneById, setDoneById] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const s of SAMPLE_STORIES) for (const t of s.tasks) initial[t.id] = t.done;
    return initial;
  });

  const { totalPoints, donePoints } = useMemo(() => {
    const all = SAMPLE_STORIES.flatMap((s) => s.tasks);
    const total = all.reduce((sum, t) => sum + t.points, 0);
    const done = all.reduce((sum, t) => sum + (doneById[t.id] ? t.points : 0), 0);
    return { totalPoints: total, donePoints: done };
  }, [doneById]);

  const percent = totalPoints === 0 ? 0 : Math.round((donePoints / totalPoints) * 100);

  // Demo state for the new project sections (Scoping / Sourcing / Scheduling stubs)
  const [section, setSection] = useState<'Overview' | 'Scoping' | 'Sourcing' | 'Scheduling'>('Overview');
  const [scopingNote, setScopingNote] = useState('');
  const [hdConnected, setHdConnected] = useState(false);
  const [amzConnected, setAmzConnected] = useState(false);
  const [orderMsg, setOrderMsg] = useState('');
  const [schedNote, setSchedNote] = useState('');

  function toggleVendor(v: 'hd' | 'amz') {
    if (v === 'hd') setHdConnected((c) => !c);
    else setAmzConnected((c) => !c);
  }

  function placeOrder() {
    setOrderMsg('✅ Orders placed! (demo — in real app this would create PO + charge connected accounts)');
    // clear after a bit for re-demo
    setTimeout(() => setOrderMsg(''), 4200);
  }

  return (
    <ScrollView
      contentInset={{ bottom: BottomTabInset }}
      contentContainerStyle={[styles.scrollBody, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.hero}>
          <ThemedText type="title" style={styles.heroTitle}>
            Sample Project
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.heroMeta}>
            {percent}% complete · {donePoints}/{totalPoints} points
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Residential · Rivvr Homes · {projectId}
          </ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderText}>
              <ThemedText type="subtitle">Progress</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Playback animates completion order.
              </ThemedText>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setPlayKey((k) => k + 1)}
              style={({ pressed }) => [styles.pillPressable, pressed && styles.pressed]}>
              <ThemedView style={styles.pill}>
                <ThemedText type="smallBold">Replay</ThemedText>
              </ThemedView>
            </Pressable>
          </View>

          <BurndownPlayback key={playKey} percentComplete={percent} height={140} />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Stories</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Each story includes a quick gallery and its tasks.
          </ThemedText>

          {SAMPLE_STORIES.map((story) => {
            const storyTotal = story.tasks.reduce((s, t) => s + t.points, 0);
            const storyDone = story.tasks.reduce((s, t) => s + (doneById[t.id] ? t.points : 0), 0);
            const storyPct = storyTotal === 0 ? 0 : Math.round((storyDone / storyTotal) * 100);

            return (
              <ThemedView key={story.id} type="backgroundElement" style={styles.card}>
                <View style={styles.storyHeader}>
                  <View style={styles.storyTitleCol}>
                    <ThemedText type="smallBold">{story.title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {storyPct}% · {storyDone}/{storyTotal} pts
                    </ThemedText>
                  </View>
                </View>

                <StoryGallery storyId={story.id} />

                <View style={[styles.taskList, { borderTopColor: theme.backgroundSelected }]}>
                  {story.tasks.map((task, idx) => {
                    const done = !!doneById[task.id];
                    return (
                      <Pressable
                        key={task.id}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: done }}
                        onPress={() => setDoneById((prev) => ({ ...prev, [task.id]: !done }))}
                        style={({ pressed }) => [
                          styles.taskRow,
                          { borderBottomColor: theme.backgroundSelected },
                          idx === story.tasks.length - 1 && styles.taskRowLast,
                          pressed && styles.pressed,
                        ]}>
                        <View style={[styles.checkDot, { borderColor: theme.backgroundSelected }]}>
                          <ThemedText style={styles.checkText}>{done ? '✓' : ''}</ThemedText>
                        </View>
                        <View style={styles.taskText}>
                          <ThemedText>{task.title}</ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            {task.points} pts · assigned (stub)
                          </ThemedText>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </ThemedView>
            );
          })}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Project sections (demo)</ThemedText>

          {/* Segmented tabs for the three responsibilities + overview */}
          <ThemedView style={styles.segRow}>
            {(['Overview', 'Scoping', 'Sourcing', 'Scheduling'] as const).map((label) => {
              const active = section === label;
              return (
                <Pressable
                  key={label}
                  onPress={() => setSection(label)}
                  style={({ pressed }) => [
                    styles.segBtn,
                    active && styles.segBtnActive,
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText type="small" style={active ? styles.segTextActive : undefined}>
                    {label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ThemedView>

          {/* OVERVIEW */}
          {section === 'Overview' && (
            <>
              <ThemedText type="small" themeColor="textSecondary">
                Progress playback + interactive task checklist. Toggle tasks to update the burndown.
              </ThemedText>
              {/* existing burndown + tasks already rendered above */}
            </>
          )}

          {/* SCOPING stub */}
          {section === 'Scoping' && (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">Scoping — generate → compare → select</ThemedText>
              <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.one }}>
                Current active scope: Mid-scale (from new project flow demo)
              </ThemedText>

              <ThemedText style={{ marginTop: Spacing.two }}>Alternative options (stub):</ThemedText>
              {[
                { label: 'Refresh', pts: '22 pts', note: 'Fastest, lowest cost' },
                { label: 'Full remodel', pts: '62 pts', note: 'Max value, longest' },
              ].map((o, i) => (
                <Pressable
                  key={i}
                  onPress={() => setScopingNote(`Switched to ${o.label} (demo — would regenerate stories)`)}
                  style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}>
                  <ThemedText>• {o.label} — {o.pts}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary"> {o.note}</ThemedText>
                </Pressable>
              ))}

              {scopingNote ? (
                <ThemedText type="small" style={{ marginTop: Spacing.two, color: '#0a0' }}>
                  {scopingNote}
                </ThemedText>
              ) : null}

              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
                (In real: AI photo+measurement analysis produces 3 options with story/task breakdowns
                and cost bands.)
              </ThemedText>
            </ThemedView>
          )}

          {/* SOURCING stub - the big missing piece */}
          {section === 'Sourcing' && (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">Sourcing — auto-source → connect → accept all</ThemedText>

              <ThemedText style={{ marginTop: Spacing.two }}>Recommended materials (stub)</ThemedText>
              {[
                { sku: 'HD-88421', item: 'Recessed LED 6"', vendor: 'Home Depot', price: 18, stock: 'In stock' },
                { sku: 'AMZ-BS22', item: 'Backsplash tile 3x6', vendor: 'Amazon', price: 42, stock: '2-day' },
                { sku: 'HD-22109', item: 'Dimmer switches (4)', vendor: 'Home Depot', price: 29, stock: 'In stock' },
              ].map((m, i) => (
                <ThemedView key={i} style={styles.matRow}>
                  <ThemedText type="small">{m.item} ({m.sku})</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {m.vendor} · ${m.price} · {m.stock}
                  </ThemedText>
                </ThemedView>
              ))}

              <ThemedText style={{ marginTop: Spacing.two }}>Vendor connections</ThemedText>
              <ThemedView style={styles.row}>
                <Pressable
                  onPress={() => toggleVendor('hd')}
                  style={({ pressed }) => [styles.connectBtn, hdConnected && styles.connected, pressed && styles.pressed]}>
                  <ThemedText type="small">{hdConnected ? '✓ HD connected' : 'Connect Home Depot'}</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => toggleVendor('amz')}
                  style={({ pressed }) => [styles.connectBtn, amzConnected && styles.connected, pressed && styles.pressed]}>
                  <ThemedText type="small">{amzConnected ? '✓ Amazon connected' : 'Connect Amazon'}</ThemedText>
                </Pressable>
              </ThemedView>

              <ThemedView style={[styles.cartBox, { marginTop: Spacing.two }]}>
                <ThemedText type="smallBold">Consolidated cart — 3 items · $89</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">Ready for consolidated order</ThemedText>
                <Pressable
                  onPress={placeOrder}
                  style={({ pressed }) => [styles.acceptBtn, pressed && styles.pressed, { marginTop: Spacing.two }]}>
                  <ThemedText type="smallBold" style={{ color: '#fff' }}>Accept all &amp; order (demo)</ThemedText>
                </Pressable>
                {orderMsg && (
                  <ThemedText type="small" style={{ marginTop: Spacing.one, color: '#0a0' }}>
                    {orderMsg}
                  </ThemedText>
                )}
              </ThemedView>
            </ThemedView>
          )}

          {/* SCHEDULING stub */}
          {section === 'Scheduling' && (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">Scheduling — lean + burndown + critical path</ThemedText>
              <ThemedText themeColor="textSecondary" style={{ marginTop: Spacing.one }}>
                Dependencies and points feed the animated burndown above.
              </ThemedText>

              <ThemedText style={{ marginTop: Spacing.two }}>Critical path (stub)</ThemedText>
              <ThemedView style={styles.pathBox}>
                <ThemedText type="small">1. Kitchen demo + prep (done)</ThemedText>
                <ThemedText type="small">   ↓</ThemedText>
                <ThemedText type="small">2. Electrical rough-in (in progress)</ThemedText>
                <ThemedText type="small">   ↓</ThemedText>
                <ThemedText type="small">3. Finishes (blocked on #2)</ThemedText>
              </ThemedView>

              <Pressable
                onPress={() => setSchedNote('Edit dates / assignments / deps would open here (stub)')}
                style={({ pressed }) => [styles.pillPressable, pressed && styles.pressed, { marginTop: Spacing.two }]}>
                <ThemedView style={styles.pill}>
                  <ThemedText type="smallBold">Edit schedule (demo)</ThemedText>
                </ThemedView>
              </Pressable>
              {schedNote ? (
                <ThemedText type="small" style={{ marginTop: Spacing.one }}>{schedNote}</ThemedText>
              ) : null}

              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: Spacing.two }}>
                (Full version: drag to reorder, worker availability calendar, auto-schedule from
                points + constraints, burndown history playback.)
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollBody: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.four,
  },
  hero: { gap: Spacing.one, paddingTop: Spacing.two, paddingBottom: Spacing.one },
  heroTitle: { fontSize: 40, lineHeight: 44 },
  heroMeta: { marginTop: Spacing.half },
  section: { gap: Spacing.two },
  card: { padding: Spacing.four, borderRadius: Spacing.four, gap: Spacing.two },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardHeaderText: { flex: 1, gap: Spacing.half, paddingRight: Spacing.two },
  pillPressable: { borderRadius: Spacing.five },
  pill: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Spacing.five },
  pressed: { opacity: 0.75 },
  storyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storyTitleCol: { flex: 1, gap: 2 },
  taskList: {
    marginTop: Spacing.two,
    borderTopWidth: 1,
  },
  taskRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
  },
  taskRowLast: { borderBottomWidth: 0 },
  checkDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontSize: 14, lineHeight: 16 },
  taskText: { flex: 1, gap: 2 },

  // New section tabs + stubs styles
  segRow: { flexDirection: 'row', gap: Spacing.one, flexWrap: 'wrap', marginBottom: Spacing.two },
  segBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  segBtnActive: { backgroundColor: '#208AEF' },
  segTextActive: { color: '#fff' },
  optionRow: { paddingVertical: Spacing.one },
  matRow: { paddingVertical: Spacing.one, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  row: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  connectBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.three,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  connected: { backgroundColor: '#d4edda' },
  cartBox: { padding: Spacing.three, borderRadius: Spacing.three, backgroundColor: 'rgba(0,0,0,0.03)' },
  acceptBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#208AEF',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
  },
  pathBox: {
    marginTop: Spacing.one,
    padding: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: Spacing.two,
    gap: 2,
  },
});

