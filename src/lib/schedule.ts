import type { Project, Task } from '@/lib/projectStore';

/** Tasks below this point weight are omitted from the burndown (prep work rolls into the next drop). */
const BURNDOWN_MIN_POINTS = 5;

export type BurndownEvent = {
  /** Remaining work fraction (1 = none complete) */
  remaining: number;
  /** Epoch ms — positions the point on the time axis */
  at: number;
  dateLabel: string;
  /** Completed task at this point */
  taskTitle?: string;
  /** e.g. J. Smith — single assignee */
  worker?: string;
  /** e.g. four crew on full demolition */
  crew?: string[];
};

export type BurndownProjection = {
  kind: 'recent30' | 'average';
  label: string;
  endAt: number;
  endLabel: string;
};

/** "Jordan Smith" → "J. Smith" */
export function formatWorkerShort(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Unknown';
  if (parts.length === 1) return parts[0];
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}

function formatBurndownDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Burndown points with date + worker metadata for tooltips */
export function getBurndownEvents(project: Project): BurndownEvent[] {
  const total = project.totalPoints;
  const startAt = new Date(project.createdAt).getTime();
  if (total <= 0) {
    return [{ remaining: 1, at: startAt, dateLabel: formatBurndownDate(project.createdAt) }];
  }

  const events: BurndownEvent[] = [
    { remaining: 1, at: startAt, dateLabel: formatBurndownDate(project.createdAt) },
  ];

  const doneTasks: {
    order: number;
    points: number;
    title: string;
    completedAt?: string;
    assignee?: string;
    crew?: string[];
  }[] = [];
  let order = 0;
  for (const story of project.stories) {
    for (const task of story.tasks) {
      if (task.status === 'done') {
        const sortKey = task.completedAt ? new Date(task.completedAt).getTime() : order;
        doneTasks.push({
          order: sortKey,
          points: task.points,
          title: task.title,
          completedAt: task.completedAt,
          assignee: task.assignee,
          crew: task.crew,
        });
      }
      order++;
    }
  }
  doneTasks.sort((a, b) => a.order - b.order);

  let remaining = total;
  for (const d of doneTasks) {
    remaining -= d.points;
    if (d.points < BURNDOWN_MIN_POINTS) continue;

    const remainingFrac = Math.max(0, remaining / total);
    const crew = d.crew?.map((n) => formatWorkerShort(n));
    events.push({
      remaining: remainingFrac,
      at: d.completedAt ? new Date(d.completedAt).getTime() : startAt,
      dateLabel: d.completedAt ? formatBurndownDate(d.completedAt) : 'Completed',
      taskTitle: d.title,
      crew: crew && crew.length > 0 ? crew : undefined,
      worker: !crew?.length && d.assignee ? formatWorkerShort(d.assignee) : undefined,
    });
  }

  const current = total === 0 ? 0 : remaining / total;
  const now = Date.now();
  if (Math.abs(events[events.length - 1].remaining - current) > 0.001) {
    events.push({
      remaining: current,
      at: now,
      dateLabel: 'Today',
    });
  }

  return events.length < 2
    ? [
        { remaining: 1, at: startAt, dateLabel: formatBurndownDate(project.createdAt) },
        { remaining: current, at: now, dateLabel: 'Today' },
      ]
    : events;
}

const MS_DAY = 86400000;

/** Linear finish projections from current remaining work */
export function getBurndownProjections(project: Project): BurndownProjection[] {
  const now = Date.now();
  const startMs = new Date(project.createdAt).getTime();
  const total = project.totalPoints;
  const remaining = Math.max(0, total - project.completedPoints);
  if (remaining <= 0 || total <= 0) return [];

  const thirtyMs = 30 * MS_DAY;
  let pointsLast30 = 0;
  for (const story of project.stories) {
    for (const task of story.tasks) {
      if (task.status === 'done' && task.completedAt) {
        const t = new Date(task.completedAt).getTime();
        if (t >= now - thirtyMs) pointsLast30 += task.points;
      }
    }
  }

  const projections: BurndownProjection[] = [];
  const pace30 = pointsLast30 / 30;
  if (pace30 > 0) {
    const endAt = now + (remaining / pace30) * MS_DAY;
    projections.push({
      kind: 'recent30',
      label: '30-day pace',
      endAt,
      endLabel: formatBurndownDate(new Date(endAt).toISOString()),
    });
  }

  const elapsedDays = Math.max(1, (now - startMs) / MS_DAY);
  const avgPace = project.completedPoints / elapsedDays;
  if (avgPace > 0) {
    const endAt = now + (remaining / avgPace) * MS_DAY;
    projections.push({
      kind: 'average',
      label: 'Avg project pace',
      endAt,
      endLabel: formatBurndownDate(new Date(endAt).toISOString()),
    });
  }

  return projections;
}

