"use client"

import { useState, useEffect } from 'react'
import { FaDollarSign, FaPlay, FaCheck, FaTimes, FaRedo, FaCalendar } from 'react-icons/fa'
import { financeTermAPI, financeUserProgressAPI } from '@/lib/api'

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

interface TermsQuizSectionProps {
  sessionId: string
}

export default function TermsQuizSection({ sessionId }: TermsQuizSectionProps) {
  const [terms, setTerms] = useState<FinanceTerm[]>([])
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState('all')
  const [availableDates, setAvailableDates] = useState<string[]>([])

  useEffect(() => {
    fetchTerms()
  }, [selectedDate])

  const fetchTerms = async () => {
    try {
      setLoading(true)
      const response = await financeTermAPI.getAll()
      setTerms(response.data)
      
      // 사용 가능한 날짜들 추출 (실제로는 finance_info의 날짜를 사용해야 함)
      const dates = ['2025-01-20', '2025-01-19', '2025-01-18']
      setAvailableDates(dates)
    } catch (err) {
      setError('용어를 불러오는데 실패했습니다.')
      console.error('Error fetching terms:', err)
    } finally {
      setLoading(false)
    }
  }

  const generateQuiz = () => {
    if (terms.length === 0) return

    const shuffledTerms = [...terms].sort(() => Math.random() - 0.5)
    const quizSize = Math.min(10, shuffledTerms.length)
    const selectedTerms = shuffledTerms.slice(0, quizSize)

    const questions: QuizQuestion[] = selectedTerms.map((term, index) => {
      // 다른 용어들의 정의를 옵션으로 사용
      const otherDefinitions = terms
        .filter(t => t.id !== term.id)
        .map(t => t.definition)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)

      const options = [term.definition, ...otherDefinitions]
        .sort(() => Math.random() - 0.5)

      return {
        id: index,
        term: term.term,
        definition: term.definition,
        options,
        correctAnswer: options.indexOf(term.definition)
      }
    })

    setQuizQuestions(questions)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setScore(0)
    setTotalQuestions(quizSize)
    setQuizStarted(true)
    setQuizCompleted(false)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const currentQuestion = quizQuestions[currentQuestionIndex]
    const correct = selectedAnswer === currentQuestion.correctAnswer

    setIsAnswered(true)
    setIsCorrect(correct)

    if (correct) {
      setScore(score + 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setIsAnswered(false)
    } else {
      // 퀴즈 완료
      setQuizCompleted(true)
      // 퀴즈 결과 저장
      saveQuizResult()
    }
  }

  const saveQuizResult = async () => {
    try {
      // 실제 구현에서는 사용자 ID가 필요
      await financeUserProgressAPI.recordQuizResult(1, {
        score: score,
        total_questions: totalQuestions,
        correct_answers: score,
        quiz_date: new Date().toISOString()
      })
    } catch (err) {
      console.error('Error saving quiz result:', err)
    }
  }

  const restartQuiz = () => {
    setQuizStarted(false)
    setQuizCompleted(false)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setIsAnswered(false)
    setScore(0)
    setTotalQuestions(0)
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
        <p className="text-red-400">{error}</p>
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

  if (!quizStarted) {
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
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
            >
              <option value="all">전체 기간</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
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
            onClick={generateQuiz}
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
    const percentage = Math.round((score / totalQuestions) * 100)
    return (
      <div className="space-y-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-8 text-center border border-white/10">
          <div className="text-6xl mb-4">
            {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '😅'}
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">퀴즈 완료!</h3>
          <div className="text-4xl font-bold text-green-400 mb-2">
            {score} / {totalQuestions}
          </div>
          <div className="text-xl text-white/60 mb-6">
            정답률: {percentage}%
          </div>
          <button
            onClick={restartQuiz}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <FaRedo />
            다시 시작
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = quizQuestions[currentQuestionIndex]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaDollarSign className="text-green-400" />
          금융 용어 퀴즈
        </h2>
        <div className="text-white/60">
          {currentQuestionIndex + 1} / {totalQuestions}
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="w-full bg-white/10 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
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
          {currentQuestion.term}
        </div>

        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-lg border text-left transition-all ${
                selectedAnswer === index
                  ? isAnswered
                    ? index === currentQuestion.correctAnswer
                      ? 'bg-green-500/20 border-green-500 text-green-400'
                      : 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-green-500/20 border-green-500 text-green-400'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              } ${isAnswered && index === currentQuestion.correctAnswer ? 'bg-green-500/20 border-green-500 text-green-400' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-medium">{String.fromCharCode(65 + index)}.</span>
                <span className="flex-1">{option}</span>
                {isAnswered && selectedAnswer === index && (
                  index === currentQuestion.correctAnswer ? (
                    <FaCheck className="text-green-400" />
                  ) : (
                    <FaTimes className="text-red-400" />
                  )
                )}
                {isAnswered && index === currentQuestion.correctAnswer && selectedAnswer !== index && (
                  <FaCheck className="text-green-400" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          {!isAnswered ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              답안 제출
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentQuestionIndex < quizQuestions.length - 1 ? '다음 문제' : '퀴즈 완료'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 