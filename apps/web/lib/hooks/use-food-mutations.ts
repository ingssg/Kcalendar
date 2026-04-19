"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FoodEntry } from "@kcalendar/types";
import {
  addFoodEntries,
  deleteFoodEntry,
  updateFoodEntry,
} from "@/lib/storage";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  insertFoodEntries,
  patchFoodEntry,
  removeFoodEntry,
} from "@/lib/supabase-queries";

export function useFoodMutations(date: string) {
  const { user, isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (entries: FoodEntry[]) => {
      addFoodEntries(date, entries);

      if (isLoggedIn && user) {
        await insertFoodEntries(user.id, date, entries);
      }
    },
    onSuccess: async () => {
      if (isLoggedIn && user) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["day-record", user.id, date],
          }),
          queryClient.invalidateQueries({
            queryKey: ["weekly-records", user.id],
          }),
        ]);
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      entryId,
      patch,
    }: {
      entryId: string;
      patch: Partial<Pick<FoodEntry, "name" | "calories">>;
    }) => {
      updateFoodEntry(date, entryId, patch);

      if (isLoggedIn) {
        await patchFoodEntry(entryId, patch);
      }
    },
    onSuccess: async () => {
      if (isLoggedIn && user) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["day-record", user.id, date],
          }),
          queryClient.invalidateQueries({
            queryKey: ["weekly-records", user.id],
          }),
        ]);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (entryId: string) => {
      deleteFoodEntry(date, entryId);

      if (isLoggedIn) {
        await removeFoodEntry(entryId);
      }
    },
    onSuccess: async () => {
      if (isLoggedIn && user) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["day-record", user.id, date],
          }),
          queryClient.invalidateQueries({
            queryKey: ["weekly-records", user.id],
          }),
        ]);
      }
    },
  });

  return {
    addMutation,
    updateMutation,
    deleteMutation,
  };
}
