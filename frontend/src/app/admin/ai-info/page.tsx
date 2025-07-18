"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiInfoAPI } from '@/lib/api'

interface AIInfoItem {
  title: string
  content: string
}

export default function AdminAIInfoPage() {
  const queryClient = useQueryClient()
  const [date, setDate] = useState('')
  const [inputs, setInputs] = useState([{ title: '', content: '' }])
  const [editId, setEditId] = useState<boolean>(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 서버에서 날짜별 AI 정보 목록 불러오기
  const { data: dates = [], refetch: refetchDates } = useQuery({
    queryKey: ['ai-info-dates'],
    queryFn: async () => {
      const res = await aiInfoAPI.getAllDates()
      return res.data as string[]
    }
  })

  // 선택한 날짜의 AI 정보 불러오기
  const { data: aiInfos = [], refetch: refetchAIInfo, isFetching } = useQuery({
    queryKey: ['ai-info', date],
    queryFn: async () => {
      if (!date) return []
      const res = await aiInfoAPI.getByDate(date)
      return res.data as AIInfoItem[]
    },
    enabled: !!date,
  })

  // 등록/수정
  const addOrUpdateMutation = useMutation({
    mutationFn: async () => {
      return aiInfoAPI.add({ date, infos: inputs })
    },
    onMutate: () => {
      setError('')
      setSuccess('')
    },
    onSuccess: () => {
      refetchAIInfo()
      refetchDates()
      setInputs([{ title: '', content: '' }])
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
      return aiInfoAPI.delete(date)
    },
    onSuccess: () => {
      refetchAIInfo()
      refetchDates()
      setInputs([{ title: '', content: '' }])
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
      setInputs([...inputs, { title: '', content: '' }])
    }
  }

  const handleRemoveInput = (idx: number) => {
    setInputs(inputs => inputs.length === 1 ? inputs : inputs.filter((_, i) => i !== idx))
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
    setInputs([{ title: info.title, content: info.content }])
  }

  const handleDelete = (date: string) => {
    deleteMutation.mutate(date)
  }

  return (
    <div className="max-w-3xl mx-auto mt-16 p-8 bg-white rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-extrabold mb-8 text-blue-700 flex items-center gap-2">📝 AI 정보 관리</h2>
      <form onSubmit={handleSubmit} className="mb-10 bg-blue-50 rounded-xl p-6 shadow flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label className="font-semibold text-blue-700">날짜</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 border rounded focus:ring-2 focus:ring-blue-300" />
          </div>
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
    </div>
  )
} 