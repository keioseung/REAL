"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaDollarSign, FaChartBar, FaCoins, FaChartLine, FaBrain, FaRocket, FaArrowLeft } from 'react-icons/fa'
import FinanceInfoCard from '@/components/finance-info-card'
import LearnedTermsSection from '@/components/finance-learned-terms-section'
import ProgressSection from '@/components/finance-progress-section'
import TermsQuizSection from '@/components/finance-terms-quiz-section'

export default function FinanceDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('info')
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('finance_session_id') || `finance_${Date.now()}`
    }
    return `finance_${Date.now()}`
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('finance_session_id', sessionId)
    }
  }, [sessionId])

  const tabs = [
    { id: 'info', label: '금융 정보', icon: FaDollarSign },
    { id: 'terms', label: '학습한 용어', icon: FaBrain },
    { id: 'quiz', label: '용어 퀴즈', icon: FaRocket },
    { id: 'progress', label: '학습 진행률', icon: FaChartLine }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* 헤더 */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <FaArrowLeft />
                <span>홈으로</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <FaDollarSign className="text-white text-lg" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">금융 학습 시스템</h1>
                  <p className="text-sm text-white/60">최신 금융 정보와 용어를 학습하세요</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white/60">세션 ID</p>
                <p className="text-xs text-white/40 font-mono">{sessionId.slice(-8)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-white/60 hover:text-white/80'
                }`}
              >
                <tab.icon className="text-lg" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'info' && (
          <FinanceInfoCard sessionId={sessionId} />
        )}
        
        {activeTab === 'terms' && (
          <LearnedTermsSection sessionId={sessionId} />
        )}
        
        {activeTab === 'quiz' && (
          <TermsQuizSection sessionId={sessionId} />
        )}
        
        {activeTab === 'progress' && (
          <ProgressSection sessionId={sessionId} />
        )}
      </div>
    </div>
  )
} 