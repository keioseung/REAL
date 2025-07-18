"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.replace('/auth')
      return
    }
    const user = JSON.parse(userStr)
    if (user.role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="glass rounded-2xl p-8 w-full max-w-2xl shadow-lg text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">관리자 페이지</h1>
        <p className="text-white/80 mb-8">AI Mastery Hub의 관리자 전용 대시보드입니다.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-semibold mb-2">AI 정보 관리</h2>
            <p>AI 정보 등록, 수정, 삭제 등</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-semibold mb-2">퀴즈 관리</h2>
            <p>퀴즈 문제 추가, 수정, 삭제 등</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-semibold mb-2">프롬프트 관리</h2>
            <p>AI 프롬프트 관리</p>
          </div>
          <div className="bg-white/10 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-semibold mb-2">사용자 통계</h2>
            <p>전체 사용자 학습/퀴즈 통계</p>
          </div>
        </div>
      </div>
    </div>
  )
} 