export type SavedReading = {
  id: string; // session_id
  timestamp_iso: string;
  input: any; // ReadingInput used
  output: any; // ReadingOutput
  seed: string | number;
  reflection?: string;
  reminderAt?: string; // ISO
  remindedAt?: string; // ISO when notification fired
};

const KEY = "tof_readings_v1";
const USER_KEY = "tof_user_id";
const PRIVATE_KEY = "tof_private_mode";

export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "web";
  let id = localStorage.getItem(USER_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_KEY, id);
  }
  return id;
}

export function listSaved(): SavedReading[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedReading[]) : [];
  } catch {
    return [];
  }
}

export function getPrivateMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PRIVATE_KEY) === "1";
}

export function setPrivateMode(on: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PRIVATE_KEY, on ? "1" : "0");
}

export function saveReading(r: SavedReading, keep = 3): void {
  if (typeof window === "undefined") return;
  const list = listSaved();
  const next = [r, ...list.filter((x) => x.id !== r.id)].slice(0, keep);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function updateReading(id: string, patch: Partial<SavedReading>) {
  if (typeof window === "undefined") return;
  const list = listSaved();
  const next = list.map((x) => (x.id === id ? { ...x, ...patch } : x));
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function getReading(id: string): SavedReading | undefined {
  return listSaved().find((x) => x.id === id);
}

export function deleteReading(id: string) {
  if (typeof window === "undefined") return;
  const list = listSaved();
  const next = list.filter((x) => x.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
}
