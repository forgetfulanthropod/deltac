/**
 * API client stub for Phase 7 — replace with real backend when deployed.
 * Endpoints: auth, projects sync, scope generation, vendor OAuth, orders.
 */

const API_BASE = process.env.EXPO_PUBLIC_DELTA_API_URL ?? '';

export async function apiHealth(): Promise<{ ok: boolean; message: string }> {
  if (!API_BASE) {
    return { ok: false, message: 'No API configured (local-only mode)' };
  }
  try {
    const res = await fetch(`${API_BASE}/health`);
    return { ok: res.ok, message: await res.text() };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : 'Network error' };
  }
}

export type ScopeGenerateRequest = {
  photoUris: string[];
  prompt: string;
  budgetBand?: string;
};

export type ScopeOption = {
  id: string;
  title: string;
  totalPoints: number;
  weeksEstimate: number;
};

/** Stub: returns rule-based options until AI service is connected */
export async function apiGenerateScope(
  req: ScopeGenerateRequest
): Promise<ScopeOption[]> {
  void req;
  return [
    { id: 'refresh', title: 'Refresh', totalPoints: 22, weeksEstimate: 3 },
    { id: 'mid', title: 'Mid-scale', totalPoints: 38, weeksEstimate: 6 },
    { id: 'full', title: 'Full remodel', totalPoints: 62, weeksEstimate: 12 },
  ];
}
