import type { Story } from '@/lib/projectStore';

function storiesFromTemplate(
  visionKey: string,
  blocks: Array<{ title: string; tasks: Array<{ title: string; points: number; status?: 'todo' | 'done' }> }>
): Story[] {
  return blocks.map((block, si) => {
    const tasks = block.tasks.map((t, ti) => ({
      id: `${visionKey}-s${si}-t${ti}`,
      title: t.title,
      points: t.points,
      status: (t.status ?? 'todo') as 'todo' | 'in-progress' | 'done',
    }));
    const allDone = tasks.every((t) => t.status === 'done');
    const anyStarted = tasks.some((t) => t.status !== 'todo');
    return {
      id: `${visionKey}-story-${si}`,
      title: block.title,
      tasks,
      status: allDone ? 'complete' : anyStarted ? 'in-progress' : 'not-started',
    };
  });
}

/** Scope templates per Imagine vision — maps to Stories → Tasks → points */
export function getStoriesForVision(visionId: string): Story[] {
  switch (visionId) {
    case 'scandinavian':
      return storiesFromTemplate('scandi', [
        {
          title: 'Prep & protection',
          tasks: [
            { title: 'Floor protection + dust isolation', points: 3 },
            { title: 'Demo upper cabinets', points: 8 },
          ],
        },
        {
          title: 'Cabinetry & surfaces',
          tasks: [
            { title: 'Install white oak fronts', points: 14 },
            { title: 'Quartz counters + waterfall', points: 10 },
          ],
        },
        {
          title: 'Light & finish',
          tasks: [
            { title: 'Warm LED under-cabinet', points: 5 },
            { title: 'Paint + hardware (brass)', points: 6 },
          ],
        },
      ]);
    case 'organic':
      return storiesFromTemplate('organic', [
        {
          title: 'Demo & rough',
          tasks: [
            { title: 'Full gut + haul-away', points: 12 },
            { title: 'Plumbing rough adjustments', points: 8 },
          ],
        },
        {
          title: 'Walnut & stone',
          tasks: [
            { title: 'Walnut cabinetry install', points: 16 },
            { title: 'Stone counters + island', points: 12 },
          ],
        },
        {
          title: 'Brass & living finishes',
          tasks: [
            { title: 'Brass fixtures + hardware', points: 7 },
            { title: 'Tile backsplash (zellige)', points: 9 },
            { title: 'Appliance set + punch list', points: 8 },
          ],
        },
      ]);
    case 'japandi':
      return storiesFromTemplate('japandi', [
        {
          title: 'Calm prep',
          tasks: [
            { title: 'Minimal demo (keep layout)', points: 5 },
            { title: 'Patch walls + skim coat', points: 4 },
          ],
        },
        {
          title: 'Built-ins & stone',
          tasks: [
            { title: 'Flush cabinetry (matte)', points: 12 },
            { title: 'Honed stone counters', points: 9 },
          ],
        },
        {
          title: 'Soft light',
          tasks: [
            { title: 'Hidden lighting channels', points: 6 },
            { title: 'Natural oil finish on oak', points: 5 },
          ],
        },
      ]);
    case 'coastal':
      return storiesFromTemplate('coastal', [
        {
          title: 'Bright refresh',
          tasks: [
            { title: 'Paint cabinets (soft white)', points: 8 },
            { title: 'New hardware + hinges', points: 4 },
          ],
        },
        {
          title: 'Open & airy',
          tasks: [
            { title: 'Open shelving + glass uppers', points: 7 },
            { title: 'Light quartz counters', points: 9 },
          ],
        },
        {
          title: 'Coastal details',
          tasks: [
            { title: 'Subway tile (sea glass)', points: 8 },
            { title: 'Rope pendants + dimmers', points: 5 },
          ],
        },
      ]);
    case 'moody':
      return storiesFromTemplate('moody', [
        {
          title: 'Dark base',
          tasks: [
            { title: 'Demo + electrical upgrade', points: 10 },
            { title: 'Dark cabinet boxes + fronts', points: 14 },
          ],
        },
        {
          title: 'Marble & brass',
          tasks: [
            { title: 'Black marble counters', points: 11 },
            { title: 'Brass pulls + faucet suite', points: 6 },
          ],
        },
        {
          title: 'Atmosphere',
          tasks: [
            { title: 'Mood lighting + toe-kick', points: 5 },
            { title: 'Green accent wall + seal', points: 4 },
          ],
        },
      ]);
    default:
      return getStoriesForVision('scandinavian');
  }
}

export type ScopeOptionId = 'refresh' | 'mid' | 'full';

export const SCOPE_OPTIONS: Array<{ id: ScopeOptionId; label: string; note: string }> = [
  { id: 'refresh', label: 'Refresh', note: 'Fastest · lightest scope' },
  { id: 'mid', label: 'Mid-scale', note: 'Balanced timeline and scope' },
  { id: 'full', label: 'Full remodel', note: 'Maximum transformation' },
];

/** Adjust story/task depth for compare-and-select scoping */
export function getStoriesForVisionAndScope(visionId: string, scopeId: ScopeOptionId): Story[] {
  const full = getStoriesForVision(visionId);
  if (scopeId === 'full') return full;
  if (scopeId === 'refresh') {
    return full
      .map((s) => ({ ...s, tasks: s.tasks.slice(0, 1) }))
      .filter((s) => s.tasks.length > 0);
  }
  return full.slice(0, Math.max(1, full.length - 1));
}
