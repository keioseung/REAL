'use client'

import { motion } from 'framer-motion'
import { Trophy, Target, TrendingUp, Calendar } from 'lucide-react'
import { useUserStats } from '@/hooks/use-user-progress'

interface ProgressSectionProps {
  sessionId: string
}

function ProgressSection({ sessionId }: ProgressSectionProps) {
  const { data: stats } = useUserStats(sessionId)

  const achievements = [
    {
      id: 'first_10',
      name: '첫 10개 학습',
      description: '10개의 AI 정보를 학습했습니다',
      icon: '🎯',
      unlocked: stats?.achievements?.includes('first_10') || false,
    },
    {
      id: 'first_50',
      name: '학습 마스터',
      description: '50개의 AI 정보를 학습했습니다',
      icon: '🏆',
      unlocked: stats?.achievements?.includes('first_50') || false,
    },
    {
      id: 'week_streak',
      name: '일주일 연속',
      description: '7일 연속으로 학습했습니다',
      icon: '🔥',
      unlocked: stats?.achievements?.includes('week_streak') || false,
    },
    {
      id: 'quiz_master',
      name: '퀴즈 마스터',
      description: '퀴즈 점수가 80점 이상입니다',
      icon: '🧠',
      unlocked: stats?.achievements?.includes('quiz_master') || false,
    },
  ]

  const progressPercentage = stats?.total_learned ? Math.min((stats.total_learned / 100) * 100, 100) : 0

  return (
    <section className="mb-8">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <Trophy className="w-8 h-8" />
        학습 진행상황
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 진행상황 카드 */}
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

        {/* 성취 배지 */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            성취 배지
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-4 rounded-lg text-center transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h4 className={`font-semibold mb-1 ${
                  achievement.unlocked ? 'text-white' : 'text-white/50'
                }`}>
                  {achievement.name}
                </h4>
                <p className={`text-xs ${
                  achievement.unlocked ? 'text-white/80' : 'text-white/30'
                }`}>
                  {achievement.description}
                </p>
                {achievement.unlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-2 inline-block px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-full"
                  >
                    획득!
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 연속 학습 통계 */}
      {stats && stats.streak_days > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 glass rounded-2xl p-6"
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
    </section>
  )
}

export default ProgressSection 
