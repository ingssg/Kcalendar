"use client";

import { useState } from "react";
import { CloseIcon } from "@/components/icons";
import { signInWithGoogle } from "@/lib/auth";

type LoginBannerProps = {
  variant: "inline" | "card-cta";
  onDismiss?: () => void;
};

const copyByVariant = {
  inline: {
    title: "로그인하고 기록을 이어보세요",
    body: "지금 로그인하면 이 기기의 기록을 다른 기기에서도 이어서 볼 수 있어요.",
  },
  "card-cta": {
    title: "이 주간 기록을 계정에 연결해보세요",
    body: "로그인하면 주간 기록을 안전하게 보관하고 다른 기기에서도 바로 이어볼 수 있어요.",
  },
} as const;

export function LoginBanner({ variant, onDismiss }: LoginBannerProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleLogin() {
    setIsPending(true);

    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login banner sign-in failed", error);
    } finally {
      setIsPending(false);
    }
  }

  const copy = copyByVariant[variant];
  const containerClassName =
    variant === "inline"
      ? "rounded-2xl bg-surface-container p-5 shadow-[0_14px_32px_rgba(25,28,29,0.06)]"
      : "rounded-2xl border border-surface-container-high bg-surface p-5 shadow-[0_18px_42px_rgba(25,28,29,0.12)]";

  return (
    <section className={containerClassName}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="font-headline text-lg font-bold tracking-tight text-on-surface">
            {copy.title}
          </h3>
          <p className="font-body text-sm leading-6 text-on-surface-variant">
            {copy.body}
          </p>
        </div>
        <button
          type="button"
          data-shadow="none"
          onClick={onDismiss}
          className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          aria-label="로그인 유도 닫기"
        >
          <CloseIcon className="h-[18px] w-[18px]" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => void handleLogin()}
          disabled={isPending}
          className="rounded-xl bg-primary px-4 py-3 font-body text-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "로그인 중..." : "Google로 로그인"}
        </button>
        <p className="font-label text-[11px] tracking-wide text-on-surface-variant">
          다른 기기에서도 기록 확인 가능
        </p>
      </div>
    </section>
  );
}
