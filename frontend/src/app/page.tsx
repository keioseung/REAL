"use client"

import { useRouter } from 'next/navigation'

export default function IntroPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <h1 className="text-6xl font-extrabold gradient-text mb-6 text-center drop-shadow-lg">AI Mastery Hub</h1>
      <p className="text-2xl text-white/90 mb-10 text-center max-w-xl">AI 학습의 새로운 시작!<br/>지금 바로 인공지능의 세계를 탐험해보세요.</p>
      <button
        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl rounded-full font-bold shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all"
        onClick={() => router.push('/auth')}
      >
        시작하기
      </button>
    </div>
  )
} 
