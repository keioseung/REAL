"use client"

import { useState, useEffect } from 'react'

interface Prompt {
  id: string
  title: string
  content: string
}
interface AIInfo {
  id: string
  date: string
  title: string
  content: string
}

export default function AdminPromptPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [aiInfos, setAIInfos] = useState<AIInfo[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)
  const [selectedAIInfoId, setSelectedAIInfoId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem('prompts')
    if (data) setPrompts(JSON.parse(data))
    const aiData = localStorage.getItem('aiInfos')
    if (aiData) setAIInfos(JSON.parse(aiData))
  }, [])

  useEffect(() => {
    localStorage.setItem('prompts', JSON.stringify(prompts))
  }, [prompts])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return
    if (editId) {
      setPrompts(prompts.map(p => p.id === editId ? { ...p, title, content } : p))
      setEditId(null)
    } else {
      setPrompts([
        ...prompts,
        { id: Date.now().toString(), title, content }
      ])
    }
    setTitle('')
    setContent('')
  }

  const handleEdit = (p: Prompt) => {
    setEditId(p.id)
    setTitle(p.title)
    setContent(p.content)
  }

  const handleDelete = (id: string) => {
    setPrompts(prompts.filter(p => p.id !== id))
    if (editId === id) {
      setEditId(null)
      setTitle('')
      setContent('')
    }
  }

  // 프롬프트+기반내용 합치기
  const getCombinedText = () => {
    const prompt = prompts.find(p => p.id === selectedPromptId)
    const aiInfo = aiInfos.find(a => a.id === selectedAIInfoId)
    return [prompt?.content || '', aiInfo ? `\n\n[기반 내용]\n${aiInfo.content}` : ''].join('')
  }

  const handleCopyAndGo = () => {
    const text = getCombinedText()
    navigator.clipboard.writeText(text)
    setCopied(true)
    window.open('https://chat.openai.com/', '_blank')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto mt-16 p-8 bg-white rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-extrabold mb-8 text-pink-700 flex items-center gap-2">🤖 프롬프트 관리</h2>
      <form onSubmit={handleSubmit} className="mb-10 bg-pink-50 rounded-xl p-6 shadow flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <label className="font-semibold text-pink-700">프롬프트 제목</label>
          <input type="text" placeholder="프롬프트 제목" value={title} onChange={e => setTitle(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-pink-300" />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="font-semibold text-pink-700">프롬프트 내용</label>
          <textarea placeholder="프롬프트 내용" value={content} onChange={e => setContent(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-pink-300" rows={2} />
        </div>
        <div className="flex flex-col gap-2">
          <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 transition">{editId ? '수정' : '등록'}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setTitle(''); setContent('') }} className="px-4 py-2 bg-gray-400 text-white rounded-xl font-bold hover:bg-gray-500 transition">취소</button>}
        </div>
      </form>
      <div className="grid gap-6 mb-10">
        {prompts.length === 0 && <div className="text-gray-400 text-center">등록된 프롬프트가 없습니다.</div>}
        {prompts.map(p => (
          <div key={p.id} className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow">
            <div className="flex-1">
              <div className="font-bold text-lg text-pink-900 mb-1">{p.title}</div>
              <div className="text-gray-700 text-sm whitespace-pre-line">{p.content}</div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button onClick={() => handleEdit(p)} className="px-4 py-2 bg-yellow-400 text-white rounded-xl font-bold hover:bg-yellow-500 transition">수정</button>
              <button onClick={() => handleDelete(p.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition">삭제</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mb-8 p-6 bg-gradient-to-r from-pink-200 to-purple-100 rounded-2xl border-2 border-pink-300 shadow flex flex-col gap-3">
        <div className="mb-2 font-semibold text-pink-700 text-lg">ChatGPT에 물어볼 프롬프트와 기반 내용을 선택하세요.</div>
        <select value={selectedPromptId || ''} onChange={e => setSelectedPromptId(e.target.value)} className="w-full p-2 border rounded mb-2">
          <option value="">프롬프트 선택</option>
          {prompts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <select value={selectedAIInfoId || ''} onChange={e => setSelectedAIInfoId(e.target.value)} className="w-full p-2 border rounded mb-2">
          <option value="">기반 내용 선택(선택사항)</option>
          {aiInfos.map(a => <option key={a.id} value={a.id}>{a.title} ({a.date})</option>)}
        </select>
        <button onClick={handleCopyAndGo} disabled={!selectedPromptId} className="w-full px-4 py-2 bg-pink-600 text-white rounded-xl font-bold mt-2 disabled:opacity-50 hover:bg-pink-700 transition">ChatGPT에 물어보기</button>
        {copied && <div className="text-green-600 mt-2">프롬프트+기반내용이 복사되었습니다!</div>}
        <div className="mt-2 p-2 bg-white border rounded text-sm text-gray-700 whitespace-pre-line">
          {getCombinedText() || '선택된 프롬프트와 기반 내용이 여기에 미리보기로 표시됩니다.'}
        </div>
      </div>
    </div>
  )
} 