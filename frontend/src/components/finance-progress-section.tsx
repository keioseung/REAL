"use client"

import { useState, useEffect } from 'react'
import { FaDollarSign, FaChartLine, FaCalendar, FaTrophy } from 'react-icons/fa'
import { financeUserProgressAPI } from '@/lib/api'

interface ProgressStats {
  user_id: number
  total_terms: number
  learned_terms: number
  overall_percentage: number
  difficulty_stats: {
    초급: { total: number; learned: number; percentage: number }
    중급: { total: number; learned: number; percentage: number }
    고급: { total: number; learned: number; percentage: number }
  }
  weekly_stats: Array<{ week: string; learned_count: number }>
  monthly_stats: Array<{ month: string; learned_count: number }>
}

interface ProgressSectionProps {
  sessionId: string
}

export default function ProgressSection({ sessionId }: ProgressSectionProps) {
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week')

  useEffect(() => {
    fetchProgressStats()
  }, [])

  const fetchProgressStats = async () => {
    try {
      setLoading(true)
      // 실제 구현에서는 사용자 ID가 필요
      const response = await financeUserProgressAPI.getStats(1)
      setStats(response.data)
    } catch (err) {
      setError('진행률을 불러오는데 실패했습니다.')
      console.error('Error fetching progress stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const getAchievementLevel = (percentage: number) => {
    if (percentage >= 90) return { level: '마스터', color: 'text-purple-400', icon: '🏆' }
    if (percentage >= 70) return { level: '전문가', color: 'text-blue-400', icon: '🥇' }
    if (percentage >= 50) return { level: '중급자', color: 'text-green-400', icon: '🥈' }
    if (percentage >= 30) return { level: '초급자', color: 'text-yellow-400', icon: '🥉' }
    return { level: '입문자', color: 'text-gray-400', icon: '🌱' }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 text-center border border-white/10">
        <FaDollarSign className="text-green-400 text-4xl mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">진행률 데이터가 없습니다</h3>
        <p className="text-white/60">금융 용어를 학습하면 진행률이 표시됩니다.</p>
      </div>
    )
  }

  const achievement = getAchievementLevel(stats.overall_percentage)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaChartLine className="text-green-400" />
          학습 진행률
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'week'
                ? 'bg-green-600 text-white'
                : 'bg-white/10 text-white/60 hover:text-white/80'
            }`}
          >
            주간
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === 'month'
                ? 'bg-green-600 text-white'
                : 'bg-white/10 text-white/60 hover:text-white/80'
            }`}
          >
            월간
          </button>
        </div>
      </div>

      {/* 전체 진행률 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <FaDollarSign className="text-green-400 text-2xl" />
            <h3 className="text-lg font-semibold text-white">전체 진행률</h3>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {stats.overall_percentage}%
            </div>
            <div className="text-sm text-white/60 mb-4">
              {stats.learned_terms} / {stats.total_terms} 용어
            </div>
            <div className={`text-lg font-semibold ${achievement.color} flex items-center justify-center gap-2`}>
              <span>{achievement.icon}</span>
              {achievement.level}
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <FaTrophy className="text-yellow-400 text-2xl" />
            <h3 className="text-lg font-semibold text-white">최근 학습</h3>
          </div>
          <div className="space-y-3">
            {stats.weekly_stats.slice(-3).map((week, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-white/60">{week.week}</span>
                <span className="text-white font-medium">{week.learned_count}개</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <FaCalendar className="text-blue-400 text-2xl" />
            <h3 className="text-lg font-semibold text-white">학습 일정</h3>
          </div>
          <div className="space-y-3">
            {stats.monthly_stats.slice(-3).map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-white/60">{month.month}</span>
                <span className="text-white font-medium">{month.learned_count}개</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 난이도별 진행률 */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">난이도별 진행률</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(stats.difficulty_stats).map(([difficulty, data]) => (
            <div key={difficulty} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{difficulty}</span>
                <span className="text-white/60 text-sm">
                  {data.learned} / {data.total}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${data.percentage}%` }}
                />
              </div>
              <div className="text-right">
                <span className="text-green-400 font-semibold">{data.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 기간별 학습 그래프 */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">
          {selectedPeriod === 'week' ? '주간' : '월간'} 학습 현황
        </h3>
        <div className="space-y-4">
          {(selectedPeriod === 'week' ? stats.weekly_stats : stats.monthly_stats).map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-24 text-sm text-white/60">
                {selectedPeriod === 'week' ? (item as { week: string; learned_count: number }).week : (item as { month: string; learned_count: number }).month}
              </div>
              <div className="flex-1 bg-white/10 rounded-full h-4 relative">
                <div
                  className="bg-green-500 h-4 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min((item.learned_count / Math.max(...(selectedPeriod === 'week' ? stats.weekly_stats : stats.monthly_stats).map(x => x.learned_count))) * 100, 100)}%` 
                  }}
                />
              </div>
              <div className="w-16 text-right">
                <span className="text-white font-medium">{item.learned_count}개</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 