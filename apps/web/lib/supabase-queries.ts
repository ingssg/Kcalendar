import type { DayRecord, FoodEntry, UserProfile } from "@kcalendar/types";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type FoodEntryRow = {
  id: string;
  user_id: string;
  date: string;
  name: string;
  calories: number | null;
  is_estimated: boolean;
  meal_type: FoodEntry["mealType"] | null;
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
  return {
    id: row.id,
    name: row.name,
    calories: row.calories,
    isEstimated: row.is_estimated,
    ...(row.meal_type ? { mealType: row.meal_type } : {}),
  };
}

function calculateTotalCalories(entries: FoodEntry[]) {
  return entries.reduce((sum, entry) => sum + (entry.calories ?? 0), 0);
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

  return {
    date,
    entries,
    totalCalories: calculateTotalCalories(entries),
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
    .from("food_entries")
    .select(
      "id, user_id, date, name, calories, is_estimated, meal_type, created_at, updated_at",
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
    .from("food_entries")
    .select(
      "id, user_id, date, name, calories, is_estimated, meal_type, created_at, updated_at",
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
  const rows = entries.map((entry) => ({
    id: entry.id,
    user_id: userId,
    date,
    name: entry.name,
    calories: entry.calories,
    is_estimated: entry.isEstimated,
    meal_type: entry.mealType ?? null,
  }));

  const { error } = await supabase
    .from("food_entries")
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
    .from("food_entries")
    .update(nextPatch)
    .eq("id", entryId);

  if (error) {
    throw error;
  }
}

export async function removeFoodEntry(entryId: string) {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("food_entries")
    .delete()
    .eq("id", entryId);

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
