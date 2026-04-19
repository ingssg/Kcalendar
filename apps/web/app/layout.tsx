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
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
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
