import { useState, useEffect, useCallback } from 'react';

import { storageGet, storageSet } from '@/lib/storage';
import { getWorkerProfile, loadWorkerProfile } from '@/lib/workerStore';

// Core types matching the README data model
export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Material {
  sku: string;
  name: string;
  vendor: 'Home Depot' | 'Amazon' | 'Other';
  price: number;
  status: 'recommended' | 'in-cart' | 'ordered';
}

export interface Task {
  id: string;
  title: string;
  points: number;
  status: TaskStatus;
  assignee?: string;
  dependencies?: string[];
  materials?: Material[];
  completedAt?: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  /** Field / scope reference photo (URI or data URL) */
  photoUri?: string;
  /** Multi-person crew for large field tasks (burndown shows all names) */
  crew?: string[];
}

export interface Story {
  id: string;
  title: string;
  tasks: Task[];
  status: 'not-started' | 'in-progress' | 'complete';
}

export interface Project {
  id: string;
  name: string;
  spaceType: string;
  targetTimeline: string;
  vision?: string;           // e.g. "Warm Scandinavian"
  createdAt: string;
  stories: Story[];
  totalPoints: number;
  completedPoints: number;
  sourcingConnected: {
    'Home Depot': boolean;
    Amazon: boolean;
  };
  orders: {
    id: string;
    items: number;
    total: number;
    date: string;
  }[];
  address?: string;
  budgetBand?: string;
  notes?: string;
}

const STORAGE_KEY = 'delta_projects_v1';

let projects: Project[] = [];
let listeners: (() => void)[] = [];
let storeReady = false;

function saveToStorage() {
  void storageSet(STORAGE_KEY, JSON.stringify(projects));
}

async function loadFromStorage() {
  const raw = await storageGet(STORAGE_KEY);
  if (!raw) {
    projects = [];
    return;
  }
  try {
    projects = JSON.parse(raw);
  } catch {
    projects = [];
  }
}

function recalcProjectPoints(proj: Project) {
  proj.totalPoints = proj.stories.reduce(
    (sum, s) => sum + s.tasks.reduce((tSum, t) => tSum + t.points, 0),
    0
  );
  proj.completedPoints = proj.stories.reduce(
    (sum, s) =>
      sum + s.tasks.filter((t) => t.status === 'done').reduce((tSum, t) => tSum + t.points, 0),
    0
  );
}

function notify() {
  listeners.forEach(fn => fn());
}

function recalcStoryStatuses(proj: Project) {
  proj.stories.forEach((story) => {
    const total = story.tasks.length;
    const done = story.tasks.filter((t) => t.status === 'done').length;
    if (done === total && total > 0) story.status = 'complete';
    else if (done > 0 || story.tasks.some((t) => t.status === 'in-progress'))
      story.status = 'in-progress';
    else story.status = 'not-started';
  });
}

const DEFAULT_MATERIALS: Material[] = [
  { sku: 'HD-88421', name: 'Recessed LED 6"', vendor: 'Home Depot', price: 18, status: 'recommended' },
  { sku: 'AMZ-BS22', name: 'Backsplash tile 3x6', vendor: 'Amazon', price: 42, status: 'recommended' },
  { sku: 'HD-22109', name: 'Dimmer switches (4)', vendor: 'Home Depot', price: 29, status: 'recommended' },
];

export function ensureProjectMaterials(projectId: string) {
  const proj = projects.find((p) => p.id === projectId);
  if (!proj) return;

  let i = 0;
  proj.stories.forEach((story) => {
    story.tasks.forEach((task) => {
      if (!task.materials?.length) {
        const mat = DEFAULT_MATERIALS[i % DEFAULT_MATERIALS.length];
        task.materials = [{ ...mat }];
        i++;
      }
    });
  });
  saveToStorage();
}

export function isStoreReady() {
  return storeReady;
}

export async function initProjectStoreAsync() {
  await loadWorkerProfile();
  await loadFromStorage();
  ensureSampleProject();
  ensureProjectMaterials('sample-90');
  assignSampleWorkerTasks();
  storeReady = true;
  notify();
}

export function initProjectStore() {
  void initProjectStoreAsync();
}

