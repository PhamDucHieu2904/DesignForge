const STORAGE_KEY = 'designforge:saved:v1';

export function readSaved(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) && parsed.every(value => typeof value === 'string') ? parsed : [];
  } catch { return []; }
}

export function writeSaved(ids: string[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch { /* in-memory state remains useful */ }
}
