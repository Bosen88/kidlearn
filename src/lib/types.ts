export interface ChildProfile {
  id: string
  name: string
  avatar: string
  age: number
  stars: number
  badges: string[]
  progress: Record<string, LevelProgress>
  createdAt: Date
}

export interface LevelProgress {
  completed: boolean
  stars: number
  playCount: number
  lastPlayed: Date | null
}

export interface ParentSettings {
  uid: string
  email: string
  children: ChildProfile[]
  timeSettings: TimeSettings
  unlockedThemes: string[]
  createdAt: Date
}

export interface TimeSettings {
  dailyLimitMinutes: number
  sessionLimitMinutes: number
  breakDurationMinutes: number
  allowedHoursStart: number
  allowedHoursEnd: number
  weekendOnly: boolean
}

export interface GameLevel {
  id: string
  category: 'habits' | 'english' | 'cognitive'
  title: string
  titleEn: string
  description: string
  character: 'peep' | 'hoppy' | 'luna'
  difficulty: 1 | 2 | 3
  minAge: number
  maxAge: number
  icon: string
  color: string
  locked: boolean
}

export interface SessionState {
  childId: string
  startTime: Date
  totalPlayedToday: number
  currentSessionStart: Date | null
  isOnBreak: boolean
  breakStartTime: Date | null
}
