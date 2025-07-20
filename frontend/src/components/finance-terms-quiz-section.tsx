"use client"

import { useState, useEffect } from 'react'
import { FaDollarSign, FaPlay, FaCheck, FaTimes, FaRedo, FaCalendar } from 'react-icons/fa'
import { financeTermAPI, financeUserProgressAPI } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { financialAIInfoAPI, financialUserProgressAPI } from '@/lib/api'

interface FinanceTerm {
  id: number
  term: string
  definition: string
  difficulty: string
}

interface QuizQuestion {
  id: number
  term: string
  definition: string
  options: string[]
  correctAnswer: number
}

interface TermItem {
  term: string
  description: string
}

interface TermsQuizSectionProps {
  sessionId: string
  selectedDate: string
  onProgressUpdate?: () => void
  onDateChange?: (date: string) => void
}

interface TermsQuiz {
  id: number
  question: string
  options: string[]
  correct: number
  explanation: string
}

export default function FinancialTermsQuizSection({ sessionId, selectedDate, onProgressUpdate, onDateChange }: TermsQuizSectionProps) {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showQuizComplete, setShowQuizComplete] = useState(false)
  const [showAchievement, setShowAchievement] = useState(false)
  const [finalScore, setFinalScore] = useState<{score: number, total: number, percentage: number} | null>(null)

  // 날짜별 금융 정보의 용어만 불러오기
  const { data: aiInfos, isLoading } = useQuery({
    queryKey: ['financial-ai-info', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return []
      const res = await financialAIInfoAPI.getByDate(selectedDate)
      return res.data as { title: string, content: string, terms?: TermItem[] }[]
    },
    enabled: !!selectedDate,
  })

  // 해당 날짜의 모든 용어를 하나의 배열로 합침
  const terms: TermItem[] = (aiInfos || []).flatMap(info => info.terms || [])

  // 퀴즈 문제 생성 (최대 10개, 랜덤)
  const quizData: TermsQuiz[] = useState(() => {
    const shuffled = [...terms].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 10).map((term, idx) => {
      // 오답 옵션 생성
      const otherDefs = shuffled.filter(t => t.term !== term.term).map(t => t.description).sort(() => Math.random() - 0.5).slice(0, 3)
      const options = [term.description, ...otherDefs].sort(() => Math.random() - 0.5)
      return {
        id: idx,
        question: `${term.term}의 뜻은?`,
        options,
        correct: options.indexOf(term.description),
        explanation: term.description
      }
    })
  })[0]

  // currentQuiz를 현재 인덱스에 맞게 단일 TermsQuiz로 지정
  const currentQuiz = Array.isArray(quizData) && quizData.length > 0 ? quizData[currentQuizIndex] : undefined

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuiz) return
    const isCorrect = selectedAnswer === currentQuiz.correct
    if (isCorrect) {
      setScore(score + 1)
    }
    setShowResult(true)
  }

  const handleNextQuiz = async () => {
    if (quizData && currentQuizIndex < quizData.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else if (quizData && currentQuizIndex === quizData.length - 1) {
      // 퀴즈 완료 시 점수 저장 및 성취 체크
      const finalScoreData = {
        score: score,
        total: quizData.length,
        percentage: Math.round((score / quizData.length) * 100)
      }
      setFinalScore(finalScoreData)
      setQuizCompleted(true)
      try {
        // 점수 저장
        await financialUserProgressAPI.updateQuizScore(sessionId, {
          score: finalScoreData.score,
          totalQuestions: finalScoreData.total
        })
        setShowQuizComplete(true)
        setTimeout(() => setShowQuizComplete(false), 4000)
        if (onProgressUpdate) onProgressUpdate()
        // 성취 체크(필요시 별도 API 호출)
        // ... (AI와 동일하게 구현)
      } catch (error) {
        console.error('Failed to save quiz score:', error)
      }
    }
  }

  const handleResetQuiz = () => {
    setCurrentQuizIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setQuizCompleted(false)
    setFinalScore(null)
  }

  const getOptionClass = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index
        ? 'bg-blue-500 border-blue-500 text-white'
        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
    }
    if (index === currentQuiz?.correct) {
      return 'bg-green-500 border-green-500 text-white'
    }
    if (selectedAnswer === index && index !== currentQuiz?.correct) {
      return 'bg-red-500 border-red-500 text-white'
    }
    return 'bg-white/10 border-white/20 text-white/50'
  }

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return "🏆 완벽합니다! 훌륭한 실력이네요!"
    if (percentage >= 80) return "🌟 아주 잘했어요! 거의 다 맞췄네요!"
    if (percentage >= 70) return "👍 좋아요! 꽤 잘 알고 있네요!"
    if (percentage >= 60) return "💪 괜찮아요! 조금만 더 노력하면 됩니다!"
    return "📚 더 공부해보세요! 다음엔 더 잘할 수 있을 거예요!"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (terms.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 text-center border border-white/10">
        <FaDollarSign className="text-green-400 text-4xl mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">퀴즈할 용어가 없습니다</h3>
        <p className="text-white/60">금융 정보를 추가하면 퀴즈를 풀 수 있습니다.</p>
      </div>
    )
  }

  if (!quizCompleted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaDollarSign className="text-green-400" />
            금융 용어 퀴즈
          </h2>
          <div className="flex items-center gap-3">
            <FaCalendar className="text-white/60" />
            <select
              value={selectedDate}
              onChange={(e) => onDateChange?.(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
            >
              <option value="all">전체 기간</option>
              {/* availableDates 로직은 제거되었으므로 임시로 빈 배열 또는 기본값 사용 */}
              <option value="2025-01-20">2025-01-20</option>
              <option value="2025-01-19">2025-01-19</option>
              <option value="2025-01-18">2025-01-18</option>
            </select>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 text-center border border-white/10">
          <FaDollarSign className="text-green-400 text-4xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-4">금융 용어 퀴즈</h3>
          <p className="text-white/60 mb-6">
            학습한 금융 용어들의 정의를 맞춰보세요.<br />
            총 {terms.length}개의 용어 중 10개가 랜덤으로 출제됩니다.
          </p>
          <button
            onClick={handleResetQuiz} // 퀴즈 시작 버튼 클릭 시 퀴즈 재시작
            className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <FaPlay />
            퀴즈 시작
          </button>
        </div>
      </div>
    )
  }

  if (quizCompleted) {
    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 text-center border border-white/10">
          <div className="text-6xl mb-4">
            {finalScore?.percentage >= 80 ? '🎉' : finalScore?.percentage >= 60 ? '👍' : '😅'}
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">퀴즈 완료!</h3>
          <div className="text-4xl font-bold text-green-400 mb-2">
            {finalScore?.score} / {finalScore?.total}
          </div>
          <div className="text-xl text-white/60 mb-6">
            정답률: {finalScore?.percentage}%
          </div>
          <p className="text-white/60 text-lg">{getScoreMessage(finalScore?.percentage || 0)}</p>
          <button
            onClick={handleResetQuiz}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <FaRedo />
            다시 시작
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaDollarSign className="text-green-400" />
          금융 용어 퀴즈
        </h2>
        <div className="text-white/60">
          {currentQuizIndex + 1} / {quizData.length}
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="w-full bg-white/10 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuizIndex + 1) / quizData.length) * 100}%` }}
        />
      </div>

      {/* 점수 */}
      <div className="text-center">
        <span className="text-white/60">현재 점수: </span>
        <span className="text-green-400 font-bold text-xl">{score}</span>
      </div>

      {/* 문제 */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">
          다음 용어의 정의를 선택하세요:
        </h3>
        <div className="text-2xl font-bold text-green-400 mb-8 text-center">
          {currentQuiz?.question}
        </div>

        <div className="space-y-4">
          {currentQuiz?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={showResult}
              className={`w-full p-4 rounded-lg border text-left transition-all ${getOptionClass(index)}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-medium">{String.fromCharCode(65 + index)}.</span>
                <span className="flex-1">{option}</span>
                {showResult && selectedAnswer === index && (
                  index === currentQuiz?.correct ? (
                    <FaCheck className="text-green-400" />
                  ) : (
                    <FaTimes className="text-red-400" />
                  )
                )}
                {showResult && index === currentQuiz?.correct && selectedAnswer !== index && (
                  <FaCheck className="text-green-400" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          {!showResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              답안 제출
            </button>
          ) : (
            <button
              onClick={handleNextQuiz}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentQuizIndex < quizData.length - 1 ? '다음 문제' : '퀴즈 완료'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 