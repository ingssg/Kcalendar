const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseDate(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayName = DAYS_KO[date.getDay()]
  return `${month}월 ${day}일 (${dayName})`
}

export function today(): string {
  return formatDate(new Date())
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getWeekDates(dateStr: string): string[] {
  const date = parseDate(dateStr)
  const day = date.getDay() // 0=일, 6=토
  const monday = new Date(date)
  monday.setDate(date.getDate() - ((day + 6) % 7)) // 월요일 기준

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return formatDate(d)
  })
}

export function getWeekLabel(weekDates: string[]): string {
  const first = parseDate(weekDates[0])
  const last = parseDate(weekDates[6])
  return `${first.getMonth() + 1}/${first.getDate()} — ${last.getMonth() + 1}/${last.getDate()}`
}

export function isToday(dateStr: string): boolean {
  return dateStr === today()
}