/** History uses most of the chart; projections extend into a dedicated forecast zone (avoids squashing actuals). */
export type BurndownChartScale = {
  histStart: number;
  histEnd: number;
  forecastEnd: number;
  forecastShare: number;
};

export function getBurndownChartScale(
  project: Project,
  projections: BurndownProjection[]
): BurndownChartScale {
  const now = Date.now();
  const histStart = new Date(project.createdAt).getTime();
  const maxProj = projections.length ? Math.max(...projections.map((p) => p.endAt)) : now;
  const forecastEnd = Math.min(Math.max(now + MS_DAY, maxProj), now + 120 * MS_DAY);
  return {
    histStart,
    histEnd: now,
    forecastEnd,
    forecastShare: projections.length > 0 ? 0.3 : 0,
  };
}

export function burndownTimeToX(
  at: number,
  scale: BurndownChartScale,
  padLeft: number,
  padRight: number,
  chartW: number
): number {
  const innerW = Math.max(1, chartW - padLeft - padRight);
  const { histStart, histEnd, forecastEnd, forecastShare } = scale;

  if (forecastShare <= 0) {
    const span = Math.max(MS_DAY, histEnd - histStart);
    const t = Math.min(Math.max(at, histStart), histEnd);
    return padLeft + ((t - histStart) / span) * innerW;
  }

  const histW = innerW * (1 - forecastShare);
  const forecastW = innerW * forecastShare;

  if (at <= histEnd) {
    const span = Math.max(MS_DAY, histEnd - histStart);
    const t = Math.max(at, histStart);
    return padLeft + ((t - histStart) / span) * histW;
  }

  const fSpan = Math.max(MS_DAY, forecastEnd - histEnd);
  const t = Math.min(at, forecastEnd);
  return padLeft + histW + ((t - histEnd) / fSpan) * forecastW;
}

/** Remaining-work fractions 1 → 0 in completion order. */
export function getBurndownSeries(project: Project): number[] {
  return getBurndownEvents(project).map((e) => e.remaining);
}

export function getCriticalPathSteps(project: Project): { title: string; status: string }[] {
  return project.stories.map((story, index) => {
    const done = story.tasks.filter((t) => t.status === 'done').length;
    const total = story.tasks.length;
    let status = 'Not started';
    if (done === total && total > 0) status = 'Complete';
    else if (done > 0) status = 'In progress';
    else {
      const priorBlocked = project.stories
        .slice(0, index)
        .some((s) => s.tasks.some((t) => t.status !== 'done'));
      if (priorBlocked) status = 'Blocked';
    }
    return { title: story.title, status };
  });
}

export type TimelineRow = {
  storyTitle: string;
  taskTitle: string;
  points: number;
  start?: string;
  end?: string;
  assignee?: string;
};

export function getTimelineRows(project: Project): TimelineRow[] {
  const rows: TimelineRow[] = [];
  project.stories.forEach((story) => {
    story.tasks.forEach((task) => {
      rows.push({
        storyTitle: story.title,
        taskTitle: task.title,
        points: task.points,
        start: task.scheduledStart,
        end: task.scheduledEnd,
        assignee: task.assignee,
      });
    });
  });
  return rows;
}

export function getDependencyChain(project: Project): Task[] {
  const all = project.stories.flatMap((s) => s.tasks);
  const withDeps = all.filter((t) => t.dependencies && t.dependencies.length > 0);
  if (withDeps.length === 0) {
    return project.stories.flatMap((s) => s.tasks).filter((t) => t.status !== 'done').slice(0, 4);
  }
  const chain: Task[] = [];
  let current: Task | undefined = withDeps.find((t) => !t.dependencies?.length) ?? withDeps[0];
  const seen = new Set<string>();
  while (current && !seen.has(current.id)) {
    chain.push(current);
    seen.add(current.id);
    const nextId: string | undefined = current.dependencies?.[0];
    current = nextId ? all.find((t) => t.id === nextId) : undefined;
  }
  return chain;
}
