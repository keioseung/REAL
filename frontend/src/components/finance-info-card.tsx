"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaDollarSign, FaCheck, FaTimes, FaBookOpen, FaLightbulb, FaArrowRight, FaStar, FaChartLine, FaUsers, FaTrophy, FaFire, FaRocket, FaBrain, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { financeUserProgressAPI } from '@/lib/api'

interface FinanceInfo {
  id: number
  title: string
  content: string
  date: string
  difficulty: string
  category: string
  created_at: string
  updated_at: string
  terms?: Array<{
    id: number
    term: string
    description: string
    difficulty: string
  }>
}

interface FinanceInfoCardProps {
  info: FinanceInfo
  index: number
  date: string
  sessionId: string
  isLearned: boolean
  onProgressUpdate: () => void
  forceUpdate: number
  setForceUpdate: (value: number) => void
}

export default function FinanceInfoCard({
  info,
  index,
  date,
  sessionId,
  isLearned,
  onProgressUpdate,
  forceUpdate,
  setForceUpdate
}: FinanceInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [learnedTerms, setLearnedTerms] = useState<Set<number>>(new Set())
  const [showAllTerms, setShowAllTerms] = useState(false)
  const queryClient = useQueryClient()

  // 로컬 스토리지에서 학습된 용어 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('financeLearnedTerms')
        if (stored) {
          const parsed = JSON.parse(stored)
          const key = `${sessionId}_${date}_${index}`
          if (parsed[key]) {
            setLearnedTerms(new Set(parsed[key]))
          }
        }
      } catch (error) {
        console.error('Failed to parse learned terms:', error)
      }
    }
  }, [sessionId, date, index, forceUpdate])

  // 학습 상태 업데이트 뮤테이션
  const updateProgressMutation = useMutation({
    mutationFn: async () => {
      // 임시 사용자 ID (실제로는 세션에서 사용자 ID를 가져와야 함)
      const userId = 1
      await financeUserProgressAPI.createProgress({
        user_id: userId,
        finance_info_id: info.id,
        date: date,
        info_index: index
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['financeUserProgress', sessionId])
      onProgressUpdate()
    }
  })

  // 용어 학습 상태 업데이트 뮤테이션
  const updateTermProgressMutation = useMutation({
    mutationFn: async (termId: number) => {
      // 임시 사용자 ID (실제로는 세션에서 사용자 ID를 가져와야 함)
      const userId = 1
      await financeUserProgressAPI.createProgress({
        user_id: userId,
        term_id: termId,
        date: date,
        finance_info_id: info.id
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['financeUserProgress', sessionId])
      onProgressUpdate()
    }
  })

  const handleLearn = async () => {
    try {
      await updateProgressMutation.mutateAsync()
      
      // 로컬 스토리지 업데이트
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('userProgress')
        const parsed = stored ? JSON.parse(stored) : {}
        if (!parsed[sessionId]) parsed[sessionId] = {}
        if (!parsed[sessionId][date]) parsed[sessionId][date] = []
        if (!parsed[sessionId][date].includes(index)) {
          parsed[sessionId][date].push(index)
        }
        localStorage.setItem('userProgress', JSON.stringify(parsed))
      }
      
      setForceUpdate(forceUpdate + 1)
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleTermLearn = async (termId: number) => {
    try {
      await updateTermProgressMutation.mutateAsync(termId)
      
      // 로컬 스토리지 업데이트
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('financeLearnedTerms')
        const parsed = stored ? JSON.parse(stored) : {}
        const key = `${sessionId}_${date}_${index}`
        if (!parsed[key]) parsed[key] = []
        if (!parsed[key].includes(termId)) {
          parsed[key].push(termId)
        }
        localStorage.setItem('financeLearnedTerms', JSON.stringify(parsed))
        setLearnedTerms(new Set(parsed[key]))
      }
      
      setForceUpdate(forceUpdate + 1)
    } catch (error) {
      console.error('Error updating term progress:', error)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '초급': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case '중급': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case '고급': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '주식': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case '채권': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case '펀드': return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
      case '보험': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
      case '부동산': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case '암호화폐': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const displayedTerms = showAllTerms ? info.terms : (info.terms?.slice(0, 3) || [])
  const hasMoreTerms = info.terms && info.terms.length > 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`glass backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl border transition-all duration-300 ${
        isLearned 
          ? 'border-green-500/50 bg-green-500/5' 
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl md:text-2xl font-bold text-white line-clamp-2">
              {info.title}
            </h3>
            {isLearned && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <FaCheck className="text-white text-xs" />
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-sm border ${getDifficultyColor(info.difficulty)}`}>
              {info.difficulty}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm border ${getCategoryColor(info.category)}`}>
              {info.category}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          {isExpanded ? <FaEyeSlash className="text-white" /> : <FaEye className="text-white" />}
        </button>
      </div>

      {/* 내용 */}
      <div className="mb-6">
        <p className={`text-white/80 leading-relaxed transition-all duration-300 ${
          isExpanded ? 'line-clamp-none' : 'line-clamp-3'
        }`}>
          {info.content}
        </p>
      </div>

      {/* 용어 섹션 */}
      {info.terms && info.terms.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <FaBrain className="text-green-400" />
              관련 용어 ({info.terms.length}개)
            </h4>
            <button
              onClick={() => setShowTerms(!showTerms)}
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              {showTerms ? '숨기기' : '보기'}
            </button>
          </div>
          
          <AnimatePresence>
            {showTerms && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {displayedTerms.map((term) => {
                  const isTermLearned = learnedTerms.has(term.id)
                  return (
                    <motion.div
                      key={term.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        isTermLearned 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-semibold text-white">{term.term}</h5>
                            {isTermLearned && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                              >
                                <FaCheck className="text-white text-xs" />
                              </motion.div>
                            )}
                          </div>
                          <p className="text-white/70 text-sm leading-relaxed">
                            {term.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded text-xs border ${getDifficultyColor(term.difficulty)}`}>
                              {term.difficulty}
                            </span>
                          </div>
                        </div>
                        
                        {!isTermLearned && (
                          <button
                            onClick={() => handleTermLearn(term.id)}
                            className="ml-4 p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            title="학습 완료"
                          >
                            <FaCheck />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
                
                {hasMoreTerms && (
                  <button
                    onClick={() => setShowAllTerms(!showAllTerms)}
                    className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white transition-colors"
                  >
                    {showAllTerms ? '간단히 보기' : `더 보기 (${info.terms!.length - 3}개 더)`}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 하단 액션 */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-4 text-sm text-white/60">
          <span>날짜: {new Date(info.date).toLocaleDateString('ko-KR')}</span>
          <span>생성: {new Date(info.created_at).toLocaleDateString('ko-KR')}</span>
        </div>
        
        {!isLearned && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLearn}
            disabled={updateProgressMutation.isPending}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {updateProgressMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FaCheck />
                학습 완료
              </>
            )}
          </motion.button>
        )}
        
        {isLearned && (
          <div className="flex items-center gap-2 text-green-400">
            <FaCheck />
            <span className="font-semibold">학습 완료</span>
          </div>
        )}
      </div>
    </motion.div>
  )
} 