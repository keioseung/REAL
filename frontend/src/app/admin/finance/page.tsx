"use client"

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeInfoAPI } from '@/lib/api'

interface TermItem {
  term: string
  description: string
}

interface FinanceInfoItem {
  title: string
  content: string
  terms?: TermItem[]
}

interface Prompt {
  id: string
  title: string
  content: string
}

interface BaseContent {
  id: string
  date: string
  title: string
  content: string
}

export default function AdminFinancePage() {
  const queryClient = useQueryClient()
  const [date, setDate] = useState('')
  const [inputs, setInputs] = useState([{ title: '', content: '', terms: [] as TermItem[] }])
  const [editId, setEditId] = useState<boolean>(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 프롬프트 관리 상태
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [promptTitle, setPromptTitle] = useState('')
  const [promptContent, setPromptContent] = useState('')
  const [promptEditId, setPromptEditId] = useState<string | null>(null)

  // 기반 내용 관리 상태
  const [baseContents, setBaseContents] = useState<BaseContent[]>([])
  const [baseTitle, setBaseTitle] = useState('')
  const [baseContent, setBaseContent] = useState('')
  const [baseEditId, setBaseEditId] = useState<string | null>(null)

  // 프롬프트+기반내용 합치기 상태
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)
  const [selectedBaseId, setSelectedBaseId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // 프롬프트 데이터 로드
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

  // 서버에서 날짜별 금융 정보 목록 불러오기
  const { data: dates = [], refetch: refetchDates } = useQuery({
    queryKey: ['finance-info-dates'],
    queryFn: async () => {
      const res = await financeInfoAPI.getAllDates()
      return res.data as string[]
    }
  })

  // 선택한 날짜의 금융 정보 불러오기
  const { data: financeInfos = [], refetch: refetchFinanceInfo, isFetching } = useQuery({
    queryKey: ['finance-info', date],
    queryFn: async () => {
      if (!date) return []
      const res = await financeInfoAPI.getByDate(date)
      return res.data as FinanceInfoItem[]
    },
    enabled: !!date,
  })

  // 등록/수정
  const addOrUpdateMutation = useMutation({
    mutationFn: async () => {
      return financeInfoAPI.add({ date, infos: inputs })
    },
    onMutate: () => {
      setError('')
      setSuccess('')
    },
    onSuccess: () => {
      refetchFinanceInfo()
      refetchDates()
      setInputs([{ title: '', content: '', terms: [] }])
      setDate('')
      setEditId(false)
      setSuccess('등록이 완료되었습니다!')
    },
    onError: () => {
      setError('등록에 실패했습니다. 다시 시도해주세요.')
    }
  })

  // 삭제
  const deleteMutation = useMutation({
    mutationFn: async (date: string) => {
      return financeInfoAPI.delete(date)
    },
    onSuccess: () => {
      refetchFinanceInfo()
      refetchDates()
      setInputs([{ title: '', content: '', terms: [] }])
      setDate('')
      setEditId(false)
      setSuccess('삭제가 완료되었습니다!')
    },
    onError: () => {
      setError('삭제에 실패했습니다. 다시 시도해주세요.')
    }
  })

  const handleInputChange = (idx: number, field: 'title' | 'content', value: string) => {
    setInputs(inputs => inputs.map((input, i) => i === idx ? { ...input, [field]: value } : input))
  }

  const handleAddInput = () => {
    if (inputs.length < 3) {
      setInputs([...inputs, { title: '', content: '', terms: [] }])
    }
  }

  const handleRemoveInput = (idx: number) => {
    setInputs(inputs => inputs.length === 1 ? inputs : inputs.filter((_, i) => i !== idx))
  }

  // 용어 관리 핸들러
  const handleAddTerm = (infoIdx: number) => {
    setInputs(inputs => inputs.map((input, i) => 
      i === infoIdx 
        ? { ...input, terms: [...input.terms, { term: '', description: '' }] }
        : input
    ))
  }

  // 전문용어 일괄 입력 파싱 함수
  const parseTermsFromText = (text: string): TermItem[] => {
    const lines = text.trim().split('\n')
    const terms: TermItem[] = []
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue
      
      // 탭으로 구분된 경우
      if (trimmedLine.includes('\t')) {
        const [term, description] = trimmedLine.split('\t').map(s => s.trim())
        if (term && description) {
          terms.push({ term, description })
        }
      }
      // 공백으로 구분된 경우 (탭이 없는 경우)
      else {
        const parts = trimmedLine.split(/\s{2,}/) // 2개 이상의 공백으로 구분
        if (parts.length >= 2) {
          const term = parts[0].trim()
          const description = parts.slice(1).join(' ').trim()
          if (term && description) {
            terms.push({ term, description })
          }
        }
      }
    }
    
    return terms
  }

  // 전문용어 일괄 입력 상태
  const [bulkTermsText, setBulkTermsText] = useState('')
  const [showBulkInput, setShowBulkInput] = useState<number | null>(null)

  // 전문용어 일괄 입력 핸들러
  const handleBulkTermsInput = (infoIdx: number) => {
    setShowBulkInput(infoIdx)
    setBulkTermsText('')
  }

  const handleBulkTermsSubmit = (infoIdx: number) => {
    if (bulkTermsText.trim()) {
      const parsedTerms = parseTermsFromText(bulkTermsText)
      if (parsedTerms.length > 0) {
        setInputs(inputs => inputs.map((input, i) => 
          i === infoIdx 
            ? { ...input, terms: [...input.terms, ...parsedTerms] }
            : input
        ))
        setBulkTermsText('')
        setShowBulkInput(null)
      }
    }
  }

  const handleBulkTermsCancel = () => {
    setShowBulkInput(null)
    setBulkTermsText('')
  }

  const handleRemoveTerm = (infoIdx: number, termIdx: number) => {
    setInputs(inputs => inputs.map((input, i) => 
      i === infoIdx 
        ? { ...input, terms: input.terms.filter((_, j) => j !== termIdx) }
        : input
    ))
  }

  const handleTermChange = (infoIdx: number, termIdx: number, field: 'term' | 'description', value: string) => {
    setInputs(inputs => inputs.map((input, i) => 
      i === infoIdx 
        ? { 
            ...input, 
            terms: input.terms.map((term, j) => 
              j === termIdx ? { ...term, [field]: value } : term
            )
          }
        : input
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || inputs.some(input => !input.title || !input.content)) {
      setError('날짜와 모든 제목, 내용을 입력해주세요.')
      return
    }
    addOrUpdateMutation.mutate()
  }

  const handleEdit = (info: FinanceInfoItem, idx: number) => {
    setInputs([{ title: info.title, content: info.content, terms: info.terms || [] }])
    setDate(date)
    setEditId(true)
  }

  const handleDelete = (date: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(date)
    }
  }

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

  const handleBaseEdit = (b: BaseContent) => {
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
    <div className="max-w-6xl mx-auto mt-16 p-8 bg-white rounded-3xl shadow-2xl">
      {/* 금융 정보 관리 */}
      <section className="mb-12">
        <h2 className="text-3xl font-extrabold mb-8 text-emerald-700 flex items-center gap-2">💰 금융 정보 관리</h2>
        
        {/* 날짜 선택 */}
        <div className="mb-8 bg-emerald-50 rounded-xl p-6 shadow">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block font-semibold text-emerald-700 mb-2">날짜 선택</label>
              <select 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="w-full p-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
              >
                <option value="">날짜를 선택하세요</option>
                {dates.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => setDate(new Date().toISOString().slice(0, 10))}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition"
            >
              오늘 날짜
            </button>
          </div>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="mb-8 bg-emerald-50 rounded-xl p-6 shadow">
          <div className="space-y-6">
            {inputs.map((input, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-emerald-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-emerald-800">정보 {idx + 1}</h3>
                  {inputs.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveInput(idx)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition"
                    >
                      삭제
                    </button>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-semibold text-emerald-700 mb-2">제목</label>
                    <input 
                      type="text" 
                      placeholder="제목을 입력하세요" 
                      value={input.title} 
                      onChange={e => handleInputChange(idx, 'title', e.target.value)} 
                      className="w-full p-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300" 
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-emerald-700 mb-2">내용</label>
                    <textarea 
                      placeholder="내용을 입력하세요" 
                      value={input.content} 
                      onChange={e => handleInputChange(idx, 'content', e.target.value)} 
                      className="w-full p-3 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300" 
                      rows={3}
                    />
                  </div>
                </div>

                {/* 전문용어 관리 */}
                <div className="border-t border-emerald-100 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-emerald-700">전문용어</h4>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => handleAddTerm(idx)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition"
                      >
                        용어 추가
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleBulkTermsInput(idx)}
                        className="px-3 py-1 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 transition"
                      >
                        일괄 입력
                      </button>
                    </div>
                  </div>

                  {/* 일괄 입력 모달 */}
                  {showBulkInput === idx && (
                    <div className="mb-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
                      <label className="block font-semibold text-teal-700 mb-2">전문용어 일괄 입력 (탭 또는 2개 이상 공백으로 구분)</label>
                      <textarea 
                        value={bulkTermsText}
                        onChange={e => setBulkTermsText(e.target.value)}
                        placeholder="용어1&#9;설명1&#10;용어2&#9;설명2"
                        className="w-full p-3 border border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-300 focus:border-teal-300"
                        rows={4}
                      />
                      <div className="flex gap-2 mt-2">
                        <button 
                          type="button"
                          onClick={() => handleBulkTermsSubmit(idx)}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition"
                        >
                          추가
                        </button>
                        <button 
                          type="button"
                          onClick={handleBulkTermsCancel}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 용어 목록 */}
                  <div className="space-y-2">
                    {input.terms.map((term, termIdx) => (
                      <div key={termIdx} className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          placeholder="용어" 
                          value={term.term} 
                          onChange={e => handleTermChange(idx, termIdx, 'term', e.target.value)} 
                          className="flex-1 p-2 border border-emerald-200 rounded focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300" 
                        />
                        <input 
                          type="text" 
                          placeholder="설명" 
                          value={term.description} 
                          onChange={e => handleTermChange(idx, termIdx, 'description', e.target.value)} 
                          className="flex-1 p-2 border border-emerald-200 rounded focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300" 
                        />
                        <button 
                          type="button"
                          onClick={() => handleRemoveTerm(idx, termIdx)}
                          className="px-2 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600 transition"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {inputs.length < 3 && (
            <button 
              type="button"
              onClick={handleAddInput}
              className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition"
            >
              정보 추가
            </button>
          )}

          {error && <div className="text-red-500 font-semibold text-center mt-4">{error}</div>}
          {success && <div className="text-green-600 font-semibold text-center mt-4">{success}</div>}
          
          <button 
            type="submit" 
            disabled={addOrUpdateMutation.isPending}
            className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addOrUpdateMutation.isPending ? '등록 중...' : (editId ? '수정' : '등록')}
          </button>
        </form>

        {/* 등록된 정보 목록 */}
        <div className="grid gap-6">
          {dates.length === 0 && <div className="text-gray-400 text-center">등록된 금융 정보가 없습니다.</div>}
          {dates.map(dateItem => (
            <div key={dateItem} className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow">
              <div className="flex-1">
                <div className="text-xs text-emerald-500 mb-1">{dateItem}</div>
                {/* 해당 날짜의 금융 정보 불러오기 */}
                <div>
                  {isFetching && date === dateItem ? (
                    <div className="text-gray-400">불러오는 중...</div>
                  ) : (
                    financeInfos.length > 0 && date === dateItem ? (
                      financeInfos.map((info, idx) => (
                        <div key={idx} className="mb-2">
                          <div className="font-bold text-lg text-emerald-900 mb-1">{info.title}</div>
                          <div className="text-gray-700 text-sm whitespace-pre-line">{info.content}</div>
                          <button onClick={() => handleEdit(info, idx)} className="px-4 py-2 bg-yellow-400 text-white rounded-xl font-bold hover:bg-yellow-500 transition mt-2">수정</button>
                        </div>
                      ))
                    ) : null
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button onClick={() => { setDate(dateItem); refetchFinanceInfo(); }} className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition">불러오기</button>
                <button onClick={() => handleDelete(dateItem)} className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition">삭제</button>
              </div>
            </div>
          ))}
        </div>
      </section>

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
                {/* <div className="text-gray-700 text-sm whitespace-pre-line">{b.content}</div> */}
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
        <div className="mb-8 p-6 bg-gradient-to-r from-cyan-200 to-blue-100 rounded-2xl border-2 border-cyan-300 shadow flex flex-col gap-3">
          <div className="mb-2 font-semibold text-cyan-700 text-lg">ChatGPT에 물어볼 프롬프트와 기반 내용을 선택하세요.</div>
          <select value={selectedPromptId || ''} onChange={e => setSelectedPromptId(e.target.value)} className="w-full p-2 border rounded mb-2 text-black bg-white">
            <option value="" className="text-black">프롬프트 선택</option>
            {prompts.map(p => <option key={p.id} value={p.id} className="text-black">{p.title}</option>)}
          </select>
          <select value={selectedBaseId || ''} onChange={e => setSelectedBaseId(e.target.value)} className="w-full p-2 border rounded mb-2 text-black bg-white">
            <option value="" className="text-black">기반 내용 선택(선택사항)</option>
            {baseContents.map(b => <option key={b.id} value={b.id} className="text-black">{b.title}</option>)}
          </select>
          <button onClick={handleCopyAndGo} disabled={!selectedPromptId} className="w-full px-4 py-2 bg-cyan-600 text-white rounded-xl font-bold mt-2 disabled:opacity-50 hover:bg-cyan-700 transition">ChatGPT에 물어보기</button>
          {copied && <div className="text-green-600 mt-2">프롬프트+기반내용이 복사되었습니다!</div>}
          <div ref={combinedRef} tabIndex={0} className="mt-2 p-2 bg-white border rounded text-sm text-gray-700 whitespace-pre-line outline-none" style={{userSelect:'text'}}>
            {getCombinedText() || '선택된 프롬프트와 기반 내용이 여기에 미리보기로 표시됩니다.'}
          </div>
        </div>
      </section>
    </div>
  )
} 