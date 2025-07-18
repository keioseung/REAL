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
  const [inputs, setInputs] = useState([{ title: '', content: '' }])
  const [editId, setEditId] = useState<string | null>(null)

  useEffect(() => {
    const data = localStorage.getItem('aiInfos')
    if (data) setAIInfos(JSON.parse(data))
  }, [])

  useEffect(() => {
    localStorage.setItem('aiInfos', JSON.stringify(aiInfos))
  }, [aiInfos])

  const handleInputChange = (idx: number, field: 'title' | 'content', value: string) => {
    setInputs(inputs => inputs.map((input, i) => i === idx ? { ...input, [field]: value } : input))
  }

  const handleAddInput = () => {
    setInputs([...inputs, { title: '', content: '' }])
  }

  const handleRemoveInput = (idx: number) => {
    setInputs(inputs => inputs.length === 1 ? inputs : inputs.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || inputs.some(input => !input.title || !input.content)) return
    if (editId) {
      // 단일 수정 모드(기존 방식 유지)
      setAIInfos(aiInfos.map(info => info.id === editId ? { ...info, date, title: inputs[0].title, content: inputs[0].content } : info))
      setEditId(null)
    } else {
      setAIInfos([
        ...aiInfos,
        ...inputs.map(input => ({ id: Date.now().toString() + Math.random(), date, ...input }))
      ])
    }
    setDate('')
    setInputs([{ title: '', content: '' }])
  }

  const handleEdit = (info: AIInfo) => {
    setEditId(info.id)
    setDate(info.date)
    setInputs([{ title: info.title, content: info.content }])
  }

  const handleDelete = (id: string) => {
    setAIInfos(aiInfos.filter(info => info.id !== id))
    if (editId === id) {
      setEditId(null)
      setDate('')
      setInputs([{ title: '', content: '' }])
    }
  }

  return (
    <div className="max-w-3xl mx-auto mt-16 p-8 bg-white rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-extrabold mb-8 text-blue-700 flex items-center gap-2">📝 AI 정보 관리</h2>
      <form onSubmit={handleSubmit} className="mb-10 bg-blue-50 rounded-xl p-6 shadow flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-semibold text-blue-700">날짜</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-300" />
          </div>
        </div>
        {inputs.map((input, idx) => (
          <div key={idx} className="flex flex-col md:flex-row gap-2 items-end bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex-1 flex flex-col gap-2">
              <label className="font-semibold text-blue-700">제목</label>
              <input type="text" placeholder={`제목 ${idx+1}`} value={input.title} onChange={e => handleInputChange(idx, 'title', e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-300" />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="font-semibold text-blue-700">내용</label>
              <textarea placeholder={`내용 ${idx+1}`} value={input.content} onChange={e => handleInputChange(idx, 'content', e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-300" rows={2} />
            </div>
            <button type="button" onClick={() => handleRemoveInput(idx)} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition mt-6">-</button>
          </div>
        ))}
        <button type="button" onClick={handleAddInput} className="px-4 py-2 bg-blue-200 text-blue-700 rounded-xl font-bold hover:bg-blue-300 transition w-fit">정보 추가</button>
        <div className="flex flex-col gap-2 md:flex-row md:items-end">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition w-full md:w-40">{editId ? '수정' : '등록'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setDate(''); setInputs([{ title: '', content: '' }]) }} className="px-4 py-2 bg-gray-400 text-white rounded-xl font-bold hover:bg-gray-500 transition w-full md:w-40">취소</button>}
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