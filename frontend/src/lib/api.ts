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
  getTermsQuizByDate: (date: string) => api.get(`/api/ai-info/terms-quiz-by-date/${date}`),
  getLearnedTerms: (sessionId: string) => api.get(`/api/ai-info/learned-terms/${sessionId}`),
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
  updateTermProgress: (sessionId: string, termData: any) => 
    api.post(`/api/user-progress/term-progress/${sessionId}`, termData),
  getStats: (sessionId: string) => api.get(`/api/user-progress/stats/${sessionId}`),
  getPeriodStats: (sessionId: string, startDate: string, endDate: string) => 
    api.get(`/api/user-progress/period-stats/${sessionId}?start_date=${startDate}&end_date=${endDate}`),
  updateStats: (sessionId: string, stats: any) => 
    api.post(`/api/user-progress/stats/${sessionId}`, stats),
  updateQuizScore: (sessionId: string, scoreData: any) => 
    api.post(`/api/user-progress/quiz-score/${sessionId}`, scoreData),
  checkAchievements: (sessionId: string) => 
    api.get(`/api/user-progress/achievements/${sessionId}`),
  deleteByDate: (sessionId: string, date: string) => api.delete(`/api/user-progress/${sessionId}/${date}`),
  deleteInfoIndex: (sessionId: string, date: string, infoIndex: number) => api.delete(`/api/user-progress/${sessionId}/${date}/${infoIndex}`),
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

// 금융 관련 API들
export const financeInfoAPI = {
  getAll: (skip: number = 0, limit: number = 10) => 
    api.get(`/api/finance/finance-info?skip=${skip}&limit=${limit}`),
  getById: (id: number) => api.get(`/api/finance/finance-info/${id}`),
  add: (data: any) => api.post('/api/finance/finance-info', data),
  update: (id: number, data: any) => api.put(`/api/finance/finance-info/${id}`, data),
  delete: (id: number) => api.delete(`/api/finance/finance-info/${id}`),
  getWithTerms: (skip: number = 0, limit: number = 10) => 
    api.get(`/api/finance/finance-info-with-terms?skip=${skip}&limit=${limit}`),
}

export const financeTermAPI = {
  getAll: (financeInfoId?: number) => {
    const params = financeInfoId ? `?finance_info_id=${financeInfoId}` : '';
    return api.get(`/api/finance/finance-terms${params}`);
  },
  getById: (id: number) => api.get(`/api/finance/finance-terms/${id}`),
  add: (data: any) => api.post('/api/finance/finance-terms', data),
  update: (id: number, data: any) => api.put(`/api/finance/finance-terms/${id}`, data),
  delete: (id: number) => api.delete(`/api/finance/finance-terms/${id}`),
}

export const financeUserProgressAPI = {
  createProgress: (data: any) => api.post('/api/finance/finance-progress', data),
  getUserProgress: (userId: number) => api.get(`/api/finance/finance-progress/${userId}`),
  getLearnedTerms: (userId: number, dateFilter?: string) => {
    const params = dateFilter ? `?date_filter=${dateFilter}` : '';
    return api.get(`/api/finance/finance-learned-terms/${userId}${params}`);
  },
  getStats: (userId: number) => api.get(`/api/finance/finance-stats/${userId}`),
  getPeriodStats: (userId: number, period: string) => 
    api.get(`/api/finance/finance-period-stats/${userId}?period=${period}`),
  recordQuizResult: (userId: number, quizData: any) => 
    api.post(`/api/finance/finance-quiz-result?user_id=${userId}`, quizData),
  getQuizHistory: (userId: number) => api.get(`/api/finance/finance-quiz-history/${userId}`),
}

// 금융 퀴즈 API
export const financeQuizAPI = {
  getAll: () => api.get('/api/finance-quiz/'),
  getById: (id: number) => api.get(`/api/finance-quiz/${id}`),
  create: (data: any) => api.post('/api/finance-quiz/', data),
  update: (id: number, data: any) => api.put(`/api/finance-quiz/${id}`, data),
  delete: (id: number) => api.delete(`/api/finance-quiz/${id}`),
  getRandom: (count: number, difficulty?: string, category?: string) => {
    const params = new URLSearchParams();
    if (difficulty) params.append('difficulty', difficulty);
    if (category) params.append('category', category);
    return api.get(`/api/finance-quiz/random/${count}?${params.toString()}`);
  },
}

// 금융 통계 API
export const financeStatsAPI = {
  getOverallStats: () => api.get('/api/finance-stats/overall'),
} 