"use client"

import { useState, useEffect } from 'react'
import { FaDollarSign, FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter } from 'react-icons/fa'
import { financeInfoAPI } from '@/lib/api'

interface FinanceInfo {
  id: number
  title: string
  content: string
  date: string
  difficulty: string
  category: string
  created_at: string
  updated_at: string
}

interface FinanceInfoForm {
  title: string
  content: string
  date: string
  difficulty: string
  category: string
}

export default function FinanceAdminPage() {
  const [financeInfos, setFinanceInfos] = useState<FinanceInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [formData, setFormData] = useState<FinanceInfoForm>({
    title: '',
    content: '',
    date: '',
    difficulty: '초급',
    category: '주식'
  })

  useEffect(() => {
    fetchFinanceInfos()
  }, [])

  const fetchFinanceInfos = async () => {
    try {
      setLoading(true)
      const response = await financeInfoAPI.getAll()
      setFinanceInfos(response.data)
    } catch (err) {
      setError('금융 정보를 불러오는데 실패했습니다.')
      console.error('Error fetching finance infos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await financeInfoAPI.update(editingId, formData)
      } else {
        await financeInfoAPI.add(formData)
      }
      setShowForm(false)
      setEditingId(null)
      setFormData({
        title: '',
        content: '',
        date: '',
        difficulty: '초급',
        category: '주식'
      })
      fetchFinanceInfos()
    } catch (err) {
      setError(editingId ? '수정에 실패했습니다.' : '생성에 실패했습니다.')
      console.error('Error saving finance info:', err)
    }
  }

  const handleEdit = (info: FinanceInfo) => {
    setEditingId(info.id)
    setFormData({
      title: info.title,
      content: info.content,
      date: info.date,
      difficulty: info.difficulty,
      category: info.category
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await financeInfoAPI.delete(id)
      fetchFinanceInfos()
    } catch (err) {
      setError('삭제에 실패했습니다.')
      console.error('Error deleting finance info:', err)
    }
  }

  const filteredInfos = financeInfos.filter(info => {
    const matchesSearch = info.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         info.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = selectedDifficulty === 'all' || info.difficulty === selectedDifficulty
    const matchesCategory = selectedCategory === 'all' || info.category === selectedCategory
    return matchesSearch && matchesDifficulty && matchesCategory
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '초급': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case '중급': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case '고급': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaDollarSign className="text-green-400" />
          금융 정보 관리
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <FaPlus />
          새 금융 정보 추가
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* 검색 및 필터 */}
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="제목 또는 내용 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500"
            />
          </div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
          >
            <option value="all">모든 난이도</option>
            <option value="초급">초급</option>
            <option value="중급">중급</option>
            <option value="고급">고급</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
          >
            <option value="all">모든 카테고리</option>
            <option value="주식">주식</option>
            <option value="채권">채권</option>
            <option value="펀드">펀드</option>
            <option value="보험">보험</option>
            <option value="부동산">부동산</option>
            <option value="암호화폐">암호화폐</option>
          </select>
          <div className="flex items-center gap-2 text-white/60">
            <FaFilter />
            <span>{filteredInfos.length}개 결과</span>
          </div>
        </div>
      </div>

      {/* 금융 정보 목록 */}
      <div className="grid gap-4">
        {filteredInfos.map((info) => (
          <div
            key={info.id}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-semibold text-white">{info.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm border ${getDifficultyColor(info.difficulty)}`}>
                    {info.difficulty}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-sm">
                    {info.category}
                  </span>
                </div>
                
                <p className="text-white/70 mb-4 line-clamp-3">
                  {info.content}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-white/50">
                  <span>날짜: {new Date(info.date).toLocaleDateString('ko-KR')}</span>
                  <span>생성: {new Date(info.created_at).toLocaleDateString('ko-KR')}</span>
                  <span>수정: {new Date(info.updated_at).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleEdit(info)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  title="수정"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(info.id)}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  title="삭제"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 폼 모달 */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingId ? '금융 정보 수정' : '새 금융 정보 추가'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">제목</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">내용</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={6}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white mb-2">날짜</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white mb-2">난이도</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="초급">초급</option>
                    <option value="중급">중급</option>
                    <option value="고급">고급</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-white mb-2">카테고리</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                  >
                    <option value="주식">주식</option>
                    <option value="채권">채권</option>
                    <option value="펀드">펀드</option>
                    <option value="보험">보험</option>
                    <option value="부동산">부동산</option>
                    <option value="암호화폐">암호화폐</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingId ? '수정' : '추가'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({
                      title: '',
                      content: '',
                      date: '',
                      difficulty: '초급',
                      category: '주식'
                    })
                  }}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 