'use client'

import { motion } from 'framer-motion'
import { Trophy, Target, TrendingUp, Calendar, BarChart3 } from 'lucide-react'
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

  const progressPercentage = stats?.total_learned ? Math.min((stats.total_learned / 100) * 100, 100) : 0

  return (
    <div className="space-y-6">
      {/* 전체 진행률 */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Target className="w-6 h-6" />
          전체 진행률
        </h3>

        <div className="space-y-6">
          {/* 진행률 바 */}
          <div>
            <div className="flex justify-between text-white mb-2">
              <span>학습 진행률</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
              />
            </div>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-white mb-1">
                {stats?.total_learned || 0}
              </div>
              <div className="text-white/70 text-sm">총 학습</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <div className="text-2xl font-bold text-white mb-1">
                {stats?.streak_days || 0}
              </div>
              <div className="text-white/70 text-sm">연속 학습</div>
            </div>
          </div>

          {/* 마지막 학습일 */}
          {stats?.last_learned_date && (
            <div className="flex items-center gap-2 text-white/70">
              <Calendar className="w-4 h-4" />
              <span>마지막 학습: {stats.last_learned_date}</span>
            </div>
          )}
        </div>
      </div>

      {/* 주간 학습 차트 */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          주간 학습 현황
        </h3>

        <div className="space-y-4">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-2">
            {weeklyData.map((item, index) => (
              <div
                key={index}
                className={`text-center p-2 rounded-lg font-semibold ${
                  item.isToday
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                <div className="text-sm">{item.day}</div>
                {item.isToday && <div className="text-xs mt-1">오늘</div>}
              </div>
            ))}
          </div>

          {/* AI 정보 학습 */}
          <div>
            <div className="text-white/80 text-sm mb-2">AI 정보 학습</div>
            <div className="grid grid-cols-7 gap-2">
              {weeklyData.map((item, index) => (
                <div
                  key={index}
                  className={`text-center p-2 rounded-lg ${
                    item.isToday
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-white/5'
                  }`}
                >
                  <div className={`text-lg font-bold ${
                    item.isToday ? 'text-blue-400' : 'text-white/70'
                  }`}>
                    {item.ai}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 용어 학습 */}
          <div>
            <div className="text-white/80 text-sm mb-2">용어 학습</div>
            <div className="grid grid-cols-7 gap-2">
              {weeklyData.map((item, index) => (
                <div
                  key={index}
                  className={`text-center p-2 rounded-lg ${
                    item.isToday
                      ? 'bg-purple-500/20 border border-purple-500/30'
                      : 'bg-white/5'
                  }`}
                >
                  <div className={`text-lg font-bold ${
                    item.isToday ? 'text-purple-400' : 'text-white/70'
                  }`}>
                    {item.terms}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 퀴즈 점수 */}
          <div>
            <div className="text-white/80 text-sm mb-2">퀴즈 점수</div>
            <div className="grid grid-cols-7 gap-2">
              {weeklyData.map((item, index) => (
                <div
                  key={index}
                  className={`text-center p-2 rounded-lg ${
                    item.isToday
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'bg-white/5'
                  }`}
                >
                  <div className={`text-lg font-bold ${
                    item.isToday ? 'text-green-400' : 'text-white/70'
                  }`}>
                    {item.quiz}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 연속 학습 통계 */}
      {stats && stats.streak_days > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-center gap-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats.streak_days}일 연속 학습 중!
              </div>
              <div className="text-white/70">
                계속해서 학습을 이어가세요
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default ProgressSection 