function assignSampleWorkerTasks() {
  const proj = projects.find((p) => p.id === 'sample-90');
  if (!proj) return;
  const workerName = getWorkerProfile()?.name ?? 'Field Pro';
  const open = ['t10', 't11', 't13', 't14', 't15'];
  proj.stories.forEach((s) =>
    s.tasks.forEach((t) => {
      if (open.includes(t.id)) t.assignee = workerName;
    })
  );
}

export function getProjects(): Project[] {
  return [...projects];
}

export function getProject(id: string): Project | undefined {
  return projects.find(p => p.id === id);
}

export function createProjectFromVision(params: {
  name: string;
  spaceType: string;
  targetTimeline: string;
  vision: string;
  stories: Story[];
  address?: string;
  budgetBand?: string;
  notes?: string;
}): Project {
  const totalPoints = params.stories.reduce(
    (sum, s) => sum + s.tasks.reduce((tSum, t) => tSum + t.points, 0),
    0
  );

  const completedPoints = params.stories.reduce(
    (sum, s) => sum + s.tasks.filter(t => t.status === 'done').reduce((tSum, t) => tSum + t.points, 0),
    0
  );

  const newProject: Project = {
    id: 'proj-' + Date.now().toString(36),
    name: params.name,
    spaceType: params.spaceType,
    targetTimeline: params.targetTimeline,
    vision: params.vision,
    address: params.address,
    budgetBand: params.budgetBand,
    notes: params.notes,
    createdAt: new Date().toISOString(),
    stories: params.stories,
    totalPoints,
    completedPoints,
    sourcingConnected: { 'Home Depot': false, Amazon: false },
    orders: [],
  };

  projects = [newProject, ...projects];
  ensureProjectMaterials(newProject.id);
  saveToStorage();
  notify();
  return newProject;
}

/** First burndown drop after project start — full demolition, 4-person crew */
export const SAMPLE_DEMOLITION_CREW = ['Mike Torres', 'J. Smith', 'Ana Rivera', 'Derek Chen'];

const SAMPLE_DONE_ASSIGNEES: Record<string, string> = {
  t1: 'Mike Torres',
  t2: 'Mike Torres',
  t3: 'J. Smith',
  t4: 'J. Smith',
  t5: 'J. Smith',
  t6: 'Ana Rivera',
  t7: 'Ana Rivera',
  t8: 'Ana Rivera',
  t9: 'Field Pro',
  t12: 'Field Pro',
};

function patchSampleBurndownTimestamps(proj: Project) {
  const doneAt = (dayOffset: number) =>
    new Date(Date.now() - (42 - dayOffset) * 86400000).toISOString();
  let changed = false;
  const alignedStart = doneAt(42);
  if (proj.createdAt !== alignedStart) {
    proj.createdAt = alignedStart;
    changed = true;
  }

  const offsets: Record<string, number> = {
    t1: 2,
    t2: 5,
    t3: 10,
    t4: 14,
    t5: 18,
    t6: 22,
    t7: 26,
    t8: 30,
    t9: 34,
    t12: 36,
  };
  proj.stories.forEach((s) =>
    s.tasks.forEach((t) => {
      if (t.status === 'done' && !t.completedAt && offsets[t.id]) {
        t.completedAt = doneAt(offsets[t.id]);
        changed = true;
      }
      if (t.status === 'done' && !t.assignee && SAMPLE_DONE_ASSIGNEES[t.id]) {
        t.assignee = SAMPLE_DONE_ASSIGNEES[t.id];
        changed = true;
      }
      if (t.id === 't2') {
        if (t.title !== 'Full demolition') {
          t.title = 'Full demolition';
          changed = true;
        }
        if (t.points !== 18) {
          t.points = 18;
          changed = true;
        }
        if (!t.crew || t.crew.length < 4) {
          t.crew = [...SAMPLE_DEMOLITION_CREW];
          changed = true;
        }
      }
    })
  );
  if (changed) {
    recalcProjectPoints(proj);
    saveToStorage();
  }
}

