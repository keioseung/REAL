"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaDollarSign, FaArrowRight, FaGlobe, FaCode, FaBrain, FaRocket, FaChartLine, FaTrophy, FaLightbulb, FaUsers, FaBookOpen, FaCalendar, FaClipboard, FaBullseye, FaFire, FaStar, FaCrosshairs, FaChartBar } from 'react-icons/fa'
import { TrendingUp, Calendar, Trophy, Sun, Target, BarChart3, BookOpen } from 'lucide-react'
import FinanceInfoCard from '@/components/finance-info-card'
import FinanceTermsQuizSection from '@/components/finance-terms-quiz-section'
import FinanceProgressSection from '@/components/finance-progress-section'
import FinanceLearnedTermsSection from '@/components/finance-learned-terms-section'
import { useFinanceInfo } from '@/hooks/use-finance-info'
import { useFinanceUserProgress, useFinanceUserStats } from '@/hooks/use-finance-user-progress'
import { useRouter } from 'next/navigation'
import { useFetchFinanceNews } from '@/hooks/use-finance-info'
import { useQueryClient } from '@tanstack/react-query'
import { financeUserProgressAPI } from '@/lib/api'

// 예시 금융 용어 데이터
const FINANCE_TERMS = [
  { term: '주식', desc: '기업의 소유권을 나타내는 증권으로, 기업의 수익에 대한 권리를 가집니다.' },
  { term: '배당', desc: '기업이 주주들에게 이익의 일부를 현금이나 주식으로 지급하는 것.' },
  { term: 'PER', desc: '주가수익비율로, 주가를 주당순이익으로 나눈 값입니다.' },
  { term: 'PBR', desc: '주가순자산비율로, 주가를 주당순자산으로 나눈 값입니다.' },
  { term: 'ROE', desc: '자기자본이익률로, 순이익을 자기자본으로 나눈 비율입니다.' },
  { term: '채권', desc: '정부나 기업이 자금을 조달하기 위해 발행하는 차용증서입니다.' },
  { term: '이자율', desc: '대출이나 투자에 대한 수익률을 나타내는 비율입니다.' },
  { term: '인플레이션', desc: '물가가 지속적으로 상승하는 경제 현상입니다.' },
  { term: '디플레이션', desc: '물가가 지속적으로 하락하는 경제 현상입니다.' },
  { term: 'GDP', desc: '국내총생산으로, 한 나라에서 생산된 모든 재화와 서비스의 가치입니다.' },
]

