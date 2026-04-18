export type Gender = 'male' | 'female'

export interface UserProfile {
  version: 1
  gender: Gender
  height: number // cm
  weight: number // kg
  bmr: number // 기준 칼로리 (kcal/day), Mifflin-St Jeor × 1.2
}

export interface FoodEntry {
  id: string
  name: string
  calories: number | null // null = AI 추정 불가
  isEstimated: boolean
}

export interface DayRecord {
  date: string // 'YYYY-MM-DD'
  entries: FoodEntry[]
  totalCalories: number // null 항목 제외 합산
  createdAt: string // ISO 8601
  updatedAt: string
}

export interface AppStorage {
  version: 1
  profile: UserProfile | null
  records: Record<string, DayRecord> // key: 'YYYY-MM-DD'
}

// AI 파싱 API 응답 타입
export interface ParsedFoodItem {
  name: string
  calories: number | null
  confidence: 'high' | 'medium' | 'low'
}

export interface ParseFoodResponse {
  items: ParsedFoodItem[]
}
