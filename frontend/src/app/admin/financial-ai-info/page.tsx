"use client"

import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financialAIInfoAPI } from '@/lib/api'

interface TermItem {
  term: string
  description: string
}

interface AIInfoItem {
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

export default function AdminFinancialAIInfoPage() {
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
    const pData = localStorage.getItem('financialPrompts')
    if (pData) setPrompts(JSON.parse(pData))
    const bData = localStorage.getItem('financialBaseContents')
    if (bData) setBaseContents(JSON.parse(bData))
  }, [])

  useEffect(() => {
    localStorage.setItem('financialPrompts', JSON.stringify(prompts))
  }, [prompts])
  
  useEffect(() => {
    localStorage.setItem('financialBaseContents', JSON.stringify(baseContents))
  }, [baseContents])

  // 서버에서 날짜별 금융 정보 목록 불러오기
  const { data: dates = [], refetch: refetchDates } = useQuery({
    queryKey: ['financial-ai-info-dates'],
    queryFn: async () => {
      const res = await financialAIInfoAPI.getAllDates()
      return res.data as string[]
    }
  })

  // 선택한 날짜의 금융 정보 불러오기
  const { data: aiInfos = [], refetch: refetchAIInfo, isFetching } = useQuery({
    queryKey: ['financial-ai-info', date],
    queryFn: async () => {
      if (!date) return []
      const res = await financialAIInfoAPI.getByDate(date)
      return res.data as AIInfoItem[]
    },
    enabled: !!date,
  })

  // 등록/수정
  const addOrUpdateMutation = useMutation({
    mutationFn: async () => {
      return financialAIInfoAPI.add({ date, infos: inputs })
    },
    onMutate: () => {
      setError('')
      setSuccess('')
    },
    onSuccess: () => {
      refetchAIInfo()
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
      return financialAIInfoAPI.delete(date)
    },
    onSuccess: () => {
      refetchAIInfo()
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
      if (trimmedLine.includes('\t')) {
        const [term, description] = trimmedLine.split('\t').map(s => s.trim())
        if (term && description) {
          terms.push({ term, description })
        }
      } else {
        const parts = trimmedLine.split(/\s{2,}/)
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
        alert(`${parsedTerms.length}개의 용어가 추가되었습니다!`)
      } else {
        alert('파싱할 수 있는 용어가 없습니다. 형식을 확인해주세요.')
      }
    }
    setShowBulkInput(null)
    setBulkTermsText('')
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
    setError('')
    setSuccess('')
    if (!date) {
      setError('날짜를 선택하세요.')
      return
    }
    if (inputs.some(input => !input.title.trim() || !input.content.trim())) {
      setError('모든 제목과 내용을 입력하세요.')
      return
    }
    addOrUpdateMutation.mutate()
  }

  const handleEdit = (info: AIInfoItem, idx: number) => {
    setEditId(true)
    setInputs([{ title: info.title, content: info.content, terms: info.terms || [] }])
  }

  const handleDelete = (date: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteMutation.mutate(date)
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

  // 기반 내용 관리 핸들러
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

  // 프롬프트+기반내용 합치기 영역 선택 기능
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
      {/* 금융 정보 관리 (AI 정보 관리와 동일) */}
      <section>
      <h2 className="text-3xl font-extrabold mb-8 text-blue-700 flex items-center gap-2">📝 금융 정보 관리</h2>
      <form onSubmit={handleSubmit} className="mb-10 bg-blue-50 rounded-xl p-6 shadow flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-semibold text-blue-700">날짜</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-300" />
          </div>
        </div>
        {/* 등록된 날짜 리스트 */}
        <div className="flex flex-wrap gap-2 mt-2">
          {dates.length === 0 ? (
            <span className="text-gray-400 text-sm">등록된 날짜가 없습니다.</span>
          ) : (
            dates.map(dateItem => (
              <button
                key={dateItem}
                type="button"
                onClick={() => setDate(dateItem)}
                className={`px-3 py-1 rounded-lg border font-semibold text-xs md:text-sm transition-colors ${date === dateItem ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100'}`}
              >
                {dateItem}
              </button>
            ))
          )}
        </div>
        <div className="grid gap-6">
          {inputs.map((input, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-blue-100 shadow-sm p-6 flex flex-col gap-3 relative">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-blue-700">제목</label>
                <input type="text" placeholder={`제목 ${idx+1}`} value={input.title} onChange={e => handleInputChange(idx, 'title', e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-300" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-blue-700">내용</label>
                <textarea placeholder={`내용 ${idx+1}`} value={input.content} onChange={e => handleInputChange(idx, 'content', e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-300" rows={2} />
              </div>
                {/* 용어 입력 섹션 */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-blue-700">관련 용어</label>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => handleBulkTermsInput(idx)} 
                        className="px-3 py-1 bg-purple-200 text-purple-700 rounded-lg font-bold hover:bg-purple-300 transition text-sm"
                        title="전문용어를 복사해서 붙여넣기"
                      >
                        📋 일괄 입력
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleAddTerm(idx)} 
                        className="px-3 py-1 bg-green-200 text-green-700 rounded-lg font-bold hover:bg-green-300 transition text-sm"
                      >
                        + 용어 추가
                      </button>
                    </div>
                  </div>
                  {/* 일괄 입력 모달 */}
                  {showBulkInput === idx && (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-yellow-800">📋 전문용어 일괄 입력</h4>
                        <button 
                          type="button" 
                          onClick={handleBulkTermsCancel}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-yellow-700 mb-2">
                          전문용어를 복사해서 붙여넣으세요. 탭(→) 또는 공백으로 구분됩니다.
                        </p>
                        <div className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded mb-2">
                          <strong>예시:</strong><br/>
                          LLM	GPT 같은 대형 언어 모델<br/>
                          자연어	우리가 일상에서 쓰는 언어<br/>
                          DSL	특정 분야 전용 프로그래밍 언어
                        </div>
                      </div>
                      <textarea
                        value={bulkTermsText}
                        onChange={(e) => setBulkTermsText(e.target.value)}
                        placeholder="용어	뜻&#10;LLM	GPT 같은 대형 언어 모델&#10;자연어	우리가 일상에서 쓰는 언어"
                        className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-300 text-sm"
                        rows={6}
                      />
                      <div className="flex gap-2 mt-3">
                        <button 
                          type="button" 
                          onClick={() => handleBulkTermsSubmit(idx)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 transition text-sm"
                        >
                          용어 추가
                        </button>
                        <button 
                          type="button" 
                          onClick={handleBulkTermsCancel}
                          className="px-4 py-2 bg-gray-400 text-white rounded-lg font-bold hover:bg-gray-500 transition text-sm"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}
                  {input.terms.map((term, termIdx) => (
                    <div key={termIdx} className="flex gap-2 items-start">
                      <div className="flex-1 flex gap-2">
                        <input 
                          type="text" 
                          placeholder="용어" 
                          value={term.term} 
                          onChange={e => handleTermChange(idx, termIdx, 'term', e.target.value)} 
                          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-300 text-sm" 
                        />
                        <input 
                          type="text" 
                          placeholder="용어 설명" 
                          value={term.description} 
                          onChange={e => handleTermChange(idx, termIdx, 'description', e.target.value)} 
                          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-300 text-sm" 
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTerm(idx, termIdx)} 
                        className="px-2 py-1 bg-red-200 text-red-700 rounded-lg font-bold hover:bg-red-300 transition text-sm"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              {inputs.length > 1 && (
                <button type="button" onClick={() => handleRemoveInput(idx)} className="absolute top-4 right-4 px-3 py-1 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition">-</button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={handleAddInput} disabled={inputs.length >= 3} className={`px-4 py-2 rounded-xl font-bold transition w-fit ${inputs.length >= 3 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-200 text-blue-700 hover:bg-blue-300'}`}>정보 추가</button>
        {error && <div className="text-red-500 font-semibold text-center mt-2">{error}</div>}
        {success && <div className="text-green-600 font-semibold text-center mt-2">{success}</div>}
        <button type="submit" disabled={addOrUpdateMutation.isPending} className="mt-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed">
          {addOrUpdateMutation.isPending ? '등록 중...' : (editId ? '수정' : '등록')}
        </button>
      </form>
      <div className="grid gap-6">
        {dates.length === 0 && <div className="text-gray-400 text-center">등록된 AI 정보가 없습니다.</div>}
        {dates.map(dateItem => (
          <div key={dateItem} className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow">
            <div className="flex-1">
              <div className="text-xs text-blue-500 mb-1">{dateItem}</div>
              {/* 해당 날짜의 AI 정보 불러오기 */}
              <div>
                {isFetching && date === dateItem ? (
                  <div className="text-gray-400">불러오는 중...</div>
                ) : (
                  aiInfos.length > 0 && date === dateItem ? (
                    aiInfos.map((info, idx) => (
                      <div key={idx} className="mb-2">
                        <div className="font-bold text-lg text-blue-900 mb-1">{info.title}</div>
                        <div className="text-gray-700 text-sm whitespace-pre-line">{info.content}</div>
                        <button onClick={() => handleEdit(info, idx)} className="px-4 py-2 bg-yellow-400 text-white rounded-xl font-bold hover:bg-yellow-500 transition mt-2">수정</button>
                      </div>
                    ))
                  ) : null
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button onClick={() => { setDate(dateItem); refetchAIInfo(); }} className="px-4 py-2 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition">불러오기</button>
              <button onClick={() => handleDelete(dateItem)} className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition">삭제</button>
            </div>
          </div>
        ))}
      </div>
      </section>
    </div>
  )
} 