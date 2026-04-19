"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signInWithGoogle, signOut } from "@/lib/auth";
import { useAuth } from "@/lib/hooks/use-auth";

type AuthMenuButtonProps = {
  profileHref?: string;
};

export function AuthMenuButton({
  profileHref = "/onboarding",
}: AuthMenuButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authPending, setAuthPending] = useState(false);
  const [loadedAvatarUrl, setLoadedAvatarUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, isLoggedIn } = useAuth();

  const avatarUrl =
    typeof user?.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : typeof user?.user_metadata?.picture === "string"
        ? user.user_metadata.picture
        : "/google.png";

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function handleAuthButtonClick() {
    if (authPending) {
      return;
    }

    setMenuOpen((current) => !current);
  }

  async function handleLogin() {
    setAuthPending(true);

    try {
      await signInWithGoogle();
      setMenuOpen(false);
    } catch (error) {
      console.error("Auth login failed", error);
    } finally {
      setAuthPending(false);
    }
  }

  async function handleLogout() {
    setAuthPending(true);

    try {
      await signOut();
      window.location.replace("/");
    } catch (error) {
      console.error("Auth logout failed", error);
      setAuthPending(false);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={handleAuthButtonClick}
        disabled={authPending}
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-surface-container-high bg-surface shadow-[0_8px_20px_rgba(25,28,29,0.08)] transition-all hover:bg-surface-container-low disabled:opacity-60 disabled:cursor-not-allowed"
        aria-label={isLoggedIn ? "계정 메뉴 열기" : "로그인 메뉴 열기"}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <div className="absolute inset-[2px] overflow-hidden rounded-full bg-surface-container-low">
          <Image
            src="/google.png"
            alt=""
            fill
            sizes="40px"
            priority
            className="object-contain"
          />
          {isLoggedIn && avatarUrl !== "/google.png" && (
            <Image
              src={avatarUrl}
              alt=""
              fill
              sizes="40px"
              onLoad={() => setLoadedAvatarUrl(avatarUrl)}
              className={`object-cover transition-opacity duration-200 ${
                loadedAvatarUrl === avatarUrl ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 min-w-32 overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_12px_32px_rgba(25,28,29,0.12)]">
          {!isLoggedIn && (
            <button
              type="button"
              onClick={() => void handleLogin()}
              disabled={authPending}
              className="block w-full px-4 py-3 text-left font-body text-sm text-on-surface shadow-none transition-colors hover:bg-surface-container-low hover:shadow-none disabled:opacity-50"
            >
              {authPending ? "처리 중..." : "로그인"}
            </button>
          )}
          <Link
            href={profileHref}
            className="block px-4 py-3 font-body text-sm text-on-surface transition-colors hover:bg-surface-container-low"
            onClick={() => setMenuOpen(false)}
          >
            프로필 수정
          </Link>
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={authPending}
              className="block w-full px-4 py-3 text-left font-body text-sm text-on-surface shadow-none transition-colors hover:bg-surface-container-low hover:shadow-none disabled:opacity-50"
            >
              {authPending ? "처리 중..." : "로그아웃"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
