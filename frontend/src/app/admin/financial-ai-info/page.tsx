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

  // ... 이하 기존 코드와 동일하게 복제 ...
} 