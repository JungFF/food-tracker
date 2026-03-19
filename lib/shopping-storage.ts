// lib/shopping-storage.ts
const PLAN_HASH = 'default';
export const STORAGE_KEY = `shopping-checklist:v2:${PLAN_HASH}`;

export function getCheckedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function toggleItem(id: string): string[] {
  const current = getCheckedIds();
  const next = current.includes(id) ? current.filter((i) => i !== id) : [...current, id];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable — function still works but won't persist
  }
  return next;
}

export function resetChecklist(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
