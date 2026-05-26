import type { Project } from '@/lib/projectStore';

export type GalleryView = {
  source: number | { uri: string };
  /** Zoom + pan within the tile to simulate another camera angle */
  focus?: { scale: number; offsetX: number; offsetY: number };
};

const VISION_IMAGE: Record<string, number> = {
  'Warm Scandinavian': require('@/assets/images/imagine/scandinavian.jpg'),
  'Modern Organic': require('@/assets/images/imagine/organic.jpg'),
  'Japandi Calm': require('@/assets/images/imagine/japandi.jpg'),
  'Bright Coastal': require('@/assets/images/imagine/coastal.jpg'),
  'Moody Elegant': require('@/assets/images/imagine/moody.jpg'),
};

/** Multiple framed crops of the same finished render — one kitchen, several views */
const KITCHEN_VIEW_FRAMES: Array<Pick<GalleryView, 'focus'>> = [
  { focus: { scale: 1, offsetX: 0, offsetY: 0 } },
  { focus: { scale: 1.48, offsetX: 52, offsetY: 28 } },
  { focus: { scale: 1.62, offsetX: 108, offsetY: 12 } },
  { focus: { scale: 1.42, offsetX: 24, offsetY: 56 } },
];

function finishedKitchenSource(project: Project): number {
  if (project.vision && VISION_IMAGE[project.vision]) {
    return VISION_IMAGE[project.vision];
  }
  return VISION_IMAGE['Warm Scandinavian'];
}

/** Gallery slides for a story — sample / vision projects use one finish render, multiple views */
export function getStoryGalleryViews(project: Project, storyId: string, count = 3): GalleryView[] {
  const source = finishedKitchenSource(project);
  const seed = Array.from(storyId).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const frames = KITCHEN_VIEW_FRAMES;
  const start = seed % frames.length;

  return Array.from({ length: count }, (_, i) => {
    const frame = frames[(start + i) % frames.length];
    return { source, focus: frame.focus };
  });
}

export function getProjectCoverImage(project: Project): number | undefined {
  if (!project.vision) return undefined;
  return VISION_IMAGE[project.vision];
}
