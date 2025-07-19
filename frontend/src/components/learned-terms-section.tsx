'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Calendar, Brain, Target, Trophy, TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { aiInfoAPI } from '@/lib/api'

interface LearnedTermsSectionProps {
  sessionId: string
}

interface TermItem {
  term: string
  description: string
  learned_date: string
  info_index: number
}

interface LearnedTermsResponse {
  terms: TermItem[]
  terms_by_date: { [date: string]: TermItem[] }
  total_terms: number
  learned_dates: string[]
}

function LearnedTermsSection({ sessionId }: LearnedTermsSectionProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentTermIndex, setCurrentTermIndex] = useState(0)

  const { data: learnedData, isLoading } = useQuery<LearnedTermsResponse>({
    queryKey: ['learned-terms', sessionId],
    queryFn: async () => {
      const response = await aiInfoAPI.getLearnedTerms(sessionId)
      return response.data
    },
    enabled: !!sessionId,
  })

  const handleDateSelect = (date: string) => {
    setSelectedDate(selectedDate === date ? null : date)
    setCurrentTermIndex(0)
  }

  const handleNextTerm = () => {
    if (learnedData?.terms) {
      setCurrentTermIndex((prev) => (prev + 1) % learnedData.terms.length)
    }
  }

  const handlePrevTerm = () => {
    if (learnedData?.terms) {
      setCurrentTermIndex((prev) => (prev - 1 + learnedData.terms.length) % learnedData.terms.length)
    }
  }

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-8">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">학습한 용어를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!learnedData?.terms || learnedData.terms.length === 0) {
    return (
      <div className="glass rounded-2xl p-8">
        <div className="text-center text-white">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-60" />
          <h3 className="text-xl font-semibold mb-2">학습한 용어가 없습니다</h3>
          <p className="text-white/70 mb-4">
            AI 정보를 학습하고 용어를 등록한 후 여기서 확인해보세요!
          </p>
          <div className="text-sm text-white/50">
            총 학습 가능한 용어: 0개
          </div>
        </div>
      </div>
    )
  }

  const currentTerm = learnedData.terms[currentTermIndex]
  const filteredTerms = selectedDate 
    ? learnedData.terms.filter(term => term.learned_date === selectedDate)
    : learnedData.terms

  return (
    <div className="glass rounded-2xl p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Brain className="w-8 h-8" />
          학습한 용어 모음
        </h2>
        <div className="text-white/70 text-sm">
          총 {learnedData.total_terms}개 용어 학습 완료
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-blue-300" />
            <div>
              <div className="text-white font-semibold">{learnedData.total_terms}</div>
              <div className="text-white/60 text-sm">총 학습 용어</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-green-300" />
            <div>
              <div className="text-white font-semibold">{learnedData.learned_dates.length}</div>
              <div className="text-white/60 text-sm">학습한 날짜</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-purple-300" />
            <div>
              <div className="text-white font-semibold">
                {learnedData.learned_dates.length > 0 ? '진행 중' : '시작 전'}
              </div>
              <div className="text-white/60 text-sm">학습 상태</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 날짜별 필터 */}
      {learnedData.learned_dates.length > 1 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            날짜별 필터
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleDateSelect('')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                !selectedDate
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              전체 ({learnedData.total_terms})
            </button>
            {learnedData.learned_dates.map((date) => {
              const dateTerms = learnedData.terms_by_date[date] || []
              return (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDate === date
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {date} ({dateTerms.length})
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 현재 용어 표시 */}
      {currentTerm && (
        <motion.div
          key={currentTerm.term + currentTerm.learned_date}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 mb-6"
        >
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-white mb-2">{currentTerm.term}</div>
            <div className="text-white/80 text-lg leading-relaxed">{currentTerm.description}</div>
          </div>
          
          <div className="flex items-center justify-between text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>학습일: {currentTerm.learned_date}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>정보 {currentTerm.info_index + 1}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 네비게이션 */}
      <div className="flex items-center justify-between">
        <div className="text-white/70 text-sm">
          {currentTermIndex + 1} / {filteredTerms.length}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handlePrevTerm}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all font-medium"
          >
            이전
          </button>
          <button
            onClick={handleNextTerm}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium"
          >
            다음
          </button>
        </div>
      </div>

      {/* 용어 목록 */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Target className="w-5 h-5" />
          전체 용어 목록
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {filteredTerms.map((term, index) => (
            <motion.div
              key={`${term.term}_${term.learned_date}_${term.info_index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                index === currentTermIndex
                  ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
              onClick={() => setCurrentTermIndex(index)}
            >
              <div className="font-semibold text-white text-sm mb-1">{term.term}</div>
              <div className="text-white/60 text-xs line-clamp-2">{term.description}</div>
              <div className="text-white/40 text-xs mt-1">{term.learned_date}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LearnedTermsSection 