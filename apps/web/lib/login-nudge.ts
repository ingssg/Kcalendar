import { getStorage } from "@/lib/storage";

const SESSION_NUDGE_SHOWN_KEY = "kcalendar_login_nudge_shown";
const NUDGE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

type NudgeScope = "today" | "weekly";
type ShouldShowNudgeOptions = {
  ignoreSession?: boolean;
};

function getSessionShownKey(scope: NudgeScope) {
  return `${SESSION_NUDGE_SHOWN_KEY}_${scope}`;
}

function getDismissedAtKey(scope: NudgeScope) {
  return `kcalendar_login_nudge_dismissed_at_${scope}`;
}

export function shouldShowNudge(
  scope: NudgeScope,
  options: ShouldShowNudgeOptions = {},
) {
  if (typeof window === "undefined") {
    return false;
  }

  const shownThisSession =
    sessionStorage.getItem(getSessionShownKey(scope)) === "1";
  if (shownThisSession && !options.ignoreSession) {
    return false;
  }

  const dismissedAtRaw = localStorage.getItem(getDismissedAtKey(scope));
  if (!dismissedAtRaw) {
    return true;
  }

  const dismissedAt = new Date(dismissedAtRaw).getTime();
  if (Number.isNaN(dismissedAt)) {
    return true;
  }

  return Date.now() - dismissedAt >= NUDGE_COOLDOWN_MS;
}

export function markNudgeShown(scope: NudgeScope) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(getSessionShownKey(scope), "1");
}

export function dismissNudge(scope: NudgeScope) {
  if (typeof window === "undefined") {
    return;
  }

  markNudgeShown(scope);
  localStorage.setItem(getDismissedAtKey(scope), new Date().toISOString());
}

export function getRecordedDaysCount() {
  const storage = getStorage();

  return Object.values(storage.records).filter(
    (record) => record.entries.length > 0,
  ).length;
}

export function isIosSafariBrowser() {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari =
    /Safari/.test(userAgent) &&
    !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|Mercury/.test(userAgent);
  const isStandalone =
    "standalone" in navigator &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  return isIos && isSafari && !isStandalone;
}
