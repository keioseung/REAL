"use client"

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeInfoAPI } from '@/lib/api'

interface Prompt {
  id: string
  title: string
  content: string
}
interface FinanceInfo {
  id: string
  date: string
  title: string
  content: string
}

export default function AdminFinancePromptPage() {
  // 금융 정보 관리 상태
  const queryClient = useQueryClient()
  const [date, setDate] = useState('')
  const [inputs, setInputs] = useState([{ title: '', content: '' }])
  const [editId, setEditId] = useState<boolean>(false)
  const [aiError, setAIError] = useState('')
  const [aiSuccess, setAISuccess] = useState('')

  // 프롬프트 관리
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [promptTitle, setPromptTitle] = useState('')
  const [promptContent, setPromptContent] = useState('')
  const [promptEditId, setPromptEditId] = useState<string | null>(null)

  // 기반 내용 관리
  const [baseContents, setBaseContents] = useState<FinanceInfo[]>([])
  const [baseTitle, setBaseTitle] = useState('')
  const [baseContent, setBaseContent] = useState('')
  const [baseEditId, setBaseEditId] = useState<string | null>(null)

  // 프롬프트+기반내용 합치기
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)
  const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const pData = localStorage.getItem('financePrompts')
    if (pData) setPrompts(JSON.parse(pData))
    const bData = localStorage.getItem('financeBaseContents')
    if (bData) setBaseContents(JSON.parse(bData))
  }, [])

  useEffect(() => {
    localStorage.setItem('financePrompts', JSON.stringify(prompts))
  }, [prompts])
  useEffect(() => {
    localStorage.setItem('financeBaseContents', JSON.stringify(baseContents))
  }, [baseContents])

  // 금융 정보 관리 쿼리
  const { data: dates = [], refetch: refetchDates } = useQuery({
    queryKey: ['finance-info-dates'],
    queryFn: async () => {
      const res = await financeInfoAPI.getAllDates()
      return res.data as string[]
    }
  })
  const { data: financeInfos = [], refetch: refetchFinanceInfo, isFetching } = useQuery({
    queryKey: ['finance-info', date],
    queryFn: async () => {
      if (!date) return []
      const res = await financeInfoAPI.getByDate(date)
      return res.data as { title: string, content: string }[]
    },
    enabled: !!date,
  })
  
  // 금융 정보 등록/수정/삭제 핸들러 (기존과 동일)
  const handleBaseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!baseTitle || !baseContent) return
    if (baseEditId) {
      setBaseContents(baseContents.map(b => b.id === baseEditId ? { ...b, title: baseTitle, content: baseContent, date: new Date().toISOString().slice(0,10) } : b))
      setBaseEditId(null)
    } else {
      setBaseContents([
        ...baseContents,
        { id: Date.now().toString(), title: baseTitle, content: baseContent, date: new Date().toISOString().slice(0,10) }
      ])
    }
    setBaseTitle('')
    setBaseContent('')
  }
  const handleBaseEdit = (b: FinanceInfo) => {
    setBaseEditId(b.id)
    setBaseTitle(b.title)
    setBaseContent(b.content)
  }
  const handleBaseDelete = (id: string) => {
    setBaseContents(baseContents.filter(b => b.id !== id))
    if (baseEditId === id) {
      setBaseEditId(null)
      setBaseTitle('')
      setBaseContent('')
    }
  }

  // 프롬프트 관리 핸들러
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptTitle || !promptContent) return
    if (promptEditId) {
      setPrompts(prompts.map(p => p.id === promptEditId ? { ...p, title: promptTitle, content: promptContent } : p))
      setPromptEditId(null)
    } else {
      setPrompts([
        ...prompts,
        { id: Date.now().toString(), title: promptTitle, content: promptContent }
      ])
    }
    setPromptTitle('')
    setPromptContent('')
  }
  const handlePromptEdit = (p: Prompt) => {
    setPromptEditId(p.id)
    setPromptTitle(p.title)
    setPromptContent(p.content)
  }
  const handlePromptDelete = (id: string) => {
    setPrompts(prompts.filter(p => p.id !== id))
    if (promptEditId === id) {
      setPromptEditId(null)
      setPromptTitle('')
      setPromptContent('')
    }
  }

  // 프롬프트+기반내용 합치기
  const getCombinedText = () => {
    const prompt = prompts.find(p => p.id === selectedPromptId)
    const base = baseContents.find(b => b.id === selectedBaseId)
    return [prompt?.content || '', base ? `\n\n[기반 내용]\n${base.content}` : ''].join('')
  }
  const handleCopyAndGo = () => {
    const text = getCombinedText()
    navigator.clipboard.writeText(text)
    setCopied(true)
    window.open('https://chat.openai.com/', '_blank')
    setTimeout(() => setCopied(false), 2000)
  }

  // 프롬프트+기반내용 합치기 영역 선택 기능 추가
  const combinedRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'a') {
        if (document.activeElement === combinedRef.current) {
          e.preventDefault()
          const range = document.createRange()
          range.selectNodeContents(combinedRef.current!)
          const sel = window.getSelection()
          sel?.removeAllRanges()
          sel?.addRange(range)
        }
      }
    }
    const node = combinedRef.current
    if (node) node.addEventListener('keydown', handleKeyDown)
    return () => { if (node) node.removeEventListener('keydown', handleKeyDown) }
  }, [])

  return (
    <div className="max-w-4xl mx-auto mt-16 p-8 bg-white rounded-3xl shadow-2xl flex flex-col gap-12">
      {/* 프롬프트 관리 */}
      <section>
        <h2 className="text-3xl font-extrabold mb-8 text-teal-700 flex items-center gap-2">💬 금융 프롬프트 관리</h2>
        <form onSubmit={handlePromptSubmit} className="mb-8 bg-teal-50 rounded-xl p-6 shadow flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-semibold text-teal-700">프롬프트 제목</label>
            <input type="text" placeholder="프롬프트 제목" value={promptTitle} onChange={e => setPromptTitle(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-teal-300" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-semibold text-teal-700">프롬프트 내용</label>
            <textarea placeholder="프롬프트 내용" value={promptContent} onChange={e => setPromptContent(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-teal-300" rows={2} />
          </div>
          <div className="flex flex-col gap-2">
            <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition">{promptEditId ? '수정' : '등록'}</button>
            {promptEditId && <button type="button" onClick={() => { setPromptEditId(null); setPromptTitle(''); setPromptContent('') }} className="px-4 py-2 bg-gray-400 text-white rounded-xl font-bold hover:bg-gray-500 transition">취소</button>}
          </div>
        </form>
        <div className="grid gap-6 mb-10">
          {prompts.length === 0 && <div className="text-gray-400 text-center">등록된 프롬프트가 없습니다.</div>}
          {prompts.map(p => (
            <div key={p.id} className="bg-gradient-to-r from-teal-100 to-cyan-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow">
              <div className="flex-1">
                <div className="font-bold text-lg text-teal-900 mb-1">{p.title}</div>
                <div className="text-gray-700 text-sm whitespace-pre-line">{p.content}</div>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button onClick={() => handlePromptEdit(p)} className="px-4 py-2 bg-yellow-400 text-white rounded-xl font-bold hover:bg-yellow-500 transition">수정</button>
                <button onClick={() => handlePromptDelete(p.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition">삭제</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 기반 내용 관리 */}
      <section>
        <h2 className="text-3xl font-extrabold mb-8 text-cyan-700 flex items-center gap-2">📚 기반 내용 관리</h2>
        <form onSubmit={handleBaseSubmit} className="mb-8 bg-cyan-50 rounded-xl p-6 shadow flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-semibold text-cyan-700">기반 내용 제목</label>
            <input type="text" placeholder="기반 내용 제목" value={baseTitle} onChange={e => setBaseTitle(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-cyan-300" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-semibold text-cyan-700">기반 내용</label>
            <textarea placeholder="기반 내용" value={baseContent} onChange={e => setBaseContent(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-cyan-300" rows={2} />
          </div>
          <div className="flex flex-col gap-2">
            <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition">{baseEditId ? '수정' : '등록'}</button>
            {baseEditId && <button type="button" onClick={() => { setBaseEditId(null); setBaseTitle(''); setBaseContent('') }} className="px-4 py-2 bg-gray-400 text-white rounded-xl font-bold hover:bg-gray-500 transition">취소</button>}
          </div>
        </form>
        <div className="grid gap-6 mb-10">
          {baseContents.length === 0 && <div className="text-gray-400 text-center">등록된 기반 내용이 없습니다.</div>}
          {baseContents.map(b => (
            <div key={b.id} className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow">
              <div className="flex-1">
                <div className="font-bold text-lg text-cyan-900 mb-1">{b.title}</div>
                <div className="text-gray-700 text-sm whitespace-pre-line">{b.content}</div>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button onClick={() => handleBaseEdit(b)} className="px-4 py-2 bg-yellow-400 text-white rounded-xl font-bold hover:bg-yellow-500 transition">수정</button>
                <button onClick={() => handleBaseDelete(b.id)} className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition">삭제</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 프롬프트+기반내용 합치기 */}
      <section>
        <h2 className="text-3xl font-extrabold mb-8 text-blue-700 flex items-center gap-2">🔗 프롬프트 + 기반내용 합치기</h2>
        <div className="bg-blue-50 rounded-xl p-6 shadow mb-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-semibold text-blue-700 mb-2 block">프롬프트 선택</label>
              <select value={selectedPromptId || ''} onChange={e => setSelectedPromptId(e.target.value || null)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300">
                <option value="">프롬프트를 선택하세요</option>
                {prompts.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-semibold text-blue-700 mb-2 block">기반 내용 선택</label>
              <select value={selectedBaseId || ''} onChange={e => setSelectedBaseId(e.target.value || null)} className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-300">
                <option value="">기반 내용을 선택하세요</option>
                {baseContents.map(b => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200 mb-4">
            <div 
              ref={combinedRef}
              className="whitespace-pre-line text-sm text-gray-700 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-300 rounded p-2"
              contentEditable
              suppressContentEditableWarning
            >
              {getCombinedText() || '프롬프트와 기반 내용을 선택하면 여기에 합쳐진 내용이 표시됩니다.'}
            </div>
          </div>
          <button 
            onClick={handleCopyAndGo}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition"
          >
            {copied ? '복사됨!' : '복사하고 ChatGPT로 이동'}
          </button>
        </div>
      </section>
    </div>
  )
} 