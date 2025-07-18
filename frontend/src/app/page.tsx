'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, BookOpen, Trophy, Target, TrendingUp, Users } from 'lucide-react'
import Sidebar from '@/components/sidebar'
import AIInfoCard from '@/components/ai-info-card'
import QuizSection from '@/components/quiz-section'
import ProgressSection from '@/components/progress-section'
import useAIInfo from '@/hooks/use-ai-info'
import useUserProgress from '@/hooks/use-user-progress'

export default function HomePage() {
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

  const stats = [
    { label: '총 학습', value: userProgress?.total_learned || 0, icon: BookOpen, color: 'bg-blue-500' },
    { label: '연속 학습', value: userProgress?.streak_days || 0, icon: TrendingUp, color: 'bg-green-500' },
    { label: '퀴즈 점수', value: userProgress?.quiz_score || 0, icon: Target, color: 'bg-purple-500' },
    { label: '성취', value: userProgress?.achievements?.length || 0, icon: Trophy, color: 'bg-yellow-500' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      {/* 헤더 */}
      <div className="text-center mb-8 pt-8">
        <h1 className="text-5xl font-bold gradient-text mb-4">
          AI Mastery Hub
        </h1>
        <p className="text-xl text-white/80">
          인공지능의 세계를 탐험하고 학습하세요
        </p>
      </div>

      {/* 사이드바를 타이틀 아래에 가로로 배치 */}
      <div className="flex justify-center mb-8">
        <Sidebar 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          sessionId={sessionId}
        />
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass rounded-2xl p-6 text-center card-hover"
              >
                <div className={`inline-flex p-3 rounded-full ${stat.color} text-white mb-4`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{stat.value}</h3>
                <p className="text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* AI 정보 섹션 */}
          <section className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Brain className="w-8 h-8" />
              오늘의 AI 정보
            </h2>
            
            {aiInfoLoading ? (
              <div className="glass rounded-2xl p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-white/70 mt-4">AI 정보를 불러오는 중...</p>
              </div>
            ) : aiInfo && aiInfo.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <div className="glass rounded-2xl p-8 text-center">
                <BookOpen className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <p className="text-white/70 text-lg">
                  {selectedDate}에 등록된 AI 정보가 없습니다.
                </p>
              </div>
            )}
          </section>

          {/* 퀴즈 섹션 */}
          <QuizSection sessionId={sessionId} />

          {/* 진행상황 섹션 */}
          <ProgressSection sessionId={sessionId} />
        </motion.div>
      </main>
    </div>
  )
} 
