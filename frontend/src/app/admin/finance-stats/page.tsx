"use client"

import { useState, useEffect } from 'react'
import { FaDollarSign, FaChartLine, FaUsers, FaTrophy, FaCalendar, FaFilter } from 'react-icons/fa'
import { financeStatsAPI } from '@/lib/api'

interface FinanceStats {
  total_users: number
  total_terms: number
  total_learned: number
  total_quizzes: number
  total_quiz_attempts: number
  average_score: number
  difficulty_stats: {
    초급: { total: number; learned: number; percentage: number }
    중급: { total: number; learned: number; percentage: number }
    고급: { total: number; learned: number; percentage: number }
  }
  category_stats: {
    [key: string]: { total: number; learned: number; percentage: number }
  }
  weekly_activity: Array<{ week: string; users: number; terms: number; quizzes: number }>
  monthly_activity: Array<{ month: string; users: number; terms: number; quizzes: number }>
  top_users: Array<{ user_id: number; username: string; learned_count: number; quiz_score: number }>
}

export default function FinanceStatsAdminPage() {
  const [stats, setStats] = useState<FinanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await financeStatsAPI.getOverallStats()
      setStats(response.data)
    } catch (err) {
      setError('통계를 불러오는데 실패했습니다.')
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
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
        <h3 className="text-xl font-bold text-white mb-2">통계 데이터가 없습니다</h3>
        <p className="text-white/60">금융 학습 데이터가 쌓이면 통계가 표시됩니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaChartLine className="text-green-400" />
          금융 학습 통계
        </h1>
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

      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <FaUsers className="text-blue-400 text-2xl" />
            <h3 className="text-lg font-semibold text-white">전체 사용자</h3>
          </div>
          <div className="text-3xl font-bold text-white">{stats.total_users.toLocaleString()}</div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <FaDollarSign className="text-green-400 text-2xl" />
            <h3 className="text-lg font-semibold text-white">전체 용어</h3>
          </div>
          <div className="text-3xl font-bold text-white">{stats.total_terms.toLocaleString()}</div>
          <div className="text-sm text-white/60 mt-2">
            학습 완료: {stats.total_learned.toLocaleString()}개
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <FaTrophy className="text-yellow-400 text-2xl" />
            <h3 className="text-lg font-semibold text-white">퀴즈 통계</h3>
          </div>
          <div className="text-3xl font-bold text-white">{stats.total_quizzes.toLocaleString()}</div>
          <div className="text-sm text-white/60 mt-2">
            평균 점수: {stats.average_score.toFixed(1)}점
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <FaCalendar className="text-purple-400 text-2xl" />
            <h3 className="text-lg font-semibold text-white">학습률</h3>
          </div>
          <div className="text-3xl font-bold text-white">
            {((stats.total_learned / stats.total_terms) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-white/60 mt-2">
            총 시도: {stats.total_quiz_attempts.toLocaleString()}회
          </div>
        </div>
      </div>

      {/* 난이도별 통계 */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">난이도별 학습 현황</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(stats.difficulty_stats).map(([difficulty, data]) => (
            <div key={difficulty} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{difficulty}</span>
                <span className="text-white/60 text-sm">
                  {data.learned} / {data.total}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
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

      {/* 카테고리별 통계 */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">카테고리별 학습 현황</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(stats.category_stats).map(([category, data]) => (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{category}</span>
                <span className="text-white/60 text-sm">
                  {data.learned} / {data.total}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${data.percentage}%` }}
                />
              </div>
              <div className="text-right">
                <span className="text-blue-400 font-semibold">{data.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 활동 그래프 */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">
          {selectedPeriod === 'week' ? '주간' : '월간'} 활동 현황
        </h3>
        <div className="space-y-4">
          {(selectedPeriod === 'week' ? stats.weekly_activity : stats.monthly_activity).map((item, index) => {
            const periodLabel = selectedPeriod === 'week' 
              ? (item as { week: string }).week 
              : (item as { month: string }).month;
            const activityData = selectedPeriod === 'week' ? stats.weekly_activity : stats.monthly_activity;
            const maxUsers = Math.max(...activityData.map(x => x.users));
            
            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-white/60">
                  {periodLabel}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-blue-400 text-sm" />
                      <span className="text-white text-sm">{item.users}명</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaDollarSign className="text-green-400 text-sm" />
                      <span className="text-white text-sm">{item.terms}개</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaTrophy className="text-yellow-400 text-sm" />
                      <span className="text-white text-sm">{item.quizzes}회</span>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((item.users / maxUsers) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 상위 사용자 */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">상위 학습자</h3>
        <div className="space-y-4">
          {stats.top_users.map((user, index) => (
            <div key={user.user_id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="text-white font-medium">{user.username}</div>
                  <div className="text-white/60 text-sm">
                    학습: {user.learned_count}개 | 퀴즈: {user.quiz_score}점
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-semibold">
                  {((user.learned_count / stats.total_terms) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 