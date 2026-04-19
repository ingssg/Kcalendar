"use client";

import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultStorage, getStorage, subscribeStorage } from "@/lib/storage";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  buildDayRecord,
  fetchWeekEntries,
  mergeFoodEntries,
} from "@/lib/supabase-queries";

export function useWeeklyRecords(dates: string[]) {
  const storage = useSyncExternalStore(
    subscribeStorage,
    getStorage,
    () => defaultStorage,
  );
  const { user, isLoggedIn } = useAuth();

  const weeklyQuery = useQuery({
    queryKey: ["weekly-records", user?.id, dates.join(",")],
    queryFn: () => fetchWeekEntries(user!.id, dates),
    enabled: isLoggedIn && !!user && dates.length > 0,
  });

  const records = dates.reduce<
    Record<string, (typeof storage.records)[string]>
  >((acc, date) => {
    const remoteEntries = weeklyQuery.data?.[date] ?? [];
    const localRecord = storage.records[date];
    const mergedEntries = mergeFoodEntries(
      remoteEntries,
      localRecord?.entries ?? [],
    );

    if (mergedEntries.length === 0) {
      return acc;
    }

    const record = buildDayRecord(date, mergedEntries, {
      createdAt: localRecord?.createdAt,
      updatedAt: localRecord?.updatedAt,
    });

    if (record) {
      acc[date] = record;
    }

    return acc;
  }, {});

  return {
    records,
    isLoading: isLoggedIn ? weeklyQuery.isLoading : false,
    isError: weeklyQuery.isError,
  };
}
