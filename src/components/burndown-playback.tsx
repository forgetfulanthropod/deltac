import { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import type { BurndownEvent, BurndownProjection } from '@/lib/schedule';
import {
  burndownTimeToX,
  getBurndownChartScale,
  getBurndownProjections,
} from '@/lib/schedule';
import type { Project } from '@/lib/projectStore';
import { Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const PAD = { top: 12, right: 14, bottom: 36, left: 38 };
const HIT = 28;
const TOOLTIP_W = 240;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function linePath(coords: { x: number; y: number }[]): string {
  if (coords.length === 0) return '';
  return coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

function areaPath(coords: { x: number; y: number }[], baselineY: number): string {
  if (coords.length === 0) return '';
  const last = coords[coords.length - 1];
  const first = coords[0];
  return `${linePath(coords)} L ${last.x.toFixed(1)} ${baselineY.toFixed(1)} L ${first.x.toFixed(1)} ${baselineY.toFixed(1)} Z`;
}

function pathLength(coords: { x: number; y: number }[]): number {
  let len = 0;
  for (let i = 1; i < coords.length; i++) {
    len += Math.hypot(coords[i].x - coords[i - 1].x, coords[i].y - coords[i - 1].y);
  }
  return len;
}

function pointAlongPath(coords: { x: number; y: number }[], t: number): { x: number; y: number } {
  if (coords.length === 0) return { x: 0, y: 0 };
  if (coords.length === 1) return coords[0];
  const total = pathLength(coords);
  if (total === 0) return coords[0];
  const target = t * total;
  let walked = 0;
  for (let i = 1; i < coords.length; i++) {
    const seg = Math.hypot(coords[i].x - coords[i - 1].x, coords[i].y - coords[i - 1].y);
    if (walked + seg >= target) {
      const f = (target - walked) / seg;
      return {
        x: coords[i - 1].x + f * (coords[i].x - coords[i - 1].x),
        y: coords[i - 1].y + f * (coords[i].y - coords[i - 1].y),
      };
    }
    walked += seg;
  }
  return coords[coords.length - 1];
}

function timeToCoord(
  at: number,
  remaining: number,
  scale: ReturnType<typeof getBurndownChartScale>,
  chartW: number,
  chartH: number
): { x: number; y: number } {
  const innerH = Math.max(1, chartH - PAD.top - PAD.bottom);
  return {
    x: burndownTimeToX(at, scale, PAD.left, PAD.right, chartW),
    y: PAD.top + (1 - clamp01(remaining)) * innerH,
  };
}

function tooltipPosition(x: number, y: number, chartW: number) {
  let left = x - TOOLTIP_W / 2;
  left = Math.max(4, Math.min(left, chartW - TOOLTIP_W - 4));
  const top = Math.max(4, y - 52);
  return { left, top };
}

function formatAxisDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function BurndownPlayback({
  project,
  events,
  percentComplete,
  height = 200,
}: {
  project: Project;
  events?: BurndownEvent[];
  percentComplete: number;
  height?: number;
}) {
  const theme = useTheme();
  const progress = useMemo(() => new Animated.Value(0), []);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [playhead, setPlayhead] = useState({ x: PAD.left, y: PAD.top });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const resolvedEvents: BurndownEvent[] = useMemo(() => {
    if (!events?.length) return [];
    return events.map((e) => ({ ...e, remaining: clamp01(e.remaining) }));
  }, [events]);

  const projections = useMemo(() => getBurndownProjections(project), [project]);
  const scale = useMemo(
    () => getBurndownChartScale(project, projections),
    [project, projections]
  );

  const chartW = layoutWidth || 320;
  const chartH = height;
  const baselineY = chartH - PAD.bottom;
  const now = Date.now();

  const coords = useMemo(() => {
    const sorted = [...resolvedEvents].sort((a, b) => a.at - b.at);
    return sorted.map((e) => timeToCoord(e.at, e.remaining, scale, chartW, chartH));
  }, [resolvedEvents, scale, chartW, chartH]);

  const eventByCoordIndex = useMemo(() => {
    const sorted = [...resolvedEvents].sort((a, b) => a.at - b.at);
    return sorted;
  }, [resolvedEvents]);

  const actualLine = useMemo(() => linePath(coords), [coords]);
  const actualArea = useMemo(() => areaPath(coords, baselineY), [coords, baselineY]);
  const totalLen = useMemo(() => pathLength(coords), [coords]);

  const currentRemaining =
    resolvedEvents.length > 0
      ? resolvedEvents[resolvedEvents.length - 1].remaining
      : clamp01(1 - percentComplete / 100);

  const nowCoord = useMemo(
    () => timeToCoord(now, currentRemaining, scale, chartW, chartH),
    [now, currentRemaining, scale, chartW, chartH]
  );

  const nowDividerX = useMemo(
    () => burndownTimeToX(now, scale, PAD.left, PAD.right, chartW),
    [now, scale, chartW]
  );

  const projectionLines = useMemo(() => {
    const zeroY = timeToCoord(now, 0, scale, chartW, chartH).y;
    return projections.map((p) => {
      const endCoord = timeToCoord(p.endAt, 0, scale, chartW, chartH);
      return {
        projection: p,
        d: `M ${nowCoord.x.toFixed(1)} ${nowCoord.y.toFixed(1)} L ${endCoord.x.toFixed(1)} ${zeroY.toFixed(1)}`,
        endX: endCoord.x,
        endY: zeroY,
      };
    });
  }, [projections, nowCoord, scale, chartW, chartH, now]);

  const remainingPct = Math.round(currentRemaining * 100);

  const activeEvent = activeIndex !== null ? eventByCoordIndex[activeIndex] : null;
  const activeCoord = activeIndex !== null ? coords[activeIndex] : null;
  const tooltip =
    activeEvent && activeCoord ? tooltipPosition(activeCoord.x, activeCoord.y, chartW) : null;

  const startX = burndownTimeToX(scale.histStart, scale, PAD.left, PAD.right, chartW);

  useEffect(() => {
    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [progress, coords, percentComplete]);

  useEffect(() => {
    const id = progress.addListener(({ value: t }) => {
      setPlayhead(pointAlongPath(coords, t));
    });
    return () => progress.removeListener(id);
  }, [progress, coords]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [totalLen, 0],
  });

  const projColor = (kind: BurndownProjection['kind']) =>
    kind === 'recent30' ? theme.success : theme.textSecondary;

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <ThemedText type="small" themeColor="textSecondary">
          Remaining work
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.accent }}>
          {remainingPct}% left
        </ThemedText>
      </View>

      <View
        onLayout={(e: LayoutChangeEvent) => setLayoutWidth(e.nativeEvent.layout.width)}
        style={[
          styles.chartBox,
          {
            height: chartH,
            borderColor: theme.backgroundSelected,
            backgroundColor: theme.backgroundElement,
          },
        ]}>
        {layoutWidth > 0 && resolvedEvents.length > 0 && (
          <>
            <Svg width={chartW} height={chartH} style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="burndownFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={theme.accent} stopOpacity={0.28} />
                  <Stop offset="1" stopColor={theme.accent} stopOpacity={0.04} />
                </LinearGradient>
              </Defs>

              {[0, 0.5, 1].map((tick) => {
                const y = PAD.top + tick * (baselineY - PAD.top);
                return (
                  <Line
                    key={tick}
                    x1={PAD.left}
                    y1={y}
                    x2={chartW - PAD.right}
                    y2={y}
                    stroke={theme.backgroundSelected}
                    strokeWidth={1}
                  />
                );
              })}

              {[
                { tick: 0, label: '100%' },
                { tick: 0.5, label: '50%' },
                { tick: 1, label: '0%' },
              ].map(({ tick, label }) => (
                <SvgText
                  key={label}
                  x={PAD.left - 6}
                  y={PAD.top + tick * (baselineY - PAD.top) + 4}
                  fontSize={11}
                  fill={theme.textSecondary}
                  textAnchor="end">
                  {label}
                </SvgText>
              ))}

              {scale.forecastShare > 0 && (
                <Line
                  x1={nowDividerX}
                  y1={PAD.top}
                  x2={nowDividerX}
                  y2={baselineY}
                  stroke={theme.backgroundSelected}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.9}
                />
              )}

              {projectionLines.map(({ projection, d, endX, endY }) => (
                <Path
                  key={projection.kind}
                  d={d}
                  stroke={projColor(projection.kind)}
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  fill="none"
                  opacity={0.85}
                />
              ))}

              <Path d={actualArea} fill="url(#burndownFill)" />

              <AnimatedPath
                d={actualLine}
                stroke={theme.accent}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={totalLen}
                strokeDashoffset={strokeDashoffset}
              />

              {coords.map((p, i) => {
                const hot = activeIndex === i;
                return (
                  <Circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={hot ? 5 : i === coords.length - 1 ? 3.5 : 2.5}
                    fill={hot ? theme.accent : theme.background}
                    stroke={theme.accent}
                    strokeWidth={hot ? 0 : 2}
                    opacity={i === coords.length - 1 || hot ? 1 : 0.55}
                  />
                );
              })}

              <Line
                x1={playhead.x}
                y1={playhead.y}
                x2={playhead.x}
                y2={baselineY}
                stroke={theme.accent}
                strokeWidth={1}
                opacity={0.25}
              />
              <Circle
                cx={playhead.x}
                cy={playhead.y}
                r={5}
                fill={theme.background}
                stroke={theme.accent}
                strokeWidth={2.5}
              />

              <SvgText
                x={startX}
                y={chartH - 8}
                fontSize={10}
                fill={theme.textSecondary}
                textAnchor="start">
                {formatAxisDate(scale.histStart)}
              </SvgText>
              <SvgText
                x={nowDividerX}
                y={chartH - 8}
                fontSize={10}
                fill={theme.textSecondary}
                textAnchor="middle">
                Now
              </SvgText>

              {projectionLines.map(({ projection, endX, endY }) => (
                <SvgText
                  key={`${projection.kind}-label`}
                  x={Math.min(endX, chartW - PAD.right - 2)}
                  y={endY - 6}
                  fontSize={9}
                  fill={projColor(projection.kind)}
                  textAnchor="middle">
                  {projection.endLabel}
                </SvgText>
              ))}
            </Svg>

            {coords.map((p, i) => (
              <Pressable
                key={`hit-${i}`}
                accessibilityLabel={
                  eventByCoordIndex[i].taskTitle
                    ? `${eventByCoordIndex[i].taskTitle}, ${eventByCoordIndex[i].dateLabel}`
                    : eventByCoordIndex[i].dateLabel
                }
                onHoverIn={() => setActiveIndex(i)}
                onHoverOut={() => setActiveIndex(null)}
                onPress={() => setActiveIndex(activeIndex === i ? null : i)}
                style={[
                  styles.hitArea,
                  {
                    left: p.x - HIT / 2,
                    top: p.y - HIT / 2,
                    width: HIT,
                    height: HIT,
                  },
                ]}
              />
            ))}

            {activeEvent?.crew && activeCoord && activeIndex !== null ? (
              <View
                pointerEvents="none"
                style={[
                  styles.chartCrewLabels,
                  { left: Math.min(activeCoord.x + 10, chartW - 100), top: activeCoord.y - 36 },
                ]}>
                {activeEvent.crew.map((name) => (
                  <ThemedText
                    key={name}
                    type="small"
                    style={[styles.chartCrewName, { color: theme.accent, backgroundColor: theme.background }]}>
                    {name}
                  </ThemedText>
                ))}
              </View>
            ) : null}

            {activeEvent && tooltip ? (
              <View
                pointerEvents="none"
                style={[
                  styles.tooltip,
                  Shadows.card,
                  {
                    left: tooltip.left,
                    top: tooltip.top,
                    width: TOOLTIP_W,
                    backgroundColor: theme.background,
                    borderColor: theme.backgroundSelected,
                  },
                ]}>
                <ThemedText type="small" themeColor="textSecondary">
                  {activeEvent.dateLabel}
                </ThemedText>
                {activeEvent.taskTitle ? (
                  <ThemedText type="smallBold" numberOfLines={3}>
                    {activeEvent.taskTitle}
                  </ThemedText>
                ) : (
                  <ThemedText type="smallBold">Project start</ThemedText>
                )}
                {activeEvent.crew && activeEvent.crew.length > 0 ? (
                  <View style={styles.crewList}>
                    <ThemedText type="small" themeColor="textSecondary">
                      4-person crew
                    </ThemedText>
                    {activeEvent.crew.map((name) => (
                      <ThemedText key={name} type="small" themeColor="textSecondary">
                        {name}
                      </ThemedText>
                    ))}
                  </View>
                ) : activeEvent.worker ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {activeEvent.worker}
                  </ThemedText>
                ) : null}
                {!activeEvent.taskTitle && activeEvent.dateLabel === 'Today' ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    Current progress
                  </ThemedText>
                ) : null}
              </View>
            ) : null}
          </>
        )}
      </View>

      <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
        {Platform.OS === 'web' ? 'Hover' : 'Tap'} a point for completion details
      </ThemedText>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSolid, { backgroundColor: theme.accent }]} />
          <ThemedText type="small" themeColor="textSecondary">
            Actual
          </ThemedText>
        </View>
        {projections.map((p) => (
          <View key={p.kind} style={styles.legendItem}>
            <View style={[styles.legendDash, { borderColor: projColor(p.kind) }]} />
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
              {p.label} → {p.endLabel}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const AnimatedPath = Animated.createAnimatedComponent(Path);

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chartBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    overflow: 'visible',
  },
  hitArea: {
    position: 'absolute',
    borderRadius: HIT / 2,
    zIndex: 2,
  },
  tooltip: {
    position: 'absolute',
    zIndex: 3,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 2,
    ...Shadows.card,
  },
  crewList: {
    gap: 2,
    marginTop: 2,
  },
  chartCrewLabels: {
    position: 'absolute',
    zIndex: 4,
    gap: 2,
  },
  chartCrewName: {
    fontSize: 10,
    lineHeight: 13,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  hint: {
    marginTop: -Spacing.one,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    maxWidth: 200,
  },
  legendDash: {
    width: 16,
    height: 0,
    borderTopWidth: 2,
    borderStyle: 'dashed',
  },
  legendSolid: {
    width: 16,
    height: 2.5,
    borderRadius: 1,
  },
});
