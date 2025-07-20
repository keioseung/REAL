"use client"

import { useState, useEffect } from 'react'
import { FaDollarSign, FaExternalLinkAlt, FaCheck, FaTimes } from 'react-icons/fa'
import { financeInfoAPI, financeUserProgressAPI } from '@/lib/api'

interface FinanceInfo {
  id: number
  title: string
  content: string
  date: string
  source?: string
  terms: FinanceTerm[]
}

interface FinanceTerm {
  id: number
  term: string
  definition: string
  difficulty: string
}

interface FinanceInfoCardProps {
  sessionId: string
}

export default function FinanceInfoCard({ sessionId }: FinanceInfoCardProps) {
  const [financeInfo, setFinanceInfo] = useState<FinanceInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [learnedTerms, setLearnedTerms] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchFinanceInfo()
  }, [])

  const fetchFinanceInfo = async () => {
    try {
      setLoading(true)
      const response = await financeInfoAPI.getWithTerms()
      setFinanceInfo(response.data)
    } catch (err) {
      setError('금융 정보를 불러오는데 실패했습니다.')
      console.error('Error fetching finance info:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTermClick = async (termId: number) => {
    try {
      const isCurrentlyLearned = learnedTerms.has(termId)
      const newLearnedTerms = new Set(learnedTerms)
      
      if (isCurrentlyLearned) {
        newLearnedTerms.delete(termId)
      } else {
        newLearnedTerms.add(termId)
      }
      
      setLearnedTerms(newLearnedTerms)
      
      // 백엔드에 진행률 업데이트 (실제 구현에서는 사용자 ID가 필요)
      // await financeUserProgressAPI.createProgress({
      //   user_id: 1, // 실제 사용자 ID로 변경 필요
      //   finance_term_id: termId,
      //   is_learned: !isCurrentlyLearned
      // })
      
    } catch (err) {
      console.error('Error updating term progress:', err)
      // 에러 발생 시 상태 되돌리기
      setLearnedTerms(learnedTerms)
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
        <FaTimes className="text-red-400 text-3xl mx-auto mb-4" />
        <p className="text-red-400">{error}</p>
      </div>
    )
  }

  if (financeInfo.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 text-center border border-white/10">
        <FaDollarSign className="text-green-400 text-4xl mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">금융 정보가 없습니다</h3>
        <p className="text-white/60">관리자가 금융 정보를 추가하면 여기에 표시됩니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">최신 금융 정보</h2>
        <button
          onClick={fetchFinanceInfo}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          새로고침
        </button>
      </div>

      <div className="grid gap-6">
        {financeInfo.map((info) => (
          <div
            key={info.id}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{info.title}</h3>
                <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                  <span>{new Date(info.date).toLocaleDateString('ko-KR')}</span>
                  {info.source && (
                    <a
                      href={info.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-green-400 transition-colors"
                    >
                      <FaExternalLinkAlt />
                      출처
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="prose prose-invert max-w-none mb-6">
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                {info.content}
              </p>
            </div>

            {info.terms && info.terms.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FaDollarSign className="text-green-400" />
                  관련 금융 용어
                </h4>
                <div className="grid gap-3">
                  {info.terms.map((term) => (
                    <div
                      key={term.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] ${
                        learnedTerms.has(term.id)
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                      onClick={() => handleTermClick(term.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="font-semibold text-white">{term.term}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs border ${getDifficultyColor(term.difficulty)}`}>
                              {term.difficulty}
                            </span>
                            {learnedTerms.has(term.id) && (
                              <FaCheck className="text-green-400 text-sm" />
                            )}
                          </div>
                          <p className="text-white/70 text-sm leading-relaxed">
                            {term.definition}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 