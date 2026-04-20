import type { FoodEntry } from "@kcalendar/types";

export function isActivityEntry(entry: FoodEntry) {
  if (entry.entryType) {
    return entry.entryType === "activity";
  }

  if (entry.activityType || entry.durationMinutes !== undefined) {
    return true;
  }

  if (entry.mealType) {
    return false;
  }

  return (entry.calories ?? 0) < 0;
}

export function normalizeEntry(entry: FoodEntry): FoodEntry {
  const entryType = isActivityEntry(entry) ? "activity" : "food";
  const calories =
    entryType === "activity" && entry.calories !== null
      ? Math.abs(entry.calories)
      : entry.calories;

  if (entryType === "activity") {
    return {
      ...entry,
      entryType,
      calories,
      mealType: undefined,
    };
  }

  return {
    ...entry,
    entryType,
    calories,
  };
}

export function normalizeEntries(entries: FoodEntry[]) {
  return entries.map(normalizeEntry);
}

export function calculateIntakeCalories(entries: FoodEntry[]) {
  return normalizeEntries(entries).reduce((sum, entry) => {
    if (isActivityEntry(entry)) {
      return sum;
    }

    return sum + (entry.calories ?? 0);
  }, 0);
}

export function hasIntakeEntries(entries: FoodEntry[]) {
  return normalizeEntries(entries).some((entry) => !isActivityEntry(entry));
}

export function calculateBurnCalories(entries: FoodEntry[]) {
  return normalizeEntries(entries).reduce((sum, entry) => {
    if (!isActivityEntry(entry)) return sum;
    return sum + (entry.calories ?? 0);
  }, 0);
}
