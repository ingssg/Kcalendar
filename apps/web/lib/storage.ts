import type { AppStorage, DayRecord, FoodEntry } from "@kcalendar/types";

const STORAGE_KEY = "kcalendar";

const defaultStorage: AppStorage = {
  version: 1,
  profile: null,
  records: {},
};

export function getStorage(): AppStorage {
  if (typeof window === "undefined") return defaultStorage;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStorage;
    const parsed = JSON.parse(raw) as AppStorage;
    return migrateIfNeeded(parsed);
  } catch {
    return defaultStorage;
  }
}

export function setStorage(storage: AppStorage): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

export function getDayRecord(date: string): DayRecord | null {
  const storage = getStorage();
  return storage.records[date] ?? null;
}

export function saveDayRecord(record: DayRecord): void {
  const storage = getStorage();
  storage.records[record.date] = record;
  setStorage(storage);
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
