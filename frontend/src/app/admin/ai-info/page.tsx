"use client"

import { useState, useEffect } from 'react'

interface AIInfo {
  id: string
  date: string
  title: string
  content: string
}

export default function AdminAIInfoPage() {
  const [aiInfos, setAIInfos] = useState<AIInfo[]>([])
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    const data = localStorage.getItem('aiInfos')
    if (data) setAIInfos(JSON.parse(data))
  }, [])

  useEffect(() => {
    localStorage.setItem('aiInfos', JSON.stringify(aiInfos))
  }, [aiInfos])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !title || !content) return
    if (editId) {
      setAIInfos(aiInfos.map(info => info.id === editId ? { ...info, date, title, content } : info))
      setEditId(null)
    } else {
      setAIInfos([
        ...aiInfos,
        { id: Date.now().toString(), date, title, content }
      ])
    }
    setDate('')
    setTitle('')
    setContent('')
  }

  const handleEdit = (info: AIInfo) => {
    setEditId(info.id)
    setDate(info.date)
    setTitle(info.title)
    setContent(info.content)
  }

  const handleDelete = (id: string) => {
    setAIInfos(aiInfos.filter(info => info.id !== id))
    if (editId === id) {
      setEditId(null)
      setDate('')
      setTitle('')
      setContent('')
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-16 p-8 bg-white rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-extrabold mb-8 text-blue-700 flex items-center gap-2">📝 AI 정보 관리</h2>
      <form onSubmit={handleSubmit} className="mb-10 bg-blue-50 rounded-xl p-6 shadow flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <label className="font-semibold text-blue-700">날짜</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-300" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="font-semibold text-blue-700">제목</label>
          <input type="text" placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-300" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="font-semibold text-blue-700">내용</label>
          <textarea placeholder="내용" value={content} onChange={e => setContent(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-300" rows={2} />
        </div>
        <div className="flex flex-col gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">{editId ? '수정' : '등록'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setDate(''); setTitle(''); setContent('') }} className="px-4 py-2 bg-gray-400 text-white rounded-xl font-bold hover:bg-gray-500 transition">취소</button>}
        </div>
      </form>
      <div className="grid gap-6">
        {aiInfos.length === 0 && <div className="text-gray-400 text-center">등록된 AI 정보가 없습니다.</div>}
        {aiInfos.map(info => (
          <div key={info.id} className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow">
            <div className="flex-1">
              <div className="text-xs text-blue-500 mb-1">{info.date}</div>
              <div className="font-bold text-lg text-blue-900 mb-1">{info.title}</div>
              <div className="text-gray-700 text-sm whitespace-pre-line">{info.content}</div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button onClick={() => handleEdit(info)} className="px-4 py-2 bg-yellow-400 text-white rounded-xl font-bold hover:bg-yellow-500 transition">수정</button>
              <button onClick={() => handleDelete(info.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition">삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 