"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/sidebar'
import FinancialAIInfoCard from '@/components/finance-info-card'
import FinancialTermsQuizSection from '@/components/finance-terms-quiz-section'
import FinancialProgressSection from '@/components/finance-progress-section'
import FinancialLearnedTermsSection from '@/components/finance-learned-terms-section'
import useFinancialAIInfo from '@/hooks/use-financial-ai-info'
import { useFinanceUserProgress, useFinanceUserStats } from '@/hooks/use-finance-user-progress'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { financeUserProgressAPI } from '@/lib/api'

export default function FinancialAIDashboardPage() {
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
  const { data: aiInfo, isLoading: aiInfoLoading } = useFinancialAIInfo(selectedDate)
  const { data: userProgress, isLoading: progressLoading } = useFinanceUserProgress(sessionId)
  const { data: userStats } = useFinanceUserStats(sessionId)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'ai' | 'quiz' | 'progress' | 'term'>('ai')
  const [forceUpdate, setForceUpdate] = useState(0)
  // ... (필요시 금융학습에 맞는 추가 상태/로직)

  // 로그인/권한 체크
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

  // 진행률 업데이트 핸들러
  const handleProgressUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['finance-user-progress', sessionId] })
    queryClient.invalidateQueries({ queryKey: ['finance-user-stats', sessionId] })
    queryClient.invalidateQueries({ queryKey: ['finance-learned-terms', sessionId] })
    setForceUpdate(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden px-4">
      <Sidebar selectedDate={selectedDate} onDateChange={setSelectedDate} sessionId={sessionId} />
      <div className="flex flex-col items-center justify-center pt-8 md:pt-12 pb-6">
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl tracking-tight leading-tight mb-4">
          금융학습 대시보드
        </h1>
      </div>
      <div className="flex justify-center mb-6 md:mb-8">
        <div className="flex flex-wrap gap-2 md:gap-4 bg-white/10 backdrop-blur-xl rounded-2xl p-2 md:p-3 shadow-lg border border-white/10">
          {[
            { id: 'ai', label: '금융 정보', gradient: 'from-blue-500 to-purple-500' },
            { id: 'quiz', label: '용어 퀴즈', gradient: 'from-purple-500 to-pink-500' },
            { id: 'progress', label: '진행률', gradient: 'from-pink-500 to-blue-500' },
            { id: 'term', label: '용어 학습', gradient: 'from-purple-500 to-blue-500' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base transition-all ${
                activeTab === tab.id 
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg` 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <main className="flex-1 pb-8 md:pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="max-w-4xl mx-auto"
        >
          {/* 탭별 컨텐츠 */}
          {activeTab === 'ai' && (
            <section className="mb-8 md:mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {(aiInfo?.length === 0 || !aiInfo) && (
                  <div className="glass backdrop-blur-xl rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center text-white/70 shadow-xl min-h-[180px] border border-white/10">
                    <span className="text-base md:text-lg font-semibold">금융 정보가 없습니다</span>
                  </div>
                )}
                {aiInfo && aiInfo.map((info: any, index: number) => (
                  <FinancialAIInfoCard
                    key={index}
                    info={info}
                    index={index}
                    date={selectedDate}
                    sessionId={sessionId}
                    isLearned={userProgress?.[selectedDate]?.includes(index)}
                    onProgressUpdate={handleProgressUpdate}
                    forceUpdate={forceUpdate}
                    setForceUpdate={setForceUpdate}
                  />
                ))}
              </div>
            </section>
          )}
          {activeTab === 'quiz' && (
            <section className="mb-8 md:mb-16">
              <FinancialTermsQuizSection 
                sessionId={sessionId} 
                selectedDate={selectedDate} 
                onProgressUpdate={handleProgressUpdate}
                onDateChange={setSelectedDate}
              />
            </section>
          )}
          {activeTab === 'progress' && (
            <section className="mb-8 md:mb-16">
              <FinancialProgressSection 
                sessionId={sessionId} 
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </section>
          )}
          {activeTab === 'term' && (
            <section className="mb-8 md:mb-16">
              <FinancialLearnedTermsSection sessionId={sessionId} />
            </section>
          )}
        </motion.div>
      </main>
    </div>
  )
} 