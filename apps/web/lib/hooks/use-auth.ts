"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  defaultAuthSnapshot,
  getAuthSnapshot,
  initAuth,
  subscribeAuth,
} from "@/lib/auth";

export function useAuth() {
  const auth = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    () => defaultAuthSnapshot,
  );

  useEffect(() => {
    void initAuth();
  }, []);

  return {
    session: auth.session,
    user: auth.session?.user ?? null,
    isLoggedIn: auth.session !== null,
    isReady: auth.isReady,
  };
}
