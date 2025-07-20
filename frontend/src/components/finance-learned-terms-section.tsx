"use client"

import { useState, useEffect } from 'react'
import { FaDollarSign, FaCalendar, FaFilter, FaCheck } from 'react-icons/fa'
import { financeUserProgressAPI } from '@/lib/api'

interface LearnedTerm {
  id: number
  term: string
  definition: string
  difficulty: string
  learned_at: string
  finance_info: {
    id: number
    title: string
    date: string
  }
}

interface LearnedTermsSectionProps {
  sessionId: string
}

export default function LearnedTermsSection({ sessionId }: LearnedTermsSectionProps) {
  const [learnedTerms, setLearnedTerms] = useState<LearnedTerm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState('all')
  const [availableDates, setAvailableDates] = useState<string[]>([])

  useEffect(() => {
    fetchLearnedTerms()
  }, [selectedDate])

  const fetchLearnedTerms = async () => {
    try {
      setLoading(true)
      // 실제 구현에서는 사용자 ID가 필요
      const response = await financeUserProgressAPI.getLearnedTerms(1, selectedDate)
      setLearnedTerms(response.data)
      
      // 사용 가능한 날짜들 추출
      const dateStrings = response.data.map((term: LearnedTerm) => 
        term.learned_at.split(' ')[0]
      )
      const uniqueDates = Array.from(new Set(dateStrings))
      const sortedDates = uniqueDates.sort().reverse()
      setAvailableDates(sortedDates)
    } catch (err) {
      setError('학습한 용어를 불러오는데 실패했습니다.')
      console.error('Error fetching learned terms:', err)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '초급':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case '중급':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case '고급':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaDollarSign className="text-green-400" />
          학습한 금융 용어
        </h2>
        <div className="flex items-center gap-3">
          <FaFilter className="text-white/60" />
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
          >
            <option value="all">전체 기간</option>
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {formatDate(date)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {learnedTerms.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 text-center border border-white/10">
          <FaDollarSign className="text-green-400 text-4xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">학습한 용어가 없습니다</h3>
          <p className="text-white/60">
            {selectedDate === 'all' 
              ? '금융 정보 탭에서 용어를 클릭하여 학습을 시작하세요.'
              : '선택한 날짜에 학습한 용어가 없습니다.'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {learnedTerms.map((term) => (
            <div
              key={term.id}
              className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-white">{term.term}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getDifficultyColor(term.difficulty)}`}>
                      {term.difficulty}
                    </span>
                    <FaCheck className="text-green-400 text-sm" />
                  </div>
                  
                  <p className="text-white/70 mb-4 leading-relaxed">
                    {term.definition}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <div className="flex items-center gap-1">
                      <FaCalendar />
                      <span>학습일: {formatDate(term.learned_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaDollarSign />
                      <span>출처: {term.finance_info.title}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">
            총 {learnedTerms.length}개의 용어를 학습했습니다
          </span>
          <span className="text-green-400 font-medium">
            {selectedDate === 'all' ? '전체 기간' : formatDate(selectedDate)}
          </span>
        </div>
      </div>
    </div>
  )
} 