'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Circle, BookOpen, ExternalLink, Brain, Trophy } from 'lucide-react'
import { useUpdateUserProgress, useCheckAchievements, useUpdateTermProgress } from '@/hooks/use-user-progress'
import type { AIInfoItem, TermItem } from '@/types'

interface AIInfoCardProps {
  info: AIInfoItem
  index: number
  date: string
  sessionId: string
  isLearned: boolean
}

function AIInfoCard({ info, index, date, sessionId, isLearned }: AIInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [currentTermIndex, setCurrentTermIndex] = useState(0)
  const [showAchievement, setShowAchievement] = useState(false)
  const [learnedTerms, setLearnedTerms] = useState<Set<string>>(new Set())
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
          setLearnedTerms(prev => new Set([...prev, currentTerm.term]))
          
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

  const handleLearn = async () => {
    if (isLearned) return

    try {
      await updateProgressMutation.mutateAsync({
        sessionId,
        date,
        infoIndex: index
      })
      
      // 성취 확인
      const achievementResult = await checkAchievementsMutation.mutateAsync(sessionId)
      if (achievementResult.new_achievements && achievementResult.new_achievements.length > 0) {
        setShowAchievement(true)
        setTimeout(() => setShowAchievement(false), 3000)
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass rounded-2xl p-6 card-hover"
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
          onClick={handleLearn}
          disabled={isLearned || updateProgressMutation.isPending}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium transition-all ${
            isLearned
              ? 'bg-green-500 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          {updateProgressMutation.isPending 
            ? '처리 중...' 
            : isLearned 
              ? '학습 완료' 
              : '학습하기'
          }
        </button>
        
        <button className="p-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all">
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* 학습 상태 표시 */}
      {isLearned && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
        >
          <div className="flex items-center gap-2 text-green-300">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">학습 완료!</span>
          </div>
        </motion.div>
      )}

      {/* 성취 알림 */}
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
    </motion.div>
  )
}

export default AIInfoCard 
