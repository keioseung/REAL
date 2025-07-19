'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, CheckCircle, XCircle, RotateCcw, BookOpen, Target } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { aiInfoAPI } from '@/lib/api'

interface TermsQuizSectionProps {
  sessionId: string
  selectedDate: string
}

interface TermsQuiz {
  id: number
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct: number
  explanation: string
}

interface TermsQuizResponse {
  quizzes: TermsQuiz[]
  total_terms: number
  message?: string
}

function TermsQuizSection({ sessionId, selectedDate }: TermsQuizSectionProps) {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)

  const { data: quizData, isLoading, refetch } = useQuery<TermsQuizResponse>({
    queryKey: ['terms-quiz', selectedDate],
    queryFn: async () => {
      const response = await aiInfoAPI.getTermsQuizByDate(selectedDate)
      return response.data
    },
    enabled: !!selectedDate,
  })

  const currentQuiz = quizData?.quizzes?.[currentQuizIndex]

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

  const handleNextQuiz = () => {
    if (quizData?.quizzes && currentQuizIndex < quizData.quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const handleResetQuiz = () => {
    setCurrentQuizIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    refetch()
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

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-8 flex items-center justify-center">
        <div className="text-white text-lg">퀴즈를 생성하고 있습니다...</div>
      </div>
    )
  }

  if (!quizData?.quizzes || quizData.quizzes.length === 0) {
    return (
      <div className="glass rounded-2xl p-8">
        <div className="text-center text-white">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-60" />
          <h3 className="text-xl font-semibold mb-2">등록된 용어가 없습니다</h3>
          <p className="text-white/70 mb-4">
            {quizData?.message || `${selectedDate} 날짜에 등록된 용어가 없습니다. 관리자가 용어를 등록한 후 퀴즈를 풀어보세요!`}
          </p>
          <div className="text-sm text-white/50">
            선택한 날짜: {selectedDate}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Target className="w-8 h-8" />
          {selectedDate} 용어 퀴즈
        </h2>
        <div className="text-white/70 text-sm">
          총 {quizData.total_terms}개 용어 중 {quizData.quizzes.length}개 출제
        </div>
      </div>

      <div className="glass rounded-2xl p-8">
        {/* 퀴즈 진행상황 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/70">
              {currentQuizIndex + 1} / {quizData.quizzes.length}
            </span>
            <span className="text-white font-semibold">
              점수: {score} / {currentQuizIndex + (showResult ? 1 : 0)}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuizIndex + 1) / quizData.quizzes.length) * 100}%` }}
            />
          </div>
        </div>

        {/* 퀴즈 내용 */}
        {currentQuiz && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {currentQuiz.question}
              </h3>
            </div>

            <div className="space-y-3">
              {[currentQuiz.option1, currentQuiz.option2, currentQuiz.option3, currentQuiz.option4].map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${getOptionClass(index)}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                    <span>{option}</span>
                    {showResult && index === currentQuiz.correct && (
                      <CheckCircle className="w-5 h-5 ml-auto" />
                    )}
                    {showResult && selectedAnswer === index && index !== currentQuiz.correct && (
                      <XCircle className="w-5 h-5 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* 결과 표시 */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-white/10 border border-white/20"
              >
                <h4 className="text-lg font-semibold text-white mb-2">
                  {selectedAnswer === currentQuiz.correct ? '정답입니다! 🎉' : '틀렸습니다 😅'}
                </h4>
                <p className="text-white/80">{currentQuiz.explanation}</p>
              </motion.div>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-4">
              {!showResult ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  답안 제출
                </button>
              ) : (
                <>
                  {currentQuizIndex < quizData.quizzes.length - 1 ? (
                    <button
                      onClick={handleNextQuiz}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600"
                    >
                      다음 문제
                    </button>
                  ) : (
                    <div className="flex-1 text-center">
                      <h3 className="text-xl font-bold text-white mb-2">퀴즈 완료!</h3>
                      <p className="text-white/70">
                        최종 점수: {score} / {quizData.quizzes.length}
                      </p>
                      <p className="text-white/50 text-sm mt-1">
                        정답률: {Math.round((score / quizData.quizzes.length) * 100)}%
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleResetQuiz}
                    className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    다시 시작
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default TermsQuizSection 