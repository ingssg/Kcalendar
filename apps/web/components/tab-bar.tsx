'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function TabBar() {
  const pathname = usePathname()
  const isToday = pathname === '/today'
  const isWeekly = pathname.startsWith('/weekly')

  return (
    <nav
      className="fixed bottom-0 left-0 w-full flex justify-around items-center bg-surface z-50 rounded-t-lg"
      style={{
        borderTop: '1px solid rgba(198,198,198,0.15)',
        paddingTop: '12px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        paddingLeft: '48px',
        paddingRight: '48px',
      }}
    >
      <Link
        href="/today"
        className={`flex flex-col items-center justify-center transition-opacity active:translate-y-0.5 duration-200 ${
          isToday ? 'text-on-surface opacity-100' : 'text-on-surface opacity-40 hover:opacity-60'
        }`}
      >
        <span
          className="material-symbols-outlined mb-1"
          style={{ fontVariationSettings: isToday ? "'FILL' 1" : "'FILL' 0" }}
        >
          calendar_today
        </span>
        <span className="font-label text-[10px] uppercase tracking-[0.1em] font-medium">오늘</span>
      </Link>

      <Link
        href="/weekly"
        className={`flex flex-col items-center justify-center transition-opacity active:translate-y-0.5 duration-200 ${
          isWeekly ? 'text-on-surface opacity-100' : 'text-on-surface opacity-40 hover:opacity-60'
        }`}
      >
        <span
          className="material-symbols-outlined mb-1"
          style={{ fontVariationSettings: isWeekly ? "'FILL' 1" : "'FILL' 0" }}
        >
          bar_chart
        </span>
        <span className="font-label text-[10px] uppercase tracking-[0.1em] font-medium">주간</span>
      </Link>
    </nav>
  )
}
