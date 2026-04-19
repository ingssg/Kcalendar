"use client";

import { useEffect } from "react";
import { initAuth } from "@/lib/auth";

export function AuthInitializer() {
  useEffect(() => {
    void initAuth();
  }, []);

  return null;
}
