import { useCallback, useEffect, useState } from 'react';

import { storageGet, storageSet } from '@/lib/storage';

export interface WorkerProfile {
  id: string;
  name: string;
  trade: string;
  serviceArea: string;
  availability: string;
}

const KEY = 'delta_worker_profile_v1';

let profile: WorkerProfile | null = null;
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach((fn) => fn());
}

export async function loadWorkerProfile() {
  const raw = await storageGet(KEY);
  if (raw) {
    try {
      profile = JSON.parse(raw);
    } catch {
      profile = null;
    }
  }
  notify();
}

export function getWorkerProfile(): WorkerProfile | null {
  return profile;
}

export function saveWorkerProfile(data: Omit<WorkerProfile, 'id'> & { id?: string }) {
  profile = {
    id: data.id ?? 'worker-1',
    name: data.name || 'Field Pro',
    trade: data.trade,
    serviceArea: data.serviceArea,
    availability: data.availability,
  };
  void storageSet(KEY, JSON.stringify(profile));
  notify();
}

export function useWorkerProfile() {
  const [, tick] = useState(0);
  const refresh = useCallback(() => tick((n) => n + 1), []);

  useEffect(() => {
    void loadWorkerProfile();
    listeners.push(refresh);
    return () => {
      listeners = listeners.filter((l) => l !== refresh);
    };
  }, [refresh]);

  return { profile, saveWorkerProfile };
}
