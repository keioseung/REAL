'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, BookOpen, Target, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUserStats } from '@/hooks/use-user-progress'
import { userProgressAPI } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

interface ProgressSectionProps {
  sessionId: string
  selectedDate?: string
  onDateChange?: (date: string) => void
}

interface PeriodData {
  date: string
  ai_info: number
  terms: number
  quiz_score: number
  quiz_correct: number
  quiz_total: number
}

interface PeriodStats {
  period_data: PeriodData[]
  start_date: string
  end_date: string
  total_days: number
}

function ProgressSection({ sessionId, selectedDate, onDateChange }: ProgressSectionProps) {
  // 외부에서 전달받은 selectedDate를 직접 사용
  const [periodType, setPeriodType] = useState<'week' | 'month' | 'custom'>('week')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const { data: stats } = useUserStats(sessionId)

  // 기간별 데이터 계산
  const getPeriodDates = () => {
    const today = new Date()
    const startDate = new Date()
    
    switch (periodType) {
      case 'week':
        startDate.setDate(today.getDate() - 6)
        break
      case 'month':
        startDate.setDate(today.getDate() - 29)
        break
      case 'custom':
        if (customStartDate && customEndDate) {
          return { start: customStartDate, end: customEndDate }
        }
        startDate.setDate(today.getDate() - 6)
        break
    }
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    }
  }

  const periodDates = getPeriodDates()

  const { data: periodStats } = useQuery<PeriodStats>({
    queryKey: ['period-stats', sessionId, periodDates.start, periodDates.end],
    queryFn: async () => {
      const response = await userProgressAPI.getPeriodStats(sessionId, periodDates.start, periodDates.end)
      return response.data
    },
    enabled: !!sessionId && !!periodDates.start && !!periodDates.end,
  })

  // 날짜 변경 핸들러 - 상위 컴포넌트에 알림
  const handleDateChange = (date: string) => {
    console.log('진행률 탭 - 날짜 변경:', date)
    onDateChange?.(date)
  }

  // 기간 변경 핸들러
  const handlePeriodChange = (type: 'week' | 'month' | 'custom') => {
    console.log('진행률 탭 - 기간 변경:', type)
    setPeriodType(type)
    if (type === 'custom') {
      const today = new Date()
      const weekAgo = new Date()
      weekAgo.setDate(today.getDate() - 6)
      setCustomStartDate(weekAgo.toISOString().split('T')[0])
      setCustomEndDate(today.toISOString().split('T')[0])
    }
  }

  // 커스텀 날짜 변경 핸들러
  const handleCustomStartDateChange = (date: string) => {
    console.log('진행률 탭 - 시작 날짜 변경:', date)
    setCustomStartDate(date)
  }

  const handleCustomEndDateChange = (date: string) => {
    console.log('진행률 탭 - 종료 날짜 변경:', date)
    setCustomEndDate(date)
  }

  // 그래프 데이터 준비
  const chartData = periodStats?.period_data || []
  const maxAI = Math.max(...chartData.map((d: PeriodData) => d.ai_info), 1)
  const maxTerms = Math.max(...chartData.map((d: PeriodData) => d.terms), 1)
  const maxQuiz = Math.max(...chartData.map((d: PeriodData) => d.quiz_score), 1)

  return (
    <div className="space-y-8 relative">
      {/* 날짜 및 기간 선택 */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-white/70" />
            <label htmlFor="progress-date" className="text-white/80 text-sm font-medium">
              선택 날짜:
            </label>
            <input
              id="progress-date"
              type="date"
              value={selectedDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => {
                handleDateChange(e.target.value)
              }}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer touch-manipulation relative z-20"
              style={{ 
                colorScheme: 'dark',
                minHeight: '44px',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                position: 'relative',
                zIndex: 9999
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-sm font-medium">기간:</span>
            <div className="flex bg-white/10 rounded-lg p-1 relative z-20">
              <button
                type="button"
                onClick={() => {
                  handlePeriodChange('week')
                }}
                onTouchStart={() => {
                  handlePeriodChange('week')
                }}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer touch-manipulation min-w-[70px] min-h-[44px] relative z-30 ${
                  periodType === 'week'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/20 active:bg-white/30'
                }`}
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  position: 'relative',
                  zIndex: 9999
                }}
              >
                주간
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePeriodChange('month')
                }}
                onTouchStart={() => {
                  handlePeriodChange('month')
                }}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer touch-manipulation min-w-[70px] min-h-[44px] relative z-30 ${
                  periodType === 'month'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/20 active:bg-white/30'
                }`}
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  position: 'relative',
                  zIndex: 9999
                }}
              >
                월간
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePeriodChange('custom')
                }}
                onTouchStart={() => {
                  handlePeriodChange('custom')
                }}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer touch-manipulation min-w-[70px] min-h-[44px] relative z-30 ${
                  periodType === 'custom'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/20 active:bg-white/30'
                }`}
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  position: 'relative',
                  zIndex: 9999
                }}
              >
                사용자
              </button>
            </div>
          </div>

          {periodType === 'custom' && (
            <div className="flex items-center gap-2 relative z-20">
              <div className="flex flex-col gap-1">
                <label className="text-white/60 text-xs">시작일</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    handleCustomStartDateChange(e.target.value)
                  }}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer touch-manipulation relative z-30"
                  style={{ 
                    minHeight: '44px',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    position: 'relative',
                    zIndex: 9999
                  }}
                />
              </div>
              <span className="text-white/50 self-end mb-2">~</span>
              <div className="flex flex-col gap-1">
                <label className="text-white/60 text-xs">종료일</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    handleCustomEndDateChange(e.target.value)
                  }}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer touch-manipulation relative z-30"
                  style={{ 
                    minHeight: '44px',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    position: 'relative',
                    zIndex: 9999
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AI 정보 통계 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold">AI 정보 학습</h3>
            </div>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">오늘 학습</span>
              <span className="text-blue-400 font-bold text-lg">
                {stats?.today_ai_info || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">총 학습</span>
              <span className="text-white font-semibold">
                {stats?.total_learned || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">총 정보 수</span>
              <span className="text-white/50 text-sm">
                {stats?.total_ai_info_available || 0}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 용어 학습 통계 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">용어 학습</h3>
            </div>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">오늘 학습</span>
              <span className="text-purple-400 font-bold text-lg">
                {stats?.today_terms || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">총 학습</span>
              <span className="text-white font-semibold">
                {stats?.total_terms_learned || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">총 용어 수</span>
              <span className="text-white/50 text-sm">
                {stats?.total_terms_available || 0}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 퀴즈 통계 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold">퀴즈 점수</h3>
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">오늘 누적 점수</span>
              <span className="text-green-400 font-bold text-lg">
                {stats?.today_quiz_score || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">오늘 정답률</span>
              <span className="text-white font-semibold">
                {stats?.today_quiz_correct || 0}/{stats?.today_quiz_total || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">전체 누적</span>
              <span className="text-white/50 text-sm">
                {stats?.cumulative_quiz_score || 0}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 기간별 추이 그래프 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">기간별 학습 추이</h3>
          <div className="text-white/60 text-sm">
            {periodStats?.start_date} ~ {periodStats?.end_date}
          </div>
        </div>

        {/* 그래프 컨테이너 */}
        <div className="glass rounded-2xl p-6">
          {chartData.length > 0 ? (
            <div className="space-y-8">
              {/* AI 정보 추이 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-white/80 font-medium">AI 정보 학습</span>
                  </div>
                  <span className="text-white/60 text-sm">
                    최대: {maxAI}개
                  </span>
                </div>
                <div className="flex items-end gap-1 h-32">
                  {chartData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="relative w-full">
                        <div
                          className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-500 hover:from-blue-400 hover:to-blue-300"
                          style={{ 
                            height: `${(data.ai_info / maxAI) * 100}%`,
                            minHeight: '4px'
                          }}
                        />
                        {data.ai_info > 0 && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-blue-400 font-medium">
                            {data.ai_info}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-white/50 mt-2 text-center">
                        {new Date(data.date).getDate()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 용어 학습 추이 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-white/80 font-medium">용어 학습</span>
                  </div>
                  <span className="text-white/60 text-sm">
                    최대: {maxTerms}개
                  </span>
                </div>
                <div className="flex items-end gap-1 h-32">
                  {chartData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="relative w-full">
                        <div
                          className="bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-sm transition-all duration-500 hover:from-purple-400 hover:to-purple-300"
                          style={{ 
                            height: `${(data.terms / maxTerms) * 100}%`,
                            minHeight: '4px'
                          }}
                        />
                        {data.terms > 0 && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-purple-400 font-medium">
                            {data.terms}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-white/50 mt-2 text-center">
                        {new Date(data.date).getDate()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 퀴즈 점수 추이 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white/80 font-medium">퀴즈 점수</span>
                  </div>
                  <span className="text-white/60 text-sm">
                    최대: {maxQuiz}%
                  </span>
                </div>
                <div className="flex items-end gap-1 h-32">
                  {chartData.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="relative w-full">
                        <div
                          className="bg-gradient-to-t from-green-500 to-green-400 rounded-t-sm transition-all duration-500 hover:from-green-400 hover:to-green-300"
                          style={{ 
                            height: `${(data.quiz_score / maxQuiz) * 100}%`,
                            minHeight: '4px'
                          }}
                        />
                        {data.quiz_score > 0 && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-green-400 font-medium">
                            {data.quiz_score}%
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-white/50 mt-2 text-center">
                        {new Date(data.date).getDate()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-white/60 py-8">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p>선택한 기간에 학습 데이터가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProgressSection 
