"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/hooks/use-profile";

export default function RootPage() {
  const router = useRouter();
  const { profile, isLoading } = useProfile();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (profile) {
      router.replace("/today");
    } else {
      router.replace("/onboarding");
    }
  }, [isLoading, profile, router]);

  return null;
}
