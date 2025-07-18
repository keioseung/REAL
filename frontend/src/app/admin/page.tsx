"use client"

import { useRouter } from 'next/navigation'

const adminMenus = [
  { href: '/admin/ai-info', label: 'AI 정보 관리', icon: '📝', desc: 'AI 정보 등록, 수정, 삭제 등' },
  { href: '/admin/quiz', label: '퀴즈 관리', icon: '🎯', desc: '퀴즈 문제 추가, 수정, 삭제 등' },
  { href: '/admin/prompt', label: '프롬프트 관리', icon: '🤖', desc: 'AI 프롬프트 관리' },
  { href: '/admin/stats', label: '사용자 통계', icon: '📊', desc: '전체 사용자 학습/퀴즈 통계' },
]

export default function AdminPage() {
  const router = useRouter()
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
      <h1 className="text-4xl font-extrabold gradient-text mb-2 text-center drop-shadow-lg">관리자 페이지</h1>
      <p className="text-white/80 mb-10 text-center text-lg">AI Mastery Hub의 관리자 전용 대시보드입니다.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
        {adminMenus.map(menu => (
          <button
            key={menu.href}
            onClick={() => router.push(menu.href)}
            className="flex flex-col items-start p-8 rounded-2xl shadow-xl bg-white/90 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white transition-all border border-blue-100 group text-left"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{menu.icon}</span>
            <span className="text-2xl font-bold mb-1 group-hover:text-white">{menu.label}</span>
            <span className="text-gray-500 group-hover:text-white/80">{menu.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
} 