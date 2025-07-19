"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaArrowRight, FaGlobe, FaCode, FaBrain, FaRocket, FaChartLine, FaTrophy, FaLightbulb, FaUsers, FaBookOpen, FaCalendar, FaClipboard, FaBullseye, FaFire, FaStar, FaCrosshairs, FaChartBar } from 'react-icons/fa'
import Sidebar from '@/components/sidebar'
import AIInfoCard from '@/components/ai-info-card'
import TermsQuizSection from '@/components/terms-quiz-section'
import ProgressSection from '@/components/progress-section'
import LearnedTermsSection from '@/components/learned-terms-section'
import useAIInfo from '@/hooks/use-ai-info'
import useUserProgress from '@/hooks/use-user-progress'
import { useRouter } from 'next/navigation'
import { useFetchAINews } from '@/hooks/use-ai-info'
import { useQueryClient } from '@tanstack/react-query'

// 예시 용어 데이터
const TERMS = [
  { term: '딥러닝', desc: '인공신경망을 기반으로 한 기계학습의 한 분야로, 대량의 데이터에서 패턴을 학습합니다.' },
  { term: '과적합', desc: '모델이 학습 데이터에 너무 맞춰져서 새로운 데이터에 일반화가 잘 안 되는 현상.' },
  { term: '정규화', desc: '데이터의 범위를 일정하게 맞추거나, 모델의 복잡도를 제한하는 기법.' },
  { term: '파라미터', desc: '모델이 학습을 통해 조정하는 값(가중치 등).' },
  { term: '하이퍼파라미터', desc: '학습 전에 사람이 직접 설정하는 값(학습률, 배치 크기 등).' },
  { term: '배치', desc: '한 번에 모델에 입력되는 데이터 묶음.' },
  { term: '드롭아웃', desc: '신경망 학습 시 일부 뉴런을 임의로 꺼서 과적합을 방지하는 기법.' },
  { term: '활성화 함수', desc: '신경망에서 입력 신호를 출력 신호로 변환하는 함수.' },
  { term: '임베딩', desc: '고차원 데이터를 저차원 벡터로 변환하는 표현 방법.' },
  { term: '컨볼루션', desc: '합성곱 신경망(CNN)에서 특징을 추출하는 연산.' },
]

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('sessionId')
      if (!id) {
        id = Math.random().toString(36).substring(2, 15)
        localStorage.setItem('sessionId', id)
      }
      return id
    }
    return 'default'
  })
  const { data: aiInfo, isLoading: aiInfoLoading } = useAIInfo(selectedDate)
  const { data: userProgress, isLoading: progressLoading } = useUserProgress(sessionId)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'ai' | 'quiz' | 'progress' | 'news' | 'term'>('ai')
  const { data: news, isLoading: newsLoading } = useFetchAINews()
  const [randomTerm, setRandomTerm] = useState(() => TERMS[Math.floor(Math.random() * TERMS.length)])
  
  // 타이핑 애니메이션 상태
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const fullText = "AI Mastery Hub"
  
  // 환영 메시지 애니메이션
  const [currentWelcome, setCurrentWelcome] = useState(0)
  const welcomeMessages = [
    "오늘도 AI 학습을 시작해보세요! 🚀",
    "새로운 지식이 여러분을 기다리고 있어요! 💡",
    "함께 성장하는 AI 여정을 떠나볼까요? 🌟"
  ]

  const handleRandomTerm = () => {
    setRandomTerm(TERMS[Math.floor(Math.random() * TERMS.length)])
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

  // 학습 진행률 계산
  const totalAIInfo = aiInfo?.length || 0
  const learnedAIInfo = userProgress?.[selectedDate]?.length || 0
  const aiInfoProgress = totalAIInfo > 0 ? (learnedAIInfo / totalAIInfo) * 100 : 0

  const totalTerms = Array.isArray(userProgress?.total_terms_available) ? userProgress.total_terms_available.length : (userProgress?.total_terms_available ?? 0)
  const learnedTerms = Array.isArray(userProgress?.total_terms_learned) ? userProgress.total_terms_learned.length : (userProgress?.total_terms_learned ?? 0)
  const termsProgress = totalTerms > 0 ? (learnedTerms / totalTerms) * 100 : 0

  const quizScore = Array.isArray(userProgress?.quiz_score) ? userProgress.quiz_score.length : (userProgress?.quiz_score ?? 0)
  const maxQuizScore = 100
  const quizProgress = (quizScore / maxQuizScore) * 100

  const streakDays = Array.isArray(userProgress?.streak_days) ? userProgress.streak_days.length : (userProgress?.streak_days ?? 0)
  const maxStreak = Array.isArray(userProgress?.max_streak) ? userProgress.max_streak.length : (userProgress?.max_streak ?? 0)
  const streakProgress = maxStreak > 0 ? (streakDays / maxStreak) * 100 : 0

  // 주간 학습 데이터 (예시)
  const weeklyData = [
    { day: '월', ai: 2, terms: 3, quiz: 80 },
    { day: '화', ai: 1, terms: 2, quiz: 90 },
    { day: '수', ai: 3, terms: 4, quiz: 85 },
    { day: '목', ai: 2, terms: 1, quiz: 95 },
    { day: '금', ai: 1, terms: 3, quiz: 88 },
    { day: '토', ai: 0, terms: 0, quiz: 0 },
    { day: '일', ai: 0, terms: 0, quiz: 0 },
  ]

  // AI 정보 3개만 정확히 보여줌
  const aiInfoFixed = aiInfo && aiInfo.length > 0 ? aiInfo.slice(0, 3) : []

  // 진행률 업데이트 핸들러
  const handleProgressUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['user-progress', sessionId] })
    queryClient.invalidateQueries({ queryKey: ['user-stats', sessionId] })
    queryClient.invalidateQueries({ queryKey: ['learned-terms', sessionId] })
  }

  // 새로고침 핸들러(탭별)
  const handleRefresh = () => window.location.reload()

  // 토스트 알림 상태
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden px-4">
      {/* 고급스러운 배경 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,255,0.15),transparent_50%)]" />
      
      {/* 움직이는 파티클 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
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
            className={`fixed top-8 left-1/2 z-50 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl text-white font-bold text-lg ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
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
            <span className="text-5xl md:text-6xl text-purple-400 drop-shadow-2xl animate-bounce-slow">
              <FaRobot />
            </span>
            <div className="absolute -top-2 -right-2 w-4 h-4 md:w-6 md:h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse" />
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl tracking-tight leading-tight">
              {typedText}
              {isTyping && <span className="animate-blink">|</span>}
            </h1>
            <div className="h-6 md:h-8 mt-2">
              <p className="text-lg md:text-xl lg:text-2xl text-purple-300 font-medium animate-fade-in-out">
                {welcomeMessages[currentWelcome]}
              </p>
            </div>
          </div>
        </div>

        {/* 실시간 진행률 게이지 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 w-full max-w-6xl">
          {/* AI 정보 학습 진행률 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <FaBrain className="text-white text-lg md:text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">AI 정보</h3>
                  <p className="text-white/60 text-sm">{learnedAIInfo}/{totalAIInfo} 완료</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${aiInfoProgress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </motion.div>
              </div>
              <div className="text-center mt-2">
                <span className="text-white font-bold text-lg">{Math.round(aiInfoProgress)}%</span>
              </div>
            </div>
          </motion.div>

          {/* 용어 학습 진행률 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <FaCrosshairs className="text-white text-lg md:text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">용어 학습</h3>
                  <p className="text-white/60 text-sm">{learnedTerms}/{totalTerms} 완료</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${termsProgress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </motion.div>
              </div>
              <div className="text-center mt-2">
                <span className="text-white font-bold text-lg">{Math.round(termsProgress)}%</span>
              </div>
            </div>
          </motion.div>

          {/* 퀴즈 점수 진행률 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <FaBullseye className="text-white text-lg md:text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">퀴즈 점수</h3>
                  <p className="text-white/60 text-sm">{quizScore}/100점</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${quizProgress}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </motion.div>
              </div>
              <div className="text-center mt-2">
                <span className="text-white font-bold text-lg">{Math.round(quizProgress)}%</span>
              </div>
            </div>
          </motion.div>

          {/* 연속 학습 진행률 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <FaFire className="text-white text-lg md:text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">연속 학습</h3>
                  <p className="text-white/60 text-sm">{streakDays}일 연속</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${streakProgress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </motion.div>
              </div>
              <div className="text-center mt-2">
                <span className="text-white font-bold text-lg">{Math.round(streakProgress)}%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 주간 학습 차트 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass backdrop-blur-xl rounded-2xl p-4 md:p-6 mb-6 md:mb-8 w-full max-w-6xl border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <FaChartBar className="text-white text-sm md:text-base" />
            </div>
            <h3 className="text-white font-bold text-lg md:text-xl">주간 학습 현황</h3>
          </div>
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {weeklyData.map((day, index) => (
              <div key={day.day} className="text-center">
                <div className="text-white/60 text-xs md:text-sm mb-2">{day.day}</div>
                <div className="space-y-1">
                  <div className="h-8 md:h-12 bg-gradient-to-b from-blue-500/20 to-blue-500/40 rounded-t-sm relative">
                    {day.ai > 0 && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.ai / 3) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t-sm"
                      />
                    )}
                  </div>
                  <div className="h-8 md:h-12 bg-gradient-to-b from-purple-500/20 to-purple-500/40 rounded-t-sm relative">
                    {day.terms > 0 && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.terms / 4) * 100}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                        className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-sm"
                      />
                    )}
                  </div>
                  <div className="h-8 md:h-12 bg-gradient-to-b from-green-500/20 to-green-500/40 rounded-t-sm relative">
                    {day.quiz > 0 && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${day.quiz}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 + 0.4 }}
                        className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-emerald-500 rounded-t-sm"
                      />
                    )}
                  </div>
                </div>
                <div className="text-white/40 text-xs mt-1">
                  {day.ai + day.terms > 0 ? `${day.ai + day.terms}개` : '-'}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 md:gap-8 mt-4 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded"></div>
              <span className="text-white/60">AI 정보</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
              <span className="text-white/60">용어 학습</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded"></div>
              <span className="text-white/60">퀴즈 점수</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex justify-center mb-6 md:mb-8">
        <div className="flex flex-wrap gap-2 md:gap-4 bg-white/10 backdrop-blur-xl rounded-2xl p-2 md:p-3 shadow-lg border border-white/10">
          {[
            { id: 'ai', label: 'AI 정보', gradient: 'from-blue-500 to-purple-500' },
            { id: 'quiz', label: '용어 퀴즈', gradient: 'from-purple-500 to-pink-500' },
            { id: 'progress', label: '진행률', gradient: 'from-pink-500 to-blue-500' },
            { id: 'news', label: 'AI 뉴스', gradient: 'from-blue-500 to-pink-500' },
            { id: 'term', label: '용어 학습', gradient: 'from-purple-500 to-blue-500' }
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

      {/* 날짜 선택 (AI 정보 탭에서만 표시) */}
      {activeTab === 'ai' && (
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="glass backdrop-blur-xl rounded-2xl px-4 md:px-8 py-3 md:py-4 flex items-center gap-4 md:gap-6 shadow-xl border border-white/10">
            <FaCalendar className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            <input 
              type="date" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)} 
              className="p-2 md:p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm md:text-lg font-semibold shadow" 
              style={{ minWidth: 140, maxWidth: 180 }} 
            />
            <span className="px-2 md:px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-xs md:text-sm shadow">
              {selectedDate === new Date().toISOString().split('T')[0] ? '오늘' : selectedDate}
            </span>
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <main className="flex-1 pb-8 md:pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="max-w-4xl mx-auto"
        >
          {/* 탭별 컨텐츠 */}
          {activeTab === 'ai' && (
            <section className="mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6 md:mb-8 flex items-center gap-3 md:gap-4 drop-shadow">
                <FaBrain className="w-6 h-6 md:w-8 md:h-8" />
                오늘의 AI 정보
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {aiInfoFixed.length === 0 && (
                  <div className="glass backdrop-blur-xl rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center text-white/70 shadow-xl min-h-[180px] border border-white/10">
                    <FaBookOpen className="w-10 h-10 md:w-12 md:h-12 mb-3 opacity-60" />
                    <span className="text-base md:text-lg font-semibold">AI 정보가 없습니다</span>
                  </div>
                )}
                {aiInfoFixed.map((info, index) => (
                  <AIInfoCard
                    key={index}
                    info={info}
                    index={index}
                    date={selectedDate}
                    sessionId={sessionId}
                    isLearned={userProgress?.[selectedDate]?.includes(index) || false}
                    onProgressUpdate={handleProgressUpdate}
                  />
                ))}
              </div>
            </section>
          )}
          {activeTab === 'quiz' && (
            <section className="mb-8 md:mb-16">
              <TermsQuizSection 
                sessionId={sessionId} 
                selectedDate={selectedDate} 
                onProgressUpdate={handleProgressUpdate}
              />
            </section>
          )}
          {activeTab === 'progress' && (
            <section className="mb-8 md:mb-16">
              <div className="flex justify-end mb-4">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold shadow backdrop-blur-xl border border-white/10">
                  최고 연속 학습일: {userProgress?.max_streak || 0}일
                </span>
              </div>
              <ProgressSection sessionId={sessionId} />
            </section>
          )}
          {activeTab === 'news' && (
            <section className="mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-6 md:mb-8 flex items-center gap-3 md:gap-4 drop-shadow">
                <FaBookOpen className="w-6 h-6 md:w-8 md:h-8" />
                AI 뉴스
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
                      <span className="text-blue-300 text-sm">뉴스 원문 보기 →</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-white/70 text-center">AI 뉴스가 없습니다.</div>
              )}
            </section>
          )}
          {activeTab === 'term' && (
            <section className="mb-8 md:mb-16">
              <LearnedTermsSection sessionId={sessionId} />
            </section>
          )}
        </motion.div>
      </main>

      {/* 커스텀 애니메이션 스타일 */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        @keyframes fade-in-out {
          0%, 100% { opacity: 0; transform: translateY(10px); }
          20%, 80% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 1.5s cubic-bezier(0.22,1,0.36,1) both;
        }
      `}</style>
    </div>
  )
} 