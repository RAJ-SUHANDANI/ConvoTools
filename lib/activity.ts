"use client";

export type ActivityItem = {
  id: string;
  type: "upload" | "tool";
  title: string;
  description: string;
  timestamp: number;
  category?: string;
  filename?: string;
  size?: number;
  toolSlug?: string;
};

const ACTIVITY_KEY = "convotools.activity.v1";
const FAVORITES_KEY = "convotools.favorites.v1";
const PROFILE_KEY = "convotools.profile.v1";
const SETTINGS_KEY = "convotools.settings.v1";

export type ProfileData = { name: string; email: string };
export type UserSettings = { saveHistory: boolean; motion: boolean };

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function announceChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("convotools:local-data"));
  }
}

export function readActivity(): ActivityItem[] {
  return safeRead<ActivityItem[]>(ACTIVITY_KEY, []);
}

export function recordActivity(
  item: Omit<ActivityItem, "id" | "timestamp">
) {
  if (typeof window === "undefined") return;
  const settings = readSettings();
  if (!settings.saveHistory) return;
  const next: ActivityItem = {
    ...item,
    id: typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Date.now()) + Math.random().toString(16).slice(2),
    timestamp: Date.now(),
  };
  const current = readActivity();
  try {
    window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify([next, ...current].slice(0, 100)));
    announceChange();
  } catch {
    // Browser storage can be disabled or full; the file workflow still continues.
  }
}

export function clearActivity() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVITY_KEY);
  announceChange();
}

export function readFavorites(): string[] {
  return safeRead<string[]>(FAVORITES_KEY, []);
}

export function saveFavorites(favorites: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(favorites)]));
  announceChange();
}

export function readProfile(): ProfileData {
  return safeRead<ProfileData>(PROFILE_KEY, { name: "", email: "" });
}

export function saveProfile(profile: ProfileData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  announceChange();
}

export function readSettings(): UserSettings {
  return safeRead<UserSettings>(SETTINGS_KEY, { saveHistory: false, motion: true });
}

export function saveSettings(settings: UserSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  if (!settings.saveHistory) window.localStorage.removeItem(ACTIVITY_KEY);
  announceChange();
}

/** Removes only ConvoTools-owned workspace keys, never unrelated site storage. */
export function clearLocalWorkspace() {
  if (typeof window === "undefined") return;
  for (const key of [ACTIVITY_KEY, FAVORITES_KEY, PROFILE_KEY, SETTINGS_KEY]) {
    window.localStorage.removeItem(key);
  }
  announceChange();
}
