'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Circle, BookOpen, ExternalLink } from 'lucide-react'
import { useUpdateUserProgress } from '@/hooks/use-user-progress'
import type { AIInfoItem } from '@/types'

interface AIInfoCardProps {
  info: AIInfoItem
  index: number
  date: string
  sessionId: string
  isLearned: boolean
}

function AIInfoCard({ info, index, date, sessionId, isLearned }: AIInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const updateProgressMutation = useUpdateUserProgress()

  const handleLearn = async () => {
    if (isLearned) return

    try {
      await updateProgressMutation.mutateAsync({
        sessionId,
        date,
        infoIndex: index
      })
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
    </motion.div>
  )
}

export default AIInfoCard 