// Seed the rich 90% sample if it doesn't exist
export function ensureSampleProject() {
  const existing = projects.find((p) => p.id === 'sample-90');
  if (existing) {
    patchSampleBurndownTimestamps(existing);
    return;
  }

  const doneAt = (dayOffset: number) =>
    new Date(Date.now() - (42 - dayOffset) * 86400000).toISOString();
  const projectStart = doneAt(42);

  // This is a simplified but much richer version of the breakdown doc
  const sampleStories: Story[] = [
    {
      id: 's1',
      title: 'Site Protection & Demolition',
      status: 'complete',
      tasks: [
        {
          id: 't1',
          title: 'Protect floors and adjacent rooms',
          points: 3,
          status: 'done',
          completedAt: doneAt(2),
        },
        {
          id: 't2',
          title: 'Full demolition',
          points: 18,
          status: 'done',
          completedAt: doneAt(5),
          crew: [...SAMPLE_DEMOLITION_CREW],
          assignee: 'Mike Torres',
        },
      ],
    },
    {
      id: 's2',
      title: 'Electrical & Lighting Rough-In',
      status: 'complete',
      tasks: [
        { id: 't3', title: 'Run new circuits for appliances', points: 7, status: 'done', completedAt: doneAt(10) },
        {
          id: 't4',
          title: 'Install recessed cans + under-cabinet rough-in',
          points: 10,
          status: 'done',
          completedAt: doneAt(14),
        },
        { id: 't5', title: 'Electrical inspection', points: 5, status: 'done', completedAt: doneAt(18) },
      ],
    },
    {
      id: 's5',
      title: 'Cabinet Installation',
      status: 'complete',
      tasks: [
        {
          id: 't6',
          title: 'Install base and wall cabinets (white oak)',
          points: 12,
          status: 'done',
          completedAt: doneAt(22),
        },
        { id: 't7', title: 'Install island + hardware', points: 8, status: 'done', completedAt: doneAt(26) },
        { id: 't8', title: 'Crown + light rail', points: 5, status: 'done', completedAt: doneAt(30) },
      ],
    },
    {
      id: 's6',
      title: 'Countertops & Backsplash',
      status: 'in-progress',
      tasks: [
        {
          id: 't9',
          title: 'Install light stone countertops',
          points: 6,
          status: 'done',
          completedAt: doneAt(34),
        },
        { id: 't10', title: 'Install white subway backsplash (3x6)', points: 8, status: 'in-progress' },
        { id: 't11', title: 'Grout and seal surfaces', points: 6, status: 'todo' },
      ],
    },
    {
      id: 's8',
      title: 'Final Finishes & Appliances',
      status: 'in-progress',
      tasks: [
        { id: 't12', title: 'Final paint touch-ups', points: 4, status: 'done', completedAt: doneAt(36) },
        { id: 't13', title: 'Install brushed brass hardware', points: 3, status: 'todo' },
        { id: 't14', title: 'Install range, dishwasher, fridge', points: 5, status: 'todo' },
        { id: 't15', title: 'Punch list + final clean', points: 6, status: 'todo' },
      ],
    },
  ];

  sampleStories.forEach((s) =>
    s.tasks.forEach((t) => {
      if (t.status === 'done' && SAMPLE_DONE_ASSIGNEES[t.id]) {
        t.assignee = SAMPLE_DONE_ASSIGNEES[t.id];
      }
      if (t.id === 't2') {
        t.crew = [...SAMPLE_DEMOLITION_CREW];
      }
    })
  );

  const total = sampleStories.reduce((s, st) => s + st.tasks.reduce((t, ta) => t + ta.points, 0), 0);
  const done = sampleStories.reduce((s, st) => s + st.tasks.filter(t => t.status === 'done').reduce((t, ta) => t + ta.points, 0), 0);

  const sample: Project = {
    id: 'sample-90',
    name: 'Kitchen Refresh 2025',
    spaceType: 'Kitchen',
    targetTimeline: '6 weeks',
    vision: 'Warm Scandinavian',
    createdAt: projectStart,
    stories: sampleStories,
    totalPoints: total,
    completedPoints: done,
    sourcingConnected: { 'Home Depot': true, Amazon: false },
    orders: [
      { id: 'ord1', items: 12, total: 1240, date: '2025-05-18' },
    ],
  };

  projects = [sample, ...projects.filter(p => p.id !== 'sample-90')];
  saveToStorage();
  notify();
}

