"use client";

import { useEffect, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { signInWithGoogle } from "@/lib/auth";

type IosToastProps = {
  onDismiss?: () => void;
};

export function IosToast({ onDismiss }: IosToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => window.clearTimeout(timer);
  }, []);

  async function handleLogin() {
    setIsPending(true);

    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("iOS toast sign-in failed", error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div
      className={`fixed bottom-24 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 transition-all duration-200 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-[0_18px_44px_rgba(25,28,29,0.14)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-headline text-base font-bold tracking-tight text-on-surface">
              iPhone Safari에서는 기록이 사라질 수 있어요
            </p>
            <p className="mt-1 font-body text-sm leading-6 text-on-surface-variant">
              로그인해두면 브라우저 정리나 기기 변경 뒤에도 기록을 이어볼 수
              있어요.
            </p>
          </div>
          <button
            type="button"
            data-shadow="none"
            onClick={onDismiss}
            className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            aria-label="토스트 닫기"
          >
            <CloseIcon className="h-[18px] w-[18px]" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => void handleLogin()}
          disabled={isPending}
          className="mt-4 rounded-xl bg-primary px-4 py-3 font-body text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "로그인 중..." : "Google로 로그인"}
        </button>
      </div>
    </div>
  );
}
