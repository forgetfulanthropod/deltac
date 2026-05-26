import { storageGet, storageSet } from '@/lib/storage';

export type Persona = 'owner' | 'worker';

const KEY = 'delta_persona_v1';

export async function getPersonaAsync(): Promise<Persona | null> {
  const v = await storageGet(KEY);
  if (v === 'owner' || v === 'worker') return v;
  return null;
}

export function getPersona(): Persona | null {
  if (typeof window !== 'undefined') {
    try {
      const v = localStorage.getItem(KEY);
      if (v === 'owner' || v === 'worker') return v;
    } catch {
      /* ignore */
    }
  }
  return null;
}

export function setPersona(persona: Persona) {
  void storageSet(KEY, persona);
}