// 1. 주간 학습 현황 막대 그래프 컴포넌트 추가 (탭 위에)
function WeeklyBarGraph({ weeklyData }: { weeklyData: any[] }) {
  const maxFinance = 3;
  const maxTerms = 20;
  const maxQuiz = 100;
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex justify-between mb-2 px-2">
        {weeklyData.map((day, idx) => (
          <div key={idx} className={`text-xs font-bold text-center ${day.isToday ? 'text-yellow-400' : 'text-white/60'}`}>{day.day}</div>
        ))}
      </div>
      <div className="flex gap-2 h-32 items-end">
        {weeklyData.map((day, idx) => {
          const financeHeight = Math.round((day.finance / maxFinance) * 80);
          const termsHeight = Math.round((day.terms / maxTerms) * 80);
          const quizHeight = Math.round((day.quiz / maxQuiz) * 80);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div className="flex flex-col-reverse h-28 w-6 relative">
                {/* 퀴즈 */}
                <div style={{ height: `${quizHeight}px` }} className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-md" />
                {/* 용어 */}
                <div style={{ height: `${termsHeight}px` }} className="w-full bg-gradient-to-t from-emerald-500 to-teal-400" />
                {/* 금융 정보 */}
                <div style={{ height: `${financeHeight}px` }} className="w-full bg-gradient-to-t from-green-600 to-green-500 rounded-b-md" />
                {day.isToday && <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-yellow-400 font-bold">오늘</div>}
              </div>
              <div className="mt-1 text-xs text-white/70">{day.finance + day.terms + Math.round(day.quiz/10)}</div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 px-2 text-[10px] text-white/40">
        <div>금융</div><div>용어</div><div>퀴즈</div>
      </div>
    </div>
  );
}

export default function FinanceDashboardPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('finance_sessionId')
      if (!id) {
        id = Math.random().toString(36).substring(2, 15)
        localStorage.setItem('finance_sessionId', id)
      }
      return id
    }
    return 'default'
  })
  const { data: financeInfo, isLoading: financeInfoLoading } = useFinanceInfo(selectedDate)
  const { data: userProgress, isLoading: progressLoading } = useFinanceUserProgress(sessionId)
  const { data: userStats } = useFinanceUserStats(sessionId)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'finance' | 'quiz' | 'progress' | 'news' | 'term'>('finance')
  const { data: news, isLoading: newsLoading } = useFetchFinanceNews()
  const [randomTerm, setRandomTerm] = useState(() => FINANCE_TERMS[Math.floor(Math.random() * FINANCE_TERMS.length)])
  
  // 타이핑 애니메이션 상태
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const fullText = "Finance Mastery Hub"
  
  // 환영 메시지 애니메이션
  const [currentWelcome, setCurrentWelcome] = useState(0)
  const welcomeMessages = [
    "오늘도 금융 학습을 시작해보세요! 💰",
    "새로운 금융 지식이 여러분을 기다리고 있어요! 📈",
    "함께 성장하는 금융 여정을 떠나볼까요? 🌟"
  ]

  const handleRandomTerm = () => {
    setRandomTerm(FINANCE_TERMS[Math.floor(Math.random() * FINANCE_TERMS.length)])
  }

  // 타이핑 애니메이션
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 150)
      return () => clearTimeout(timeout)
    } else {
      setIsTyping(false)
    }
  }, [currentIndex, fullText])

  // 환영 메시지 순환
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWelcome((prev) => (prev + 1) % welcomeMessages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [welcomeMessages.length])

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.replace('/auth')
      return
    }
    const user = JSON.parse(userStr)
    if (user.role !== 'user') {
      router.replace('/admin')
    }
  }, [router])

  // 학습 진행률 계산 (로컬 스토리지와 백엔드 데이터 통합)
  const totalFinanceInfo = financeInfo?.length || 0
  
  // 로컬 스토리지에서 학습 상태 확인 (강제 업데이트 포함)
  const localProgress = (() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('financeUserProgress')
        if (stored) {
          const parsed = JSON.parse(stored)
          return parsed[sessionId]?.[selectedDate] || []
        }
      } catch (error) {
        console.error('Failed to parse local progress:', error)
      }
    }
    return []
  })()
  
  // 백엔드 데이터와 로컬 데이터 통합
  const backendProgress = userProgress?.[selectedDate] || []
  const learnedFinanceInfo = Math.max(localProgress.length, backendProgress.length)
  const financeInfoProgress = totalFinanceInfo > 0 ? (learnedFinanceInfo / totalFinanceInfo) * 100 : 0

  const totalTerms = 60 // 3개 금융 정보 × 20개 용어씩
  const learnedTerms = Array.isArray(userProgress?.total_terms_learned) ? userProgress.total_terms_learned.length : (userProgress?.total_terms_learned ?? 0)
  const termsProgress = totalTerms > 0 ? (learnedTerms / totalTerms) * 100 : 0

  // 퀴즈 점수 계산 - 당일 푼 전체 문제수가 분모, 정답 맞춘 총 개수가 분자
  const quizScore = (() => {
    if (typeof userProgress?.quiz_score === 'number') {
      return Math.min(userProgress.quiz_score, 100)
    }
    if (Array.isArray(userProgress?.quiz_score)) {
      const totalQuestions = userProgress.quiz_score.length
      const correctAnswers = userProgress.quiz_score.filter((score: number) => score > 0).length
      return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    }
    return 0
  })()
  const maxQuizScore = 100
  const quizProgress = (quizScore / maxQuizScore) * 100

  const streakDays = Array.isArray(userProgress?.streak_days) ? userProgress.streak_days.length : (userProgress?.streak_days ?? 0)
  const maxStreak = Array.isArray(userProgress?.max_streak) ? userProgress.max_streak.length : (userProgress?.max_streak ?? 0)
  const streakProgress = maxStreak > 0 ? (streakDays / maxStreak) * 100 : 0

  // 오늘 날짜 확인
  const today = new Date()
  const todayDay = today.getDay() // 0: 일요일, 1: 월요일, ..., 6: 토요일

  // 주간 학습 데이터 - 실제 사용자 데이터 기반 (월~일 7일 모두)
  const getWeeklyDates = () => {
    const dates = []
    const today = new Date()
    const dayOfWeek = today.getDay() // 0: 일요일, 1: 월요일, ..., 6: 토요일
    
    // 월요일부터 시작하도록 조정
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }

  const weeklyDates = getWeeklyDates()
  const weeklyData = weeklyDates.map((date, index) => {
    const dayNames = ['월', '화', '수', '목', '금', '토', '일']
    const isToday = date === today.toISOString().split('T')[0]
    
    // 실제 사용자 데이터에서 해당 날짜의 학습 현황 가져오기
    const dayProgress = userProgress?.[date] || []
    const dayTerms = userProgress?.total_terms_learned?.filter((term: any) => 
      term.date === date
    ) || []
    const dayQuiz = userProgress?.quiz_score?.filter((score: any) => 
      score.date === date
    ) || []
    
    return {
      day: dayNames[index],
      finance: dayProgress.length,
      terms: dayTerms.length,
      quiz: dayQuiz.length,
      isToday
    }
  })

  // 강제 업데이트 상태
  const [forceUpdate, setForceUpdate] = useState(0)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleProgressUpdate = () => {
    setForceUpdate(prev => prev + 1)
    queryClient.invalidateQueries(['financeUserProgress', sessionId])
    queryClient.invalidateQueries(['financeUserStats', sessionId])
  }

  const handleRefresh = () => window.location.reload()

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  // 금융 정보 데이터 고정 (로딩 중이거나 데이터가 없을 때 기본값)
  const financeInfoFixed = financeInfo || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 relative overflow-hidden">
      {/* 배경 애니메이션 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-green-400/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* 토스트 알림 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-8 left-1/2 z-50 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl text-white font-bold text-lg glass"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 헤더 섹션 */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-8 md:pt-12 pb-6">
        {/* 상단 아이콘과 제목 */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-6 md:mb-8 text-center md:text-left">
          <div className="relative">
            <span className="text-5xl md:text-6xl text-green-400 drop-shadow-2xl animate-bounce-slow">
              <FaDollarSign />
            </span>
            <div className="absolute -top-2 -right-2 w-4 h-4 md:w-6 md:h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse" />
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent drop-shadow-2xl tracking-tight leading-tight">
              {typedText}
              {isTyping && <span className="animate-blink">|</span>}
            </h1>
            <div className="h-6 md:h-8 mt-2">
              <p className="text-lg md:text-xl lg:text-2xl text-green-300 font-medium animate-fade-in-out">
                {welcomeMessages[currentWelcome]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 날짜 선택 (금융 정보 탭에서만 표시) */}
      {activeTab === 'finance' && (
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="glass backdrop-blur-xl rounded-2xl px-4 md:px-8 py-3 md:py-4 flex items-center gap-4 md:gap-6 shadow-xl border border-white/10">
            <FaCalendar className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)} 
              className="p-2 md:p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-300 text-sm md:text-lg font-semibold shadow" 
              style={{ minWidth: 140, maxWidth: 180 }} 
            />
            <span className="px-2 md:px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xs md:text-sm shadow">
              {selectedDate === new Date().toISOString().split('T')[0] ? '오늘' : selectedDate}
            </span>
          </div>
        </div>
      )}

      {/* 탭 메뉴 */}
      <div className="flex justify-center mb-6 md:mb-8">
        <div className="flex flex-wrap gap-2 md:gap-4 bg-white/10 backdrop-blur-xl rounded-2xl p-2 md:p-3 shadow-lg border border-white/10">
          {[
            { id: 'finance', label: '금융 정보', gradient: 'from-green-500 to-emerald-500' },
            { id: 'quiz', label: '용어 퀴즈', gradient: 'from-emerald-500 to-teal-500' },
            { id: 'progress', label: '진행률', gradient: 'from-teal-500 to-green-500' },
            { id: 'news', label: '금융 뉴스', gradient: 'from-green-500 to-teal-500' },
            { id: 'term', label: '용어 학습', gradient: 'from-emerald-500 to-green-500' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-base transition-all ${
                activeTab === tab.id 
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg` 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button 
          onClick={handleRefresh} 
          className="ml-3 md:ml-6 px-3 md:px-4 py-2 bg-white/20 backdrop-blur-xl text-white rounded-lg hover:bg-white/30 transition-all font-semibold shadow border border-white/10"
        >
          새로고침
        </button>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 pb-8 md:pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="max-w-4xl mx-auto"
        >
          {/* 탭별 컨텐츠 */}
          {activeTab === 'finance' && (
            <section className="mb-8 md:mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {financeInfoFixed.length === 0 && (
                  <div className="glass backdrop-blur-xl rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center text-white/70 shadow-xl min-h-[180px] border border-white/10">
                    <FaBookOpen className="w-10 h-10 md:w-12 md:h-12 mb-3 opacity-60" />
                    <span className="text-base md:text-lg font-semibold">금융 정보가 없습니다</span>
                  </div>
                )}
                {financeInfoFixed.map((info, index) => {
                  // 로컬 스토리지와 백엔드 데이터를 모두 확인하여 학습 상태 결정
                  const isLearnedLocally = localProgress.includes(index)
                  const isLearnedBackend = backendProgress.includes(index)
                  const isLearned = isLearnedLocally || isLearnedBackend
                  
                  return (
                    <FinanceInfoCard
                      key={index}
                      info={info}
                      index={index}
                      date={selectedDate}
                      sessionId={sessionId}
                      isLearned={isLearned}
                      onProgressUpdate={handleProgressUpdate}
                      forceUpdate={forceUpdate}
                      setForceUpdate={setForceUpdate}
                    />
                  )
                })}
              </div>
            </section>
          )}
          {activeTab === 'quiz' && (
            <section className="mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6 md:mb-8 flex items-center gap-3 md:gap-4 drop-shadow">
                <Target className="w-6 h-6 md:w-8 md:h-8" />
                용어 퀴즈
              </h2>
              <FinanceTermsQuizSection 
                sessionId={sessionId} 
                selectedDate={selectedDate} 
                onProgressUpdate={handleProgressUpdate}
                onDateChange={setSelectedDate}
              />
            </section>
          )}
          {activeTab === 'progress' && (
            <section className="mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6 md:mb-8 flex items-center gap-3 md:gap-4 drop-shadow">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8" />
                나의 학습 성장도
              </h2>
              <FinanceProgressSection 
                sessionId={sessionId} 
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </section>
          )}
          {activeTab === 'news' && (
            <section className="mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6 md:mb-8 flex items-center gap-3 md:gap-4 drop-shadow">
                <FaBookOpen className="w-6 h-6 md:w-8 md:h-8" />
                금융 뉴스
              </h2>
              {newsLoading ? (
                <div className="text-white/80 text-center">뉴스를 불러오는 중...</div>
              ) : news && news.length > 0 ? (
                <div className="space-y-4 md:space-y-6">
                  {news.map((item: any, idx: number) => (
                    <a 
                      key={idx} 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block glass backdrop-blur-xl rounded-2xl p-4 md:p-6 shadow hover:bg-white/10 transition-all border border-white/10"
                    >
                      <h3 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-white/80 mb-2 line-clamp-3">{item.content}</p>
                      <span className="text-green-300 text-sm">뉴스 원문 보기 →</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-white/70 text-center">금융 뉴스가 없습니다.</div>
              )}
            </section>
          )}
          {activeTab === 'term' && (
            <section className="mb-8 md:mb-16">
              <FinanceLearnedTermsSection sessionId={sessionId} />
            </section>
          )}
        </motion.div>
      </main>
    </div>
  )
} 