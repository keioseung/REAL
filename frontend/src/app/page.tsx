"use client"

import { useRouter } from 'next/navigation'
import { FaRobot, FaArrowRight } from 'react-icons/fa'

export default function IntroPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
      {/* 배경 원형 효과 */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-400 opacity-30 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-400 opacity-30 rounded-full blur-3xl animate-pulse z-0" />
      {/* 메인 카드 */}
      <div className="relative z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl px-12 py-16 max-w-2xl border border-white/40">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl text-purple-600 drop-shadow-lg animate-bounce"><FaRobot /></span>
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">AI Mastery Hub</h1>
        </div>
        <p className="text-lg md:text-2xl text-gray-700 mb-8 text-center max-w-xl font-semibold">
          AI 학습의 새로운 시작!<br/>
          <span className="text-purple-600 font-bold">최신 AI 정보</span>와 <span className="text-blue-600 font-bold">퀴즈</span>로<br/>
          인공지능의 세계를 쉽고 재미있게 탐험해보세요.
        </p>
        <ul className="mb-8 text-gray-600 text-base md:text-lg space-y-2 text-left max-w-md">
          <li><span className="text-blue-500 font-bold">•</span> 매일 업데이트되는 AI 트렌드</li>
          <li><span className="text-purple-500 font-bold">•</span> 실전 퀴즈로 실력 점검</li>
          <li><span className="text-pink-500 font-bold">•</span> 나만의 학습 통계와 성취</li>
        </ul>
        <button
          className="group px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl rounded-full font-bold shadow-xl hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-3 animate-fade-in"
          onClick={() => router.push('/auth')}
        >
          지금 시작하기
          <FaArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
      {/* 하단 크레딧 */}
      <div className="absolute bottom-6 text-white/70 text-sm z-10 select-none">
        © {new Date().getFullYear()} AI Mastery Hub. All rights reserved.
      </div>
    </div>
  )
} 
