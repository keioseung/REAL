"use client"

import { useState, useEffect } from 'react'

interface Quiz {
  id: string
  question: string
  answer: string
  choices: string[]
  explanation: string
}

export default function AdminQuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [choices, setChoices] = useState(['', '', ''])
  const [explanation, setExplanation] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    const data = localStorage.getItem('quizzes')
    if (data) setQuizzes(JSON.parse(data))
  }, [])

  useEffect(() => {
    localStorage.setItem('quizzes', JSON.stringify(quizzes))
  }, [quizzes])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!question || !answer || choices.some(c => !c)) return
    if (editId) {
      setQuizzes(quizzes.map(q => q.id === editId ? { ...q, question, answer, choices, explanation } : q))
      setEditId(null)
    } else {
      setQuizzes([
        ...quizzes,
        { id: Date.now().toString(), question, answer, choices, explanation }
      ])
    }
    setQuestion('')
    setAnswer('')
    setChoices(['', '', ''])
    setExplanation('')
  }

  const handleEdit = (q: Quiz) => {
    setEditId(q.id)
    setQuestion(q.question)
    setAnswer(q.answer)
    setChoices([...q.choices])
    setExplanation(q.explanation || '')
  }

  const handleDelete = (id: string) => {
    setQuizzes(quizzes.filter(q => q.id !== id))
    if (editId === id) {
      setEditId(null)
      setQuestion('')
      setAnswer('')
      setChoices(['', '', ''])
      setExplanation('')
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-16 p-8 bg-white rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-extrabold mb-8 text-purple-700 flex items-center gap-2">🎯 퀴즈 관리</h2>
      <form onSubmit={handleSubmit} className="mb-10 bg-purple-50 rounded-xl p-6 shadow flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <label className="font-semibold text-purple-700">문제</label>
          <input type="text" placeholder="문제" value={question} onChange={e => setQuestion(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-purple-300" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="font-semibold text-purple-700">정답</label>
          <input type="text" placeholder="정답" value={answer} onChange={e => setAnswer(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-purple-300" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="font-semibold text-purple-700">오답</label>
          {choices.map((c, i) => (
            <input key={i} type="text" placeholder={`오답${i+1}`} value={c} onChange={e => setChoices(choices.map((cc, idx) => idx === i ? e.target.value : cc))} className="p-2 border rounded focus:ring-2 focus:ring-purple-300 mb-1" />
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="font-semibold text-purple-700">해설</label>
          <textarea placeholder="해설" value={explanation} onChange={e => setExplanation(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-purple-300" rows={2} />
        </div>
        <div className="flex flex-col gap-2">
          <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition">{editId ? '수정' : '등록'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setQuestion(''); setAnswer(''); setChoices(['', '', '']); setExplanation('') }} className="px-4 py-2 bg-gray-400 text-white rounded-xl font-bold hover:bg-gray-500 transition">취소</button>}
        </div>
      </form>
      <div className="grid gap-6">
        {quizzes.length === 0 && <div className="text-gray-400 text-center">등록된 퀴즈가 없습니다.</div>}
        {quizzes.map(q => (
          <div key={q.id} className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow">
            <div className="flex-1">
              <div className="font-bold text-lg text-purple-900 mb-1">{q.question}</div>
              <div className="text-green-700 text-sm mb-1">정답: {q.answer}</div>
              <div className="text-gray-700 text-sm mb-1">오답: {q.choices.join(', ')}</div>
              {q.explanation && <div className="text-purple-700 text-sm bg-purple-50 rounded p-2 mt-2">해설: {q.explanation}</div>}
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button onClick={() => handleEdit(q)} className="px-4 py-2 bg-yellow-400 text-white rounded-xl font-bold hover:bg-yellow-500 transition">수정</button>
              <button onClick={() => handleDelete(q.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition">삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 