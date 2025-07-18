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
    <div className="max-w-3xl mx-auto mt-16 p-8 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">📝 AI 정보 관리</h2>
      <form onSubmit={handleSubmit} className="mb-8 space-y-3">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded" />
        <input type="text" placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" />
        <textarea placeholder="내용" value={content} onChange={e => setContent(e.target.value)} className="w-full p-2 border rounded" rows={3} />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">{editId ? '수정' : '등록'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setDate(''); setTitle(''); setContent('') }} className="ml-2 px-4 py-2 bg-gray-400 text-white rounded">취소</button>}
      </form>
      <div>
        {aiInfos.length === 0 && <div className="text-gray-400">등록된 AI 정보가 없습니다.</div>}
        {aiInfos.map(info => (
          <div key={info.id} className="border-b py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <div className="text-sm text-gray-500">{info.date}</div>
              <div className="font-semibold">{info.title}</div>
              <div className="text-gray-700 text-sm whitespace-pre-line">{info.content}</div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button onClick={() => handleEdit(info)} className="px-3 py-1 bg-yellow-400 text-white rounded">수정</button>
              <button onClick={() => handleDelete(info.id)} className="px-3 py-1 bg-red-500 text-white rounded">삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 