"use client"

import { useRouter } from 'next/navigation'
import { FaRobot, FaArrowRight } from 'react-icons/fa'
import { useEffect, useRef } from 'react'

export default function IntroPage() {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.animate([
        { transform: 'scale(0.95) rotateX(10deg)', opacity: 0 },
        { transform: 'scale(1) rotateX(0deg)', opacity: 1 }
      ], {
        duration: 900,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards'
      })
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-700 via-purple-700 to-pink-600 relative overflow-hidden">
      {/* 3D Glass Morphism 배경 */}
      <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-pink-400 opacity-30 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] bg-blue-400 opacity-30 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none z-0" />
      {/* 메인 카드 */}
      <div ref={cardRef} className="relative z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl px-14 py-20 max-w-2xl border border-white/40 ring-4 ring-purple-200/30 hover:ring-pink-300/40 transition-all duration-500 group">
        <div className="flex items-center gap-5 mb-6">
          <span className="text-6xl text-purple-600 drop-shadow-2xl animate-bounce-slow"><FaRobot /></span>
          <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl tracking-tight animate-gradient-x">AI Mastery Hub</h1>
        </div>
        <p className="text-xl md:text-2xl text-gray-700 mb-10 text-center max-w-xl font-semibold animate-fade-in">
          <span className="text-pink-600 font-extrabold text-2xl md:text-3xl">AI 학습의 새로운 차원!</span><br/>
          <span className="text-purple-600 font-bold">최신 AI 정보</span>와 <span className="text-blue-600 font-bold">퀴즈</span>로<br/>
          인공지능의 세계를 쉽고 재미있게 탐험해보세요.
        </p>
        <ul className="mb-10 text-gray-700 text-lg md:text-xl space-y-3 text-left max-w-md animate-fade-in">
          <li className="flex items-center gap-2"><span className="text-blue-500 text-2xl">•</span> <span className="font-bold">매일 업데이트되는 AI 트렌드</span></li>
          <li className="flex items-center gap-2"><span className="text-purple-500 text-2xl">•</span> <span className="font-bold">실전 퀴즈로 실력 점검</span></li>
          <li className="flex items-center gap-2"><span className="text-pink-500 text-2xl">•</span> <span className="font-bold">나만의 학습 통계와 성취</span></li>
        </ul>
        <button
          className="group px-12 py-5 bg-gradient-to-r from-blue-500 to-pink-500 text-white text-2xl rounded-full font-extrabold shadow-2xl hover:from-blue-700 hover:to-pink-700 transition-all flex items-center gap-4 animate-fade-in hover:scale-105 active:scale-95"
          onClick={() => router.push('/auth')}
        >
          지금 시작하기
          <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform duration-200" />
        </button>
      </div>
      {/* 하단 크레딧 */}
      <div className="absolute bottom-8 text-white/80 text-base z-10 select-none animate-fade-in">
        © {new Date().getFullYear()} <span className="font-bold text-white/90">AI Mastery Hub</span>. All rights reserved.
      </div>
      {/* 커스텀 애니메이션 스타일 */}
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.2s infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 1.2s cubic-bezier(0.22,1,0.36,1) both;
        }
      `}</style>
    </div>
  )
} 
