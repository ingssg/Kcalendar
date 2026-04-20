import type { DayRecord, FoodEntry, UserProfile } from "@kcalendar/types";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { calculateIntakeCalories, normalizeEntries } from "@/lib/entries";

type FoodEntryRow = {
  id: string;
  user_id: string;
  date: string;
  entry_type: FoodEntry["entryType"] | null;
  name: string;
  calories: number | null;
  is_estimated: boolean;
  meal_type: FoodEntry["mealType"] | null;
  activity_type: FoodEntry["activityType"] | null;
  duration_minutes: FoodEntry["durationMinutes"] | null;
  created_at: string;
  updated_at: string;
};

type UserProfileRow = {
  user_id: string;
  gender: UserProfile["gender"];
  height: number;
  weight: number;
  bmr: number;
  version: UserProfile["version"];
  created_at: string;
  updated_at: string;
};

function mapFoodEntryRow(row: FoodEntryRow): FoodEntry {
  return normalizeEntries([
    {
      id: row.id,
      entryType: row.entry_type ?? "food",
      name: row.name,
      calories: row.calories,
      isEstimated: row.is_estimated,
      ...(row.meal_type ? { mealType: row.meal_type } : {}),
      ...(row.activity_type ? { activityType: row.activity_type } : {}),
      ...(row.duration_minutes !== null
        ? { durationMinutes: row.duration_minutes }
        : {}),
    },
  ])[0];
}

export function buildDayRecord(
  date: string,
  entries: FoodEntry[],
  timestamps?: {
    createdAt?: string;
    updatedAt?: string;
  },
): DayRecord | null {
  if (entries.length === 0) {
    return null;
  }

  const normalizedEntries = normalizeEntries(entries);

  return {
    date,
    entries: normalizedEntries,
    totalCalories: calculateIntakeCalories(normalizedEntries),
    createdAt: timestamps?.createdAt ?? new Date().toISOString(),
    updatedAt:
      timestamps?.updatedAt ??
      timestamps?.createdAt ??
      new Date().toISOString(),
  };
}

export function buildWeeklyDayRecords(
  dates: string[],
  groupedEntries: Record<string, FoodEntry[]>,
): Record<string, DayRecord> {
  return dates.reduce<Record<string, DayRecord>>((records, date) => {
    const record = buildDayRecord(date, groupedEntries[date] ?? []);

    if (record) {
      records[date] = record;
    }

    return records;
  }, {});
}

export function mergeFoodEntries(
  remoteEntries: FoodEntry[],
  localEntries: FoodEntry[],
) {
  const merged = new Map<string, FoodEntry>();

  for (const entry of remoteEntries) {
    merged.set(entry.id, entry);
  }

  for (const entry of localEntries) {
    merged.set(entry.id, entry);
  }

  return Array.from(merged.values());
}

export async function fetchDayEntries(userId: string, date: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("entries")
    .select(
      "id, user_id, date, entry_type, name, calories, is_estimated, meal_type, activity_type, duration_minutes, created_at, updated_at",
    )
    .eq("user_id", userId)
    .eq("date", date)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapFoodEntryRow(row as FoodEntryRow));
}

export async function fetchWeekEntries(userId: string, dates: string[]) {
  if (dates.length === 0) {
    return {};
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("entries")
    .select(
      "id, user_id, date, entry_type, name, calories, is_estimated, meal_type, activity_type, duration_minutes, created_at, updated_at",
    )
    .eq("user_id", userId)
    .in("date", dates)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).reduce<Record<string, FoodEntry[]>>((grouped, row) => {
    const entry = mapFoodEntryRow(row as FoodEntryRow);
    const date = (row as FoodEntryRow).date;

    if (!grouped[date]) {
      grouped[date] = [];
    }

    grouped[date].push(entry);
    return grouped;
  }, {});
}

export async function insertFoodEntries(
  userId: string,
  date: string,
  entries: FoodEntry[],
) {
  const supabase = getSupabaseBrowserClient();
  const rows = normalizeEntries(entries).map((entry) => ({
    id: entry.id,
    user_id: userId,
    date,
    entry_type: entry.entryType,
    name: entry.name,
    calories: entry.calories,
    is_estimated: entry.isEstimated,
    meal_type: entry.entryType === "activity" ? null : (entry.mealType ?? null),
    activity_type:
      entry.entryType === "activity" ? (entry.activityType ?? null) : null,
    duration_minutes:
      entry.entryType === "activity" ? (entry.durationMinutes ?? null) : null,
  }));

  const { error } = await supabase
    .from("entries")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    throw error;
  }
}

export async function patchFoodEntry(
  entryId: string,
  patch: Partial<Pick<FoodEntry, "name" | "calories">>,
) {
  const supabase = getSupabaseBrowserClient();
  const nextPatch: Record<string, string | number | null> = {};

  if (patch.name !== undefined) {
    nextPatch.name = patch.name;
  }

  if (patch.calories !== undefined) {
    nextPatch.calories = patch.calories;
  }

  const { error } = await supabase
    .from("entries")
    .update(nextPatch)
    .eq("id", entryId);

  if (error) {
    throw error;
  }
}

export async function removeFoodEntry(entryId: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("entries").delete().eq("id", entryId);

  if (error) {
    throw error;
  }
}

export async function fetchProfile(
  userId: string,
): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select(
      "user_id, gender, height, weight, bmr, version, created_at, updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as UserProfileRow;

  return {
    version: row.version,
    gender: row.gender,
    height: Number(row.height),
    weight: Number(row.weight),
    bmr: row.bmr,
  };
}

export async function upsertProfile(userId: string, profile: UserProfile) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("user_profiles").upsert(
    {
      user_id: userId,
      gender: profile.gender,
      height: profile.height,
      weight: profile.weight,
      bmr: profile.bmr,
      version: profile.version,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw error;
  }
}
