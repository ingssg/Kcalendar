import type { User } from "@supabase/supabase-js";
import type { FoodEntry, UserProfile } from "@kcalendar/types";
import {
  clearStoredProfile,
  clearStoredRecords,
  getStorage,
} from "@/lib/storage";
import {
  fetchProfile,
  fetchWeekEntries,
  insertFoodEntries,
  upsertProfile,
} from "@/lib/supabase-queries";

const STORAGE_KEY = "kcalendar";
const LAST_MERGED_AT_KEY = "kcalendar_migrated_at";
const MIGRATION_LOCK_NAME = "kcalendar-migrate";

export type MergePreview = {
  localProfile: UserProfile | null;
  remoteProfile: UserProfile | null;
  hasPendingProfile: boolean;
  pendingEntryDates: string[];
  pendingEntryCount: number;
};

type MergeOptions = {
  mergeProfile: boolean;
  mergeEntries: boolean;
};

function backupLocalStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return;
  }

  localStorage.setItem(`kcalendar_backup_${Date.now()}`, raw);
}

function markMigrated() {
  localStorage.setItem(LAST_MERGED_AT_KEY, new Date().toISOString());
}

function profilesEqual(left: UserProfile | null, right: UserProfile | null) {
  if (!left && !right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return (
    left.version === right.version &&
    left.gender === right.gender &&
    left.height === right.height &&
    left.weight === right.weight &&
    left.bmr === right.bmr
  );
}

function getPendingEntriesByDate(
  localRecords: ReturnType<typeof getStorage>["records"],
  remoteEntriesByDate: Record<string, FoodEntry[]>,
) {
  return Object.entries(localRecords).reduce<Record<string, FoodEntry[]>>(
    (acc, [date, record]) => {
      const remoteIds = new Set(
        (remoteEntriesByDate[date] ?? []).map((entry) => entry.id),
      );
      const pendingEntries = record.entries.filter(
        (entry) => !remoteIds.has(entry.id),
      );

      if (pendingEntries.length > 0) {
        acc[date] = pendingEntries;
      }

      return acc;
    },
    {},
  );
}

async function loadMergePreview(userId: string): Promise<MergePreview> {
  const storage = getStorage();
  const localProfile = storage.profile;
  const localDates = Object.entries(storage.records)
    .filter(([, record]) => record.entries.length > 0)
    .map(([date]) => date);

  const [remoteProfile, remoteEntriesByDate] = await Promise.all([
    fetchProfile(userId),
    localDates.length > 0
      ? fetchWeekEntries(userId, localDates)
      : Promise.resolve({}),
  ]);

  const pendingEntriesByDate = getPendingEntriesByDate(
    storage.records,
    remoteEntriesByDate,
  );
  const pendingEntryDates = Object.keys(pendingEntriesByDate);
  const pendingEntryCount = pendingEntryDates.reduce(
    (sum, date) => sum + pendingEntriesByDate[date].length,
    0,
  );

  return {
    localProfile,
    remoteProfile,
    hasPendingProfile: !profilesEqual(localProfile, remoteProfile),
    pendingEntryDates,
    pendingEntryCount,
  };
}

export async function getMergePreview(user: Pick<User, "id">) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const preview = await loadMergePreview(user.id);

    if (!preview.hasPendingProfile && preview.pendingEntryCount === 0) {
      return null;
    }

    return preview;
  } catch (error) {
    console.error("Failed to inspect local merge candidates", error);
    return null;
  }
}

async function runMerge(user: Pick<User, "id">, options: MergeOptions) {
  const preview = await loadMergePreview(user.id);

  if (!preview.hasPendingProfile && preview.pendingEntryCount === 0) {
    return false;
  }

  const storage = getStorage();
  const localRecords = storage.records;

  const remoteEntriesByDate =
    preview.pendingEntryDates.length > 0
      ? await fetchWeekEntries(user.id, preview.pendingEntryDates)
      : {};
  const pendingEntriesByDate = getPendingEntriesByDate(
    localRecords,
    remoteEntriesByDate,
  );

  backupLocalStorage();

  if (options.mergeProfile && preview.localProfile) {
    await upsertProfile(user.id, preview.localProfile);
  }

  if (options.mergeEntries) {
    for (const [date, entries] of Object.entries(pendingEntriesByDate)) {
      if (entries.length > 0) {
        await insertFoodEntries(user.id, date, entries);
      }
    }
  }

  if (options.mergeProfile) {
    clearStoredProfile();
  }

  if (options.mergeEntries) {
    clearStoredRecords();
  }

  markMigrated();
  return true;
}

export async function applyMergeSelection(
  user: Pick<User, "id">,
  options: MergeOptions,
) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const lockManager = navigator.locks;

    if (lockManager?.request) {
      return await lockManager.request(MIGRATION_LOCK_NAME, async () =>
        runMerge(user, options),
      );
    }

    return await runMerge(user, options);
  } catch (error) {
    console.error("Failed to merge local data into Supabase", error);
    return false;
  }
}