export function updateTaskStatus(projectId: string, taskId: string, status: TaskStatus) {
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;

  let changed = false;
  proj.stories.forEach(story => {
    story.tasks.forEach(task => {
      if (task.id === taskId && task.status !== status) {
        task.status = status;
        if (status === 'done') {
          task.completedAt = new Date().toISOString();
          if (!task.assignee) {
            task.assignee = getWorkerProfile()?.name ?? 'Project Owner';
          }
        } else {
          delete task.completedAt;
        }
        changed = true;
      }
    });
  });

  if (changed) {
    proj.completedPoints = proj.stories.reduce(
      (sum, s) => sum + s.tasks.filter(t => t.status === 'done').reduce((tSum, t) => tSum + t.points, 0),
      0
    );
    recalcStoryStatuses(proj);
    saveToStorage();
    notify();
  }
}

export function toggleTaskDone(projectId: string, taskId: string) {
  const proj = projects.find((p) => p.id === projectId);
  if (!proj) return;
  let current: TaskStatus | undefined;
  for (const story of proj.stories) {
    for (const task of story.tasks) {
      if (task.id === taskId) {
        current = task.status;
        break;
      }
    }
    if (current) break;
  }
  if (!current) return;
  const next: TaskStatus = current === 'done' ? 'todo' : 'done';
  updateTaskStatus(projectId, taskId, next);
}

export function getProjectMaterials(project: Project): Material[] {
  const mats: Material[] = [];
  project.stories.forEach((story) => {
    story.tasks.forEach((task) => {
      task.materials?.forEach((m) => mats.push(m));
    });
  });
  return mats;
}

export function getCartSummary(project: Project) {
  const mats = getProjectMaterials(project).filter((m) => m.status !== 'ordered');
  const total = mats.reduce((s, m) => s + m.price, 0);
  return { count: mats.length, total };
}

export function connectVendor(projectId: string, vendor: 'Home Depot' | 'Amazon') {
  const proj = projects.find((p) => p.id === projectId);
  if (!proj) return;
  proj.sourcingConnected[vendor] = !proj.sourcingConnected[vendor];
  saveToStorage();
  notify();
}

export function orderMaterialsForStory(projectId: string, storyId: string) {
  const proj = projects.find((p) => p.id === projectId);
  if (!proj) return;
  const story = proj.stories.find((s) => s.id === storyId);
  if (!story) return;
  let itemCount = 0;
  let total = 0;
  story.tasks.forEach((task) => {
    task.materials?.forEach((mat) => {
      if (mat.status !== 'ordered') {
        mat.status = 'ordered';
        itemCount++;
        total += mat.price;
      }
    });
  });
  if (itemCount > 0) {
    proj.orders.push({
      id: 'ord-' + Date.now(),
      items: itemCount,
      total,
      date: new Date().toISOString().split('T')[0],
    });
    saveToStorage();
    notify();
  }
}

export function addStory(projectId: string, title: string) {
  const proj = projects.find((p) => p.id === projectId);
  if (!proj) return;
  proj.stories.push({
    id: 'story-' + Date.now().toString(36),
    title,
    tasks: [],
    status: 'not-started',
  });
  recalcProjectPoints(proj);
  recalcStoryStatuses(proj);
  saveToStorage();
  notify();
}

export function updateStoryTitle(projectId: string, storyId: string, title: string) {
  const proj = projects.find((p) => p.id === projectId);
  const story = proj?.stories.find((s) => s.id === storyId);
  if (!story) return;
  story.title = title;
  saveToStorage();
  notify();
}

export function deleteStory(projectId: string, storyId: string) {
  const proj = projects.find((p) => p.id === projectId);
  if (!proj) return;
  proj.stories = proj.stories.filter((s) => s.id !== storyId);
  recalcProjectPoints(proj);
  saveToStorage();
  notify();
}

export function addTask(
  projectId: string,
  storyId: string,
  title: string,
  points: number,
  photoUri?: string
) {
  const proj = projects.find((p) => p.id === projectId);
  if (!proj) return;
  const story = proj.stories.find((s) => s.id === storyId);
  if (!story) return;
  story.tasks.push({
    id: 'task-' + Date.now().toString(36),
    title,
    points,
    status: 'todo',
    dependencies: [],
    ...(photoUri ? { photoUri } : {}),
  });
  recalcProjectPoints(proj);
  recalcStoryStatuses(proj);
  saveToStorage();
  notify();
}

