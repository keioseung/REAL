"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, BookOpen, Trophy, Target, TrendingUp, Calendar } from 'lucide-react'
import Sidebar from '@/components/sidebar'
import AIInfoCard from '@/components/ai-info-card'
import QuizSection from '@/components/quiz-section'
import ProgressSection from '@/components/progress-section'
import useAIInfo from '@/hooks/use-ai-info'
import useUserProgress from '@/hooks/use-user-progress'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('sessionId')
      if (!id) {
        id = Math.random().toString(36).substring(2, 15)
        localStorage.setItem('sessionId', id)
      }
      return id
    }
    return 'default'
  })
  const { data: aiInfo, isLoading: aiInfoLoading } = useAIInfo(selectedDate)
  const { data: userProgress, isLoading: progressLoading } = useUserProgress(sessionId)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'ai' | 'quiz' | 'progress'>('ai')

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.replace('/auth')
      return
    }
    const user = JSON.parse(userStr)
    if (user.role !== 'user') {
      router.replace('/admin')
    }
  }, [router])

  const stats = [
    { label: '총 학습', value: userProgress?.total_learned || 0, icon: BookOpen, color: 'bg-blue-500' },
    { label: '연속 학습', value: userProgress?.streak_days || 0, icon: TrendingUp, color: 'bg-green-500' },
    { label: '퀴즈 점수', value: userProgress?.quiz_score || 0, icon: Target, color: 'bg-purple-500' },
    { label: '성취', value: userProgress?.achievements?.length || 0, icon: Trophy, color: 'bg-yellow-500' },
  ]

  // 토스트 알림 상태
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 font-sans">
      {/* 토스트 알림 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className={`fixed top-8 left-1/2 z-50 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl text-white font-bold text-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 헤더 */}
      <div className="text-center mb-8 pt-12">
        <h1 className="text-6xl font-extrabold gradient-text mb-4 drop-shadow-lg tracking-tight">
          AI Mastery Hub
        </h1>
        <p className="text-2xl text-white/90 font-medium drop-shadow-sm">
          인공지능의 세계를 탐험하고 학습하세요
        </p>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex justify-center mb-10">
        <div className="flex gap-4 bg-white/10 rounded-2xl p-2 shadow-lg border border-white/10">
          <button
            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${activeTab === 'ai' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow' : 'text-white/70 hover:bg-white/10'}`}
            onClick={() => setActiveTab('ai')}
          >
            AI 정보
          </button>
          <button
            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${activeTab === 'quiz' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow' : 'text-white/70 hover:bg-white/10'}`}
            onClick={() => setActiveTab('quiz')}
          >
            퀴즈
          </button>
          <button
            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all ${activeTab === 'progress' ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow' : 'text-white/70 hover:bg-white/10'}`}
            onClick={() => setActiveTab('progress')}
          >
            진행률
          </button>
        </div>
      </div>

      {/* 날짜 선택 (AI 정보 탭에서만 표시) */}
      {activeTab === 'ai' && (
        <div className="flex justify-center mb-10 sticky top-0 z-30">
          <div className="glass rounded-2xl px-8 py-4 flex items-center gap-6 shadow-xl border border-white/10">
            <Calendar className="w-6 h-6 text-blue-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg font-semibold shadow"
              style={{ minWidth: 180 }}
            />
            <span className="ml-4 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-sm shadow">
              {selectedDate === new Date().toISOString().split('T')[0] ? '오늘' : selectedDate}
            </span>
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <main className="flex-1 p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* 탭별 컨텐츠 */}
          {activeTab === 'ai' && (
            <section className="mb-16">
              <h2 className="text-3xl font-extrabold text-white mb-8 flex items-center gap-4 drop-shadow">
                <Brain className="w-8 h-8" />
                오늘의 AI 정보
              </h2>
              {aiInfoLoading ? (
                <div className="glass rounded-2xl p-12 text-center shadow-xl">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
                  <p className="text-white/80 mt-6 text-xl font-semibold">AI 정보를 불러오는 중...</p>
                </div>
              ) : aiInfo && aiInfo.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {aiInfo.map((info, index) => (
                    <AIInfoCard
                      key={index}
                      info={info}
                      index={index}
                      date={selectedDate}
                      sessionId={sessionId}
                      isLearned={userProgress?.[selectedDate]?.includes(index) || false}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass rounded-2xl p-12 text-center shadow-xl">
                  <BookOpen className="w-20 h-20 text-white/50 mx-auto mb-6" />
                  <p className="text-white/80 text-2xl font-semibold">
                    {selectedDate}에 등록된 AI 정보가 없습니다.
                  </p>
                </div>
              )}
            </section>
          )}
          {activeTab === 'quiz' && (
            <section className="mb-16">
              <QuizSection sessionId={sessionId} />
            </section>
          )}
          {activeTab === 'progress' && (
            <section className="mb-16">
              <ProgressSection sessionId={sessionId} />
            </section>
          )}
        </motion.div>
      </main>
    </div>
  )
} 