import type { AppStorage, DayRecord, FoodEntry } from "@kcalendar/types";

const STORAGE_KEY = "kcalendar";

export const defaultStorage: AppStorage = {
  version: 1,
  profile: null,
  records: {},
};

const listeners = new Set<() => void>();
let cachedRaw: string | null = null;
let cachedStorage: AppStorage = defaultStorage;

function emitStorageChange() {
  listeners.forEach((listener) => listener());
}

export function subscribeStorage(listener: () => void): () => void {
  listeners.add(listener);

  if (typeof window === "undefined") {
    return () => listeners.delete(listener);
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getStorage(): AppStorage {
  if (typeof window === "undefined") return defaultStorage;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedRaw = null;
      cachedStorage = defaultStorage;
      return defaultStorage;
    }

    if (raw === cachedRaw) {
      return cachedStorage;
    }

    const parsed = JSON.parse(raw) as AppStorage;
    const migrated = migrateIfNeeded(parsed);
    cachedRaw = raw;
    cachedStorage = migrated;
    return migrated;
  } catch {
    cachedRaw = null;
    cachedStorage = defaultStorage;
    return defaultStorage;
  }
}

export function setStorage(storage: AppStorage): void {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(storage);
  cachedRaw = raw;
  cachedStorage = storage;
  localStorage.setItem(STORAGE_KEY, raw);
  emitStorageChange();
}

export function clearStoredProfile(): void {
  const storage = getStorage();

  if (!storage.profile) {
    return;
  }

  setStorage({
    ...storage,
    profile: null,
  });
}

export function clearStoredRecords(): void {
  const storage = getStorage();

  if (Object.keys(storage.records).length === 0) {
    return;
  }

  setStorage({
    ...storage,
    records: {},
  });
}

export function getDayRecord(date: string): DayRecord | null {
  const storage = getStorage();
  return storage.records[date] ?? null;
}

export function saveDayRecord(record: DayRecord): void {
  const storage = getStorage();
  setStorage({
    ...storage,
    records: {
      ...storage.records,
      [record.date]: record,
    },
  });
}

export function addFoodEntries(
  date: string,
  newEntries: FoodEntry[],
): DayRecord {
  const existing = getDayRecord(date);
  const now = new Date().toISOString();
  const entries = [...(existing?.entries ?? []), ...newEntries];
  const totalCalories = entries.reduce((sum, e) => sum + (e.calories ?? 0), 0);

  const record: DayRecord = {
    date,
    entries,
    totalCalories,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  saveDayRecord(record);
  return record;
}

export function updateFoodEntryCalories(
  date: string,
  entryId: string,
  calories: number,
): DayRecord | null {
  return updateFoodEntry(date, entryId, { calories });
}

export function updateFoodEntry(
  date: string,
  entryId: string,
  patch: Partial<Pick<FoodEntry, "name" | "calories">>,
): DayRecord | null {
  const record = getDayRecord(date);
  if (!record) return null;

  const entries = record.entries.map((e) =>
    e.id === entryId ? { ...e, ...patch } : e,
  );
  const totalCalories = entries.reduce((sum, e) => sum + (e.calories ?? 0), 0);
  const updated: DayRecord = {
    ...record,
    entries,
    totalCalories,
    updatedAt: new Date().toISOString(),
  };

  saveDayRecord(updated);
  return updated;
}

export function deleteFoodEntry(
  date: string,
  entryId: string,
): DayRecord | null {
  const record = getDayRecord(date);
  if (!record) return null;

  const entries = record.entries.filter((e) => e.id !== entryId);
  const totalCalories = entries.reduce((sum, e) => sum + (e.calories ?? 0), 0);
  const updated: DayRecord = {
    ...record,
    entries,
    totalCalories,
    updatedAt: new Date().toISOString(),
  };

  saveDayRecord(updated);
  return updated;
}

// 스키마 버전 마이그레이션 — v1이 현재 최신이므로 변환 없음
function migrateIfNeeded(storage: AppStorage): AppStorage {
  if (storage.version === 1) return storage;
  // 향후 버전 추가 시 여기서 처리
  return defaultStorage;
}
