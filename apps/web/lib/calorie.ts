import type { Gender } from '@kcalendar/types'

const FIXED_AGE = 25
const ACTIVITY_FACTOR = 1.2 // 좌식 기준

export function calculateBMR(gender: Gender, height: number, weight: number): number {
  // Mifflin-St Jeor 수식
  const base = 10 * weight + 6.25 * height - 5 * FIXED_AGE
  const bmr = gender === 'male' ? base + 5 : base - 161
  return Math.round(bmr * ACTIVITY_FACTOR)
}
