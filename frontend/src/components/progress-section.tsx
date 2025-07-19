'use client'

import { motion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'
import { useUserStats } from '@/hooks/use-user-progress'

interface ProgressSectionProps {
  sessionId: string
}

function ProgressSection({ sessionId }: ProgressSectionProps) {
  const { data: stats } = useUserStats(sessionId)

  // 오늘 날짜 확인
  const today = new Date()
  const todayDay = today.getDay() // 0: 일요일, 1: 월요일, ..., 6: 토요일
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  // 주간 데이터 생성 (실제 사용자 데이터 기반)
  const weeklyData = [
    { day: '월', ai: 0, terms: 0, quiz: 0, isToday: todayDay === 1 },
    { day: '화', ai: 0, terms: 0, quiz: 0, isToday: todayDay === 2 },
    { day: '수', ai: 0, terms: 0, quiz: 0, isToday: todayDay === 3 },
    { day: '목', ai: 0, terms: 0, quiz: 0, isToday: todayDay === 4 },
    { day: '금', ai: 0, terms: 0, quiz: 0, isToday: todayDay === 5 },
    { day: '토', ai: 0, terms: 0, quiz: 0, isToday: todayDay === 6 },
    { day: '일', ai: 0, terms: 0, quiz: 0, isToday: todayDay === 0 },
  ]

  // 오늘 학습 데이터 반영
  if (stats?.today_ai_info) {
    const todayIndex = todayDay === 0 ? 6 : todayDay - 1 // 일요일은 인덱스 6
    weeklyData[todayIndex].ai = stats.today_ai_info
  }
  if (stats?.today_terms) {
    const todayIndex = todayDay === 0 ? 6 : todayDay - 1
    weeklyData[todayIndex].terms = stats.today_terms
  }
  if (stats?.today_quiz_score) {
    const todayIndex = todayDay === 0 ? 6 : todayDay - 1
    weeklyData[todayIndex].quiz = stats.today_quiz_score
  }

  return (
    <div className="space-y-6">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-2">
        {weeklyData.map((item, index) => (
          <div
            key={index}
            className={`text-center p-3 rounded-lg font-semibold ${
              item.isToday
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'bg-white/10 text-white/70'
            }`}
          >
            <div className="text-sm font-bold">{item.day}</div>
            {item.isToday && (
              <div className="text-xs mt-1 bg-white/20 px-2 py-1 rounded-full">
                오늘
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI 정보 학습 */}
      <div>
        <div className="text-white/80 text-sm mb-3 font-semibold">AI 정보</div>
        <div className="grid grid-cols-7 gap-2">
          {weeklyData.map((item, index) => (
            <div
              key={index}
              className={`text-center p-3 rounded-lg ${
                item.isToday
                  ? 'bg-blue-500/20 border-2 border-blue-500/50 shadow-lg'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className={`text-lg font-bold ${
                item.isToday ? 'text-blue-400' : 'text-white/70'
              }`}>
                {item.ai > 0 ? item.ai : '-'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 용어 학습 */}
      <div>
        <div className="text-white/80 text-sm mb-3 font-semibold">용어 학습</div>
        <div className="grid grid-cols-7 gap-2">
          {weeklyData.map((item, index) => (
            <div
              key={index}
              className={`text-center p-3 rounded-lg ${
                item.isToday
                  ? 'bg-purple-500/20 border-2 border-purple-500/50 shadow-lg'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className={`text-lg font-bold ${
                item.isToday ? 'text-purple-400' : 'text-white/70'
              }`}>
                {item.terms > 0 ? item.terms : '-'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 퀴즈 점수 */}
      <div>
        <div className="text-white/80 text-sm mb-3 font-semibold">퀴즈 점수</div>
        <div className="grid grid-cols-7 gap-2">
          {weeklyData.map((item, index) => (
            <div
              key={index}
              className={`text-center p-3 rounded-lg ${
                item.isToday
                  ? 'bg-green-500/20 border-2 border-green-500/50 shadow-lg'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className={`text-lg font-bold ${
                item.isToday ? 'text-green-400' : 'text-white/70'
              }`}>
                {item.quiz > 0 ? item.quiz : '-'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProgressSection 
