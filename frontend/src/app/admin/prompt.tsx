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
    <div className="max-w-3xl mx-auto mt-16 p-8 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">🤖 프롬프트 관리</h2>
      <form onSubmit={handleSubmit} className="mb-8 space-y-3">
        <input type="text" placeholder="프롬프트 제목" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded" />
        <textarea placeholder="프롬프트 내용" value={content} onChange={e => setContent(e.target.value)} className="w-full p-2 border rounded" rows={3} />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">{editId ? '수정' : '등록'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setTitle(''); setContent('') }} className="ml-2 px-4 py-2 bg-gray-400 text-white rounded">취소</button>}
      </form>
      <div className="mb-8">
        {prompts.length === 0 && <div className="text-gray-400">등록된 프롬프트가 없습니다.</div>}
        {prompts.map(p => (
          <div key={p.id} className="border-b py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <div className="font-semibold">{p.title}</div>
              <div className="text-gray-700 text-sm whitespace-pre-line">{p.content}</div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button onClick={() => handleEdit(p)} className="px-3 py-1 bg-yellow-400 text-white rounded">수정</button>
              <button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-500 text-white rounded">삭제</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mb-8 p-4 bg-gray-50 rounded">
        <div className="mb-2 font-semibold">ChatGPT에 물어볼 프롬프트와 기반 내용을 선택하세요.</div>
        <select value={selectedPromptId || ''} onChange={e => setSelectedPromptId(e.target.value)} className="w-full p-2 border rounded mb-2">
          <option value="">프롬프트 선택</option>
          {prompts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
        <select value={selectedAIInfoId || ''} onChange={e => setSelectedAIInfoId(e.target.value)} className="w-full p-2 border rounded mb-2">
          <option value="">기반 내용 선택(선택사항)</option>
          {aiInfos.map(a => <option key={a.id} value={a.id}>{a.title} ({a.date})</option>)}
        </select>
        <button onClick={handleCopyAndGo} disabled={!selectedPromptId} className="w-full px-4 py-2 bg-green-600 text-white rounded mt-2 disabled:opacity-50">ChatGPT에 물어보기</button>
        {copied && <div className="text-green-600 mt-2">프롬프트+기반내용이 복사되었습니다!</div>}
        <div className="mt-2 p-2 bg-white border rounded text-sm text-gray-700 whitespace-pre-line">
          {getCombinedText() || '선택된 프롬프트와 기반 내용이 여기에 미리보기로 표시됩니다.'}
        </div>
      </div>
    </div>
  )
} 