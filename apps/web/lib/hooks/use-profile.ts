"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "@kcalendar/types";
import {
  setStorage,
  getStorage,
  subscribeStorage,
  defaultStorage,
} from "@/lib/storage";
import { useAuth } from "@/lib/hooks/use-auth";
import { fetchProfile, upsertProfile } from "@/lib/supabase-queries";

function saveProfileToStorage(profile: UserProfile | null) {
  const storage = getStorage();
  setStorage({
    ...storage,
    profile,
  });
}

export function useProfile() {
  const storage = useSyncExternalStore(
    subscribeStorage,
    getStorage,
    () => defaultStorage,
  );
  const { user, isLoggedIn, isReady } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: isReady && isLoggedIn && !!user,
  });

  useEffect(() => {
    if (profileQuery.data) {
      saveProfileToStorage(profileQuery.data);
    }
  }, [profileQuery.data]);

  const profile = useMemo(() => {
    if (!isLoggedIn) {
      return storage.profile;
    }

    return profileQuery.data ?? storage.profile;
  }, [isLoggedIn, profileQuery.data, storage.profile]);

  const saveMutation = useMutation({
    mutationFn: async (nextProfile: UserProfile) => {
      saveProfileToStorage(nextProfile);

      if (isLoggedIn && user) {
        await upsertProfile(user.id, nextProfile);
      }
    },
    onSuccess: async () => {
      if (isLoggedIn && user) {
        await queryClient.invalidateQueries({
          queryKey: ["profile", user.id],
        });
      }
    },
  });

  return {
    profile,
    isLoading: !isReady || (isLoggedIn ? profileQuery.isLoading : false),
    isError: profileQuery.isError,
    saveMutation,
  };
}
