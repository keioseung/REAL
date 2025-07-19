'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, BookOpen, ExternalLink, Brain, Trophy, Star, Sparkles } from 'lucide-react'
import { useUpdateUserProgress, useCheckAchievements, useUpdateTermProgress } from '@/hooks/use-user-progress'
import type { AIInfoItem, TermItem } from '@/types'

interface AIInfoCardProps {
  info: AIInfoItem
  index: number
  date: string
  sessionId: string
  isLearned: boolean
  onProgressUpdate?: () => void
}

function AIInfoCard({ info, index, date, sessionId, isLearned, onProgressUpdate }: AIInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [currentTermIndex, setCurrentTermIndex] = useState(0)
  const [showAchievement, setShowAchievement] = useState(false)
  const [showTermAchievement, setShowTermAchievement] = useState(false)
  const [showLearnComplete, setShowLearnComplete] = useState(false)
  const [learnedTerms, setLearnedTerms] = useState<Set<string>>(new Set())
  const [isLearning, setIsLearning] = useState(false)
  const updateProgressMutation = useUpdateUserProgress()
  const checkAchievementsMutation = useCheckAchievements()
  const updateTermProgressMutation = useUpdateTermProgress()

  // 용어가 있는지 확인
  const hasTerms = info.terms && info.terms.length > 0
  const currentTerm = hasTerms && info.terms ? info.terms[currentTermIndex] : null

  const handleNextTerm = async () => {
    if (hasTerms && info.terms) {
      // 현재 용어를 학습 완료로 표시
      const currentTerm = info.terms[currentTermIndex]
      if (currentTerm && !learnedTerms.has(currentTerm.term)) {
        try {
          await updateTermProgressMutation.mutateAsync({
            sessionId,
            term: currentTerm.term,
            date,
            infoIndex: index
          })
          setLearnedTerms(prev => {
            const newSet = new Set(prev)
            newSet.add(currentTerm.term)
            return newSet
          })
          
          // 용어 학습 완료 알림
          setShowTermAchievement(true)
          setTimeout(() => setShowTermAchievement(false), 3000)
          
          // 진행률 업데이트 콜백 호출
          if (onProgressUpdate) {
            onProgressUpdate()
          }
          
          // 성취 확인
          const achievementResult = await checkAchievementsMutation.mutateAsync(sessionId)
          if (achievementResult.new_achievements && achievementResult.new_achievements.length > 0) {
            setShowAchievement(true)
            setTimeout(() => setShowAchievement(false), 3000)
          }
        } catch (error) {
          console.error('Failed to update term progress:', error)
        }
      }
      
      // 다음 용어로 이동
      setCurrentTermIndex((prev: number) => (prev + 1) % info.terms!.length)
    }
  }

  const handleLearnComplete = async () => {
    if (isLearned || isLearning) return

    setIsLearning(true)
    try {
      await updateProgressMutation.mutateAsync({
        sessionId,
        date,
        infoIndex: index
      })
      
      // 학습 완료 알림
      setShowLearnComplete(true)
      setTimeout(() => setShowLearnComplete(false), 3000)
      
      // 진행률 업데이트 콜백 호출
      if (onProgressUpdate) {
        onProgressUpdate()
      }
      
      // 성취 확인
      const achievementResult = await checkAchievementsMutation.mutateAsync(sessionId)
      if (achievementResult.new_achievements && achievementResult.new_achievements.length > 0) {
        setShowAchievement(true)
        setTimeout(() => setShowAchievement(false), 3000)
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
    } finally {
      setIsLearning(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass rounded-2xl p-6 card-hover relative"
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isLearned ? 'bg-green-500' : 'bg-blue-500'}`}>
            {isLearned ? (
              <CheckCircle className="w-5 h-5 text-white" />
            ) : (
              <Circle className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white line-clamp-2">
              {info.title}
            </h3>
            <p className="text-white/60 text-sm">
              {isLearned ? '학습 완료' : '학습 필요'}
            </p>
          </div>
        </div>
      </div>

      {/* 내용 */}
      <div className="mb-4">
        <p className={`text-white/80 leading-relaxed whitespace-pre-line ${
          isExpanded ? '' : 'line-clamp-3'
        }`}>
          {info.content}
        </p>
        
        {info.content.length > 150 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-300 hover:text-blue-200 text-sm mt-2"
          >
            {isExpanded ? '접기' : '더보기'}
          </button>
        )}
      </div>

      {/* 용어 학습 섹션 */}
      {hasTerms && (
        <div className="mb-4">
          <button
            onClick={() => setShowTerms(!showTerms)}
            className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm font-medium mb-3"
          >
            <Brain className="w-4 h-4" />
            {showTerms ? '용어 학습 숨기기' : '관련 용어 학습하기'}
            {learnedTerms.size > 0 && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                {learnedTerms.size}개 학습완료
              </span>
            )}
          </button>
          
          {showTerms && currentTerm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
            >
              <div className="text-center mb-3">
                <div className="text-lg font-bold text-white mb-2">{currentTerm.term}</div>
                <div className="text-white/80 text-sm">{currentTerm.description}</div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60 text-xs">
                  {currentTermIndex + 1} / {info.terms?.length || 0}
                </span>
                <button
                  onClick={handleNextTerm}
                  className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                >
                  다음 용어
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={handleLearnComplete}
          disabled={isLearned || isLearning}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-all ${
            isLearned
              ? 'bg-green-500 text-white cursor-not-allowed'
              : isLearning
                ? 'bg-blue-600 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
          }`}
        >
          {isLearning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              처리 중...
            </>
          ) : isLearned ? (
            <>
              <CheckCircle className="w-4 h-4" />
              학습 완료
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4" />
              학습 완료
            </>
          )}
        </button>
        
        <button className="p-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* 학습 완료 알림 */}
      <AnimatePresence>
        {showLearnComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-xl shadow-2xl border border-green-300"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="font-bold text-sm">🎉 학습 완료!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 용어 학습 완료 알림 */}
      <AnimatePresence>
        {showTermAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-xl shadow-2xl border border-blue-300"
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 animate-bounce" />
              <span className="font-bold text-sm">✨ 용어 학습 완료!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 성취 알림 */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-xl shadow-2xl border border-yellow-300"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 animate-bounce" />
              <div>
                <div className="font-bold text-lg">🎉 성취 달성!</div>
                <div className="text-sm opacity-90">새로운 성취를 획득했습니다!</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AIInfoCard 
