"use client"

import { useState, useEffect } from 'react'

interface Quiz {
  id: string
  question: string
  answer: string
  choices: string[]
}

export default function AdminQuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [choices, setChoices] = useState(['', '', ''])
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
      setQuizzes(quizzes.map(q => q.id === editId ? { ...q, question, answer, choices } : q))
      setEditId(null)
    } else {
      setQuizzes([
        ...quizzes,
        { id: Date.now().toString(), question, answer, choices }
      ])
    }
    setQuestion('')
    setAnswer('')
    setChoices(['', '', ''])
  }

  const handleEdit = (q: Quiz) => {
    setEditId(q.id)
    setQuestion(q.question)
    setAnswer(q.answer)
    setChoices([...q.choices])
  }

  const handleDelete = (id: string) => {
    setQuizzes(quizzes.filter(q => q.id !== id))
    if (editId === id) {
      setEditId(null)
      setQuestion('')
      setAnswer('')
      setChoices(['', '', ''])
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-16 p-8 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">🎯 퀴즈 관리</h2>
      <form onSubmit={handleSubmit} className="mb-8 space-y-3">
        <input type="text" placeholder="문제" value={question} onChange={e => setQuestion(e.target.value)} className="w-full p-2 border rounded" />
        <input type="text" placeholder="정답" value={answer} onChange={e => setAnswer(e.target.value)} className="w-full p-2 border rounded" />
        {choices.map((c, i) => (
          <input key={i} type="text" placeholder={`오답${i+1}`} value={c} onChange={e => setChoices(choices.map((cc, idx) => idx === i ? e.target.value : cc))} className="w-full p-2 border rounded" />
        ))}
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">{editId ? '수정' : '등록'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setQuestion(''); setAnswer(''); setChoices(['', '', '']) }} className="ml-2 px-4 py-2 bg-gray-400 text-white rounded">취소</button>}
      </form>
      <div>
        {quizzes.length === 0 && <div className="text-gray-400">등록된 퀴즈가 없습니다.</div>}
        {quizzes.map(q => (
          <div key={q.id} className="border-b py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <div className="font-semibold">{q.question}</div>
              <div className="text-green-700 text-sm">정답: {q.answer}</div>
              <div className="text-gray-700 text-sm">오답: {q.choices.join(', ')}</div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button onClick={() => handleEdit(q)} className="px-3 py-1 bg-yellow-400 text-white rounded">수정</button>
              <button onClick={() => handleDelete(q.id)} className="px-3 py-1 bg-red-500 text-white rounded">삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 