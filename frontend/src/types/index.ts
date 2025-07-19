// AI Info Types
export interface TermItem {
  term: string
  description: string
}

export interface AIInfoItem {
  title: string
  content: string
  terms?: TermItem[]
}

export interface AIInfoCreate {
  date: string
  infos: AIInfoItem[]
}

// Quiz Types
export interface Quiz {
  id: number
  topic: string
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct: number
  explanation: string
  created_at: string
}

export interface QuizCreate {
  topic: string
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct: number
  explanation: string
}

// User Progress Types
export interface UserProgress {
  [date: string]: number[]
}

export interface UserStats {
  total_learned: number
  streak_days: number
  last_learned_date: string | null
  quiz_score: number
  achievements: string[]
}

// Prompt Types
export interface Prompt {
  id: number
  title: string
  content: string
  category: string
  created_at: string
}

export interface PromptCreate {
  title: string
  content: string
  category: string
}

// Base Content Types
export interface BaseContent {
  id: number
  title: string
  content: string
  category: string
  created_at: string
}

export interface BaseContentCreate {
  title: string
  content: string
  category: string
}

// Achievement Types
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
}

// News Types
export interface NewsItem {
  title: string
  content: string
  link: string
} 