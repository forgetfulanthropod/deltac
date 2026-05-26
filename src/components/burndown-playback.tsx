import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function BurndownPlayback({
  percentComplete,
  height = 120,
}: {
  percentComplete: number;
  height?: number;
}) {
  const theme = useTheme();
  const progress = useMemo(() => new Animated.Value(0), []);
  const [width, setWidth] = useState(0);

  const clamped = Math.max(0, Math.min(100, percentComplete));
  const target = clamped / 100;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: target,
      duration: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, target]);

  const points = useMemo(() => {
    // Simple visual steps for a stub burndown.
    return [1, 0.88, 0.76, 0.66, 0.52, 0.42, 0.35, 0.22, 0.12, 0.08];
  }, []);

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={[
        styles.frame,
        {
          height,
          borderColor: theme.backgroundElement,
          backgroundColor: theme.background,
        },
      ]}>
      <View style={styles.grid} pointerEvents="none">
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={i}
            style={[styles.gridLine, { backgroundColor: theme.backgroundElement, opacity: 0.65 }]}
          />
        ))}
      </View>

      <View style={styles.chartRow} pointerEvents="none">
        {points.map((p, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: theme.textSecondary,
                opacity: 0.65,
                transform: [{ translateY: (1 - p) * (height - 32) }],
              },
            ]}
          />
        ))}
      </View>

      <Animated.View
        style={[
          styles.playhead,
          {
            backgroundColor: theme.text,
            transform: [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, Math.max(0, width - 2)],
                }),
              },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: theme.backgroundElement,
            width: progress.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 1,
    borderRadius: Spacing.four,
    overflow: 'hidden',
  },
  grid: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: Spacing.three,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    borderRadius: 1,
  },
  chartRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: Spacing.three,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  fill: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    top: 0,
    opacity: 0.25,
  },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    opacity: 0.35,
  },
});

