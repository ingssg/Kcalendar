import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type AuthSnapshot = {
  session: Session | null;
  isReady: boolean;
};

export const defaultAuthSnapshot: AuthSnapshot = {
  session: null,
  isReady: false,
};

const listeners = new Set<() => void>();

let currentSession: Session | null = null;
let authInitialized = false;
let authInitPromise: Promise<Session | null> | null = null;
let currentSnapshot: AuthSnapshot = defaultAuthSnapshot;

function emitAuthChange() {
  listeners.forEach((listener) => listener());
}

function syncSnapshot() {
  currentSnapshot = {
    session: currentSession,
    isReady: authInitialized,
  };
}

export function subscribeAuth(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getAuthSnapshot() {
  return currentSnapshot;
}

export function getSession() {
  return currentSession;
}

export function getUser(): User | null {
  return currentSession?.user ?? null;
}

export function isLoggedIn() {
  return currentSession !== null;
}

export async function initAuth() {
  if (typeof window === "undefined") {
    return null;
  }

  if (authInitialized) {
    return currentSession;
  }

  if (authInitPromise) {
    return authInitPromise;
  }

  const supabase = getSupabaseBrowserClient();

  authInitPromise = (async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Failed to read Supabase session", error);
    }

    currentSession = data.session;
    authInitialized = true;
    syncSnapshot();
    emitAuthChange();

    supabase.auth.onAuthStateChange((_event, nextSession) => {
      currentSession = nextSession;
      authInitialized = true;
      syncSnapshot();
      emitAuthChange();
    });

    return currentSession;
  })();

  try {
    return await authInitPromise;
  } finally {
    authInitPromise = null;
  }
}

export async function signInWithGoogle() {
  const supabase = getSupabaseBrowserClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }
}

function clearLocalKcalendarData() {
  const localKeys = Object.keys(localStorage).filter((k) =>
    k.startsWith("kcalendar"),
  );
  localKeys.forEach((k) => localStorage.removeItem(k));

  const sessionKeys = Object.keys(sessionStorage).filter((k) =>
    k.startsWith("kcalendar"),
  );
  sessionKeys.forEach((k) => sessionStorage.removeItem(k));
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  clearLocalKcalendarData();
}
