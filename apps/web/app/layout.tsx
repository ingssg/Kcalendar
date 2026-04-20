import type { Metadata, Viewport } from "next";
import { AuthInitializer } from "@/components/auth-initializer";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kcalendar",
  description: "자연어로 기록하고 주간 흐름을 보는 칼로리 기록 서비스",
  applicationName: "Kcalendar",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kcalendar",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f8f9fa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      {/* 데스크탑: surface-dim 배경 + 중앙 모바일 컨테이너 */}
      <body className="bg-surface-dim min-h-dvh flex justify-center">
        <QueryProvider>
          <AuthInitializer />
          <div className="w-full max-w-107.5 min-h-dvh bg-surface relative">
            {children}
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