export function updateTask(
  projectId: string,
  taskId: string,
  patch: Partial<
    Pick<Task, 'title' | 'points' | 'assignee' | 'scheduledStart' | 'scheduledEnd' | 'dependencies' | 'photoUri'>
  >
) {
  const proj = projects.find((p) => p.id === projectId);
  if (!proj) return;
  for (const story of proj.stories) {
    const task = story.tasks.find((t) => t.id === taskId);
    if (task) {
      Object.assign(task, patch);
      recalcProjectPoints(proj);
      saveToStorage();
      notify();
      return;
    }
  }
}

export function deleteTask(projectId: string, storyId: string, taskId: string) {
  const proj = projects.find((p) => p.id === projectId);
  const story = proj?.stories.find((s) => s.id === storyId);
  if (!story) return;
  story.tasks = story.tasks.filter((t) => t.id !== taskId);
  recalcProjectPoints(proj!);
  recalcStoryStatuses(proj!);
  saveToStorage();
  notify();
}

export function assignTask(projectId: string, taskId: string, assignee: string) {
  updateTask(projectId, taskId, { assignee });
}

export function getAllProjectIds(): string[] {
  return projects.map((p) => p.id);
}

export function acceptAllOrders(projectId: string) {
  const proj = projects.find(p => p.id === projectId);
  if (!proj) return;

  let itemCount = 0;
  let total = 0;

  proj.stories.forEach(story => {
    story.tasks.forEach(task => {
      task.materials?.forEach(mat => {
        if (mat.status !== 'ordered') {
          mat.status = 'ordered';
          itemCount++;
          total += mat.price;
        }
      });
    });
  });

  if (itemCount > 0) {
    proj.orders.push({
      id: 'ord-' + Date.now(),
      items: itemCount,
      total,
      date: new Date().toISOString().split('T')[0],
    });
    saveToStorage();
    notify();
  }
}

function subscribe(refresh: () => void) {
  listeners.push(refresh);
  return () => {
    listeners = listeners.filter((l) => l !== refresh);
  };
}

export function useProjects() {
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  useEffect(() => {
    void initProjectStoreAsync();
    return subscribe(refresh);
  }, [refresh]);

  return {
    projects: getProjects(),
    ready: storeReady,
    getProject,
    createProjectFromVision,
    updateTaskStatus,
    toggleTaskDone,
    connectVendor,
    acceptAllOrders,
    orderMaterialsForStory,
    addStory,
    updateStoryTitle,
    deleteStory,
    addTask,
    updateTask,
    deleteTask,
    assignTask,
  };
}

export function useProject(projectId: string | undefined) {
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  useEffect(() => {
    void initProjectStoreAsync();
    return subscribe(refresh);
  }, [refresh]);

  const project = projectId ? getProject(projectId) : undefined;
  return {
    project,
    ready: storeReady,
    toggleTaskDone: (taskId: string) => projectId && toggleTaskDone(projectId, taskId),
    connectVendor: (vendor: 'Home Depot' | 'Amazon') =>
      projectId && connectVendor(projectId, vendor),
    acceptAllOrders: () => projectId && acceptAllOrders(projectId),
    orderMaterialsForStory: (storyId: string) =>
      projectId && orderMaterialsForStory(projectId, storyId),
    addStory: (title: string) => projectId && addStory(projectId, title),
    updateStoryTitle: (storyId: string, title: string) =>
      projectId && updateStoryTitle(projectId, storyId, title),
    deleteStory: (storyId: string) => projectId && deleteStory(projectId, storyId),
    addTask: (storyId: string, title: string, points: number, photoUri?: string) =>
      projectId && addTask(projectId, storyId, title, points, photoUri),
    updateTask: (taskId: string, patch: Parameters<typeof updateTask>[2]) =>
      projectId && updateTask(projectId, taskId, patch),
    deleteTask: (storyId: string, taskId: string) =>
      projectId && deleteTask(projectId, storyId, taskId),
    assignTask: (taskId: string, assignee: string) =>
      projectId && assignTask(projectId, taskId, assignee),
  };
}
