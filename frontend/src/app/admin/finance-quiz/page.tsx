"use client"

import { useState, useEffect } from 'react'
import { FaDollarSign, FaPlus, FaEdit, FaTrash, FaQuestion, FaSearch, FaFilter } from 'react-icons/fa'
import { financeQuizAPI } from '@/lib/api'

interface FinanceQuiz {
  id: number
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  difficulty: string
  category: string
  created_at: string
  updated_at: string
}

interface FinanceQuizForm {
  question: string
  options: string[]
  correct_answer: number
  explanation: string
  difficulty: string
  category: string
}

export default function FinanceQuizAdminPage() {
  const [quizzes, setQuizzes] = useState<FinanceQuiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [formData, setFormData] = useState<FinanceQuizForm>({
    question: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    explanation: '',
    difficulty: '초급',
    category: '주식'
  })

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const response = await financeQuizAPI.getAll()
      setQuizzes(response.data)
    } catch (err) {
      setError('퀴즈를 불러오는데 실패했습니다.')
      console.error('Error fetching quizzes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await financeQuizAPI.update(editingId, formData)
      } else {
        await financeQuizAPI.create(formData)
      }
      setShowForm(false)
      setEditingId(null)
      setFormData({
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: '',
        difficulty: '초급',
        category: '주식'
      })
      fetchQuizzes()
    } catch (err) {
      setError(editingId ? '수정에 실패했습니다.' : '생성에 실패했습니다.')
      console.error('Error saving quiz:', err)
    }
  }

  const handleEdit = (quiz: FinanceQuiz) => {
    setEditingId(quiz.id)
    setFormData({
      question: quiz.question,
      options: quiz.options,
      correct_answer: quiz.correct_answer,
      explanation: quiz.explanation,
      difficulty: quiz.difficulty,
      category: quiz.category
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await financeQuizAPI.delete(id)
      fetchQuizzes()
    } catch (err) {
      setError('삭제에 실패했습니다.')
      console.error('Error deleting quiz:', err)
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({ ...formData, options: newOptions })
  }

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.explanation.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty
    const matchesCategory = selectedCategory === 'all' || quiz.category === selectedCategory
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
          <FaQuestion className="text-green-400" />
          금융 퀴즈 관리
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <FaPlus />
          새 퀴즈 추가
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
              placeholder="문제 또는 설명 검색..."
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
            <span>{filteredQuizzes.length}개 결과</span>
          </div>
        </div>
      </div>

      {/* 퀴즈 목록 */}
      <div className="grid gap-4">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm border ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-sm">
                    {quiz.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-4">{quiz.question}</h3>
                
                <div className="space-y-2 mb-4">
                  {quiz.options.map((option, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        index === quiz.correct_answer
                          ? 'bg-green-500/20 border-green-500/30 text-green-400'
                          : 'bg-white/5 border-white/10 text-white/70'
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </div>
                  ))}
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                  <p className="text-blue-400 text-sm">
                    <strong>정답:</strong> {String.fromCharCode(65 + quiz.correct_answer)}. {quiz.options[quiz.correct_answer]}
                  </p>
                  <p className="text-blue-300 text-sm mt-2">{quiz.explanation}</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-white/50">
                  <span>생성: {new Date(quiz.created_at).toLocaleDateString('ko-KR')}</span>
                  <span>수정: {new Date(quiz.updated_at).toLocaleDateString('ko-KR')}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleEdit(quiz)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  title="수정"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(quiz.id)}
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
              {editingId ? '퀴즈 수정' : '새 퀴즈 추가'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white mb-2">문제</label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white mb-2">보기</label>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={formData.correct_answer === index}
                      onChange={() => setFormData({...formData, correct_answer: index})}
                      className="text-green-500"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`보기 ${index + 1}`}
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                      required
                    />
                  </div>
                ))}
              </div>
              
              <div>
                <label className="block text-white mb-2">해설</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      question: '',
                      options: ['', '', '', ''],
                      correct_answer: 0,
                      explanation: '',
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