import { useEffect } from 'react';

import { initProjectStore } from '@/lib/projectStore';

/** Ensures sample project + storage load on app start */
export function ProjectBootstrap() {
  useEffect(() => {
    initProjectStore();
  }, []);
  return null;
}
