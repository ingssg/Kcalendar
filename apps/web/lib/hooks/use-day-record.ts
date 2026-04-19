"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { defaultStorage, getStorage, subscribeStorage } from "@/lib/storage";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  buildDayRecord,
  fetchDayEntries,
  mergeFoodEntries,
} from "@/lib/supabase-queries";

export function useDayRecord(date: string) {
  const storage = useSyncExternalStore(
    subscribeStorage,
    getStorage,
    () => defaultStorage,
  );
  const { user, isLoggedIn } = useAuth();

  const dayEntriesQuery = useQuery({
    queryKey: ["day-record", user?.id, date],
    queryFn: () => fetchDayEntries(user!.id, date),
    enabled: isLoggedIn && !!user && !!date,
  });

  const localRecord = date ? (storage.records[date] ?? null) : null;

  const mergedRecord = useMemo(() => {
    if (!date) {
      return null;
    }

    const mergedEntries = mergeFoodEntries(
      dayEntriesQuery.data ?? [],
      localRecord?.entries ?? [],
    );

    if (mergedEntries.length === 0) {
      return null;
    }

    return buildDayRecord(date, mergedEntries, {
      createdAt: localRecord?.createdAt,
      updatedAt: localRecord?.updatedAt,
    });
  }, [date, dayEntriesQuery.data, localRecord]);

  return {
    record: mergedRecord,
    isLoading: isLoggedIn ? dayEntriesQuery.isLoading : false,
    isError: dayEntriesQuery.isError,
  };
}
