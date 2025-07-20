"use client"

import { useEffect, useState } from 'react'

export default function AdminFinanceStatsPage() {
  const [financeInfoCount, setFinanceInfoCount] = useState(0)
  const [quizCount, setQuizCount] = useState(0)
  const [promptCount, setPromptCount] = useState(0)
  const [baseContentCount, setBaseContentCount] = useState(0)

  useEffect(() => {
    const financeInfos = JSON.parse(localStorage.getItem('financeInfos') || '[]')
    setFinanceInfoCount(Array.isArray(financeInfos) ? financeInfos.length : 0)
    const quizzes = JSON.parse(localStorage.getItem('financeQuizzes') || '[]')
    setQuizCount(Array.isArray(quizzes) ? quizzes.length : 0)
    const prompts = JSON.parse(localStorage.getItem('financePrompts') || '[]')
    setPromptCount(Array.isArray(prompts) ? prompts.length : 0)
    const baseContents = JSON.parse(localStorage.getItem('financeBaseContents') || '[]')
    setBaseContentCount(Array.isArray(baseContents) ? baseContents.length : 0)
  }, [])

  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-extrabold mb-8 text-emerald-700 flex items-center gap-2">📊 금융 학습 통계</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl p-6 shadow flex flex-col items-center">
          <div className="text-4xl font-bold text-emerald-700 mb-2">{financeInfoCount}</div>
          <div className="text-lg text-emerald-900 font-semibold">금융 정보</div>
        </div>
        <div className="bg-gradient-to-r from-teal-100 to-cyan-100 rounded-2xl p-6 shadow flex flex-col items-center">
          <div className="text-4xl font-bold text-teal-700 mb-2">{quizCount}</div>
          <div className="text-lg text-teal-900 font-semibold">금융 퀴즈</div>
        </div>
        <div className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl p-6 shadow flex flex-col items-center">
          <div className="text-4xl font-bold text-cyan-700 mb-2">{promptCount}</div>
          <div className="text-lg text-cyan-900 font-semibold">금융 프롬프트</div>
        </div>
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-6 shadow flex flex-col items-center">
          <div className="text-4xl font-bold text-blue-700 mb-2">{baseContentCount}</div>
          <div className="text-lg text-blue-900 font-semibold">기반 내용</div>
        </div>
      </div>
    </div>
  )
} 