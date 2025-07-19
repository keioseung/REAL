import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// AI Info API
export const aiInfoAPI = {
  getByDate: (date: string) => api.get(`/api/ai-info/${date}`),
  add: (data: any) => api.post('/api/ai-info/', data),
  delete: (date: string) => api.delete(`/api/ai-info/${date}`),
  getAllDates: () => api.get('/api/ai-info/dates/all'),
  fetchNews: () => api.get('/api/ai-info/news/fetch'),
  getTermsQuiz: (sessionId: string) => api.get(`/api/ai-info/terms-quiz/${sessionId}`),
}

// Quiz API
export const quizAPI = {
  getTopics: () => api.get('/api/quiz/topics'),
  getByTopic: (topic: string) => api.get(`/api/quiz/${topic}`),
  add: (data: any) => api.post('/api/quiz/', data),
  update: (id: number, data: any) => api.put(`/api/quiz/${id}`, data),
  delete: (id: number) => api.delete(`/api/quiz/${id}`),
  generate: (topic: string) => api.get(`/api/quiz/generate/${topic}`),
}

// User Progress API
export const userProgressAPI = {
  get: (sessionId: string) => api.get(`/api/user-progress/${sessionId}`),
  update: (sessionId: string, date: string, infoIndex: number) => 
    api.post(`/api/user-progress/${sessionId}/${date}/${infoIndex}`),
  getStats: (sessionId: string) => api.get(`/api/user-progress/stats/${sessionId}`),
  updateStats: (sessionId: string, stats: any) => 
    api.post(`/api/user-progress/stats/${sessionId}`, stats),
  checkAchievements: (sessionId: string) => 
    api.get(`/api/user-progress/achievements/${sessionId}`),
}

// Prompt API
export const promptAPI = {
  getAll: () => api.get('/api/prompt/'),
  add: (data: any) => api.post('/api/prompt/', data),
  update: (id: number, data: any) => api.put(`/api/prompt/${id}`, data),
  delete: (id: number) => api.delete(`/api/prompt/${id}`),
  getByCategory: (category: string) => api.get(`/api/prompt/category/${category}`),
}

// Base Content API
export const baseContentAPI = {
  getAll: () => api.get('/api/base-content/'),
  add: (data: any) => api.post('/api/base-content/', data),
  update: (id: number, data: any) => api.put(`/api/base-content/${id}`, data),
  delete: (id: number) => api.delete(`/api/base-content/${id}`),
  getByCategory: (category: string) => api.get(`/api/base-content/category/${category}`),
} 