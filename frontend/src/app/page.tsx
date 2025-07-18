"use client"

import { useRouter } from 'next/navigation'
import { FaRobot, FaArrowRight, FaBrain, FaRocket, FaTrophy, FaChartLine, FaLightbulb, FaUsers, FaGlobe, FaCode } from 'react-icons/fa'
import { useEffect, useRef, useState } from 'react'

export default function IntroPage() {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const [typedText, setTypedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  
  const fullText = "AI Mastery Hub"
  const taglines = [
    "인공지능의 미래를 탐험하세요",
    "매일 업데이트되는 AI 트렌드",
    "실전 퀴즈로 실력 점검",
    "나만의 학습 통계와 성취"
  ]
  const [currentTagline, setCurrentTagline] = useState(0)

  // 타이핑 애니메이션
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 150)
      return () => clearTimeout(timeout)
    } else {
      setIsTyping(false)
    }
  }, [currentIndex, fullText])

  // 태그라인 순환
  useEffect(() => {
    if (!isTyping) {
      const interval = setInterval(() => {
        setCurrentTagline((prev) => (prev + 1) % taglines.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isTyping, taglines.length])

  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.animate([
        { transform: 'scale(0.95) rotateX(10deg)', opacity: 0 },
        { transform: 'scale(1) rotateX(0deg)', opacity: 1 }
      ], {
        duration: 1200,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards'
      })
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden px-4">
      {/* 고급스러운 배경 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,255,0.15),transparent_50%)]" />
      
      {/* 움직이는 파티클 효과 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* 메인 카드 */}
      <div ref={cardRef} className="relative z-10 flex flex-col items-center justify-center bg-white/10 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] shadow-2xl px-6 py-12 md:px-16 md:py-24 w-full max-w-4xl border border-white/20 ring-1 ring-white/30 hover:ring-purple-400/50 transition-all duration-700 group">
        {/* 상단 아이콘과 제목 */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-6 md:mb-8 text-center md:text-left">
          <div className="relative">
            <span className="text-5xl md:text-7xl text-purple-400 drop-shadow-2xl animate-bounce-slow">
              <FaRobot />
            </span>
            <div className="absolute -top-2 -right-2 w-4 h-4 md:w-6 md:h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse" />
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl tracking-tight leading-tight">
              {typedText}
              {isTyping && <span className="animate-blink">|</span>}
            </h1>
            <div className="h-6 md:h-8 mt-2">
              <p className="text-lg md:text-xl lg:text-2xl text-purple-300 font-medium animate-fade-in-out">
                {taglines[currentTagline]}
              </p>
            </div>
          </div>
        </div>

        {/* 메인 설명 */}
        <p className="text-lg md:text-2xl lg:text-3xl text-gray-300 mb-8 md:mb-12 text-center max-w-3xl font-light leading-relaxed animate-fade-in px-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 font-bold">
            AI 학습의 새로운 차원
          </span>
          <br />
          <span className="text-white/90">
            최신 AI 정보와 실전 퀴즈로 인공지능의 세계를
          </span>
          <br />
          <span className="text-white/90">
            쉽고 재미있게 탐험해보세요
          </span>
        </p>

        {/* 기능 카드들 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12 w-full max-w-4xl px-4">
          {[
            { icon: FaBrain, title: "AI 트렌드", desc: "매일 업데이트되는 최신 정보", color: "from-blue-500 to-cyan-500" },
            { icon: FaRocket, title: "실전 퀴즈", desc: "실력 점검과 성장", color: "from-purple-500 to-pink-500" },
            { icon: FaChartLine, title: "학습 통계", desc: "개인별 진행 상황 추적", color: "from-green-500 to-emerald-500" },
            { icon: FaTrophy, title: "성취 시스템", desc: "목표 달성과 보상", color: "from-yellow-500 to-orange-500" },
            { icon: FaLightbulb, title: "스마트 학습", desc: "개인화된 학습 경로", color: "from-indigo-500 to-purple-500" },
            { icon: FaUsers, title: "커뮤니티", desc: "함께 성장하는 공간", color: "from-pink-500 to-rose-500" }
          ].map((feature, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:bg-white/10"
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="text-white text-lg md:text-xl" />
              </div>
              <h3 className="text-white font-bold text-base md:text-lg mb-1 md:mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA 버튼 */}
        <button
          className="group px-8 md:px-16 py-4 md:py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white text-lg md:text-2xl rounded-full font-bold shadow-2xl hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all flex items-center gap-3 md:gap-4 animate-fade-in hover:scale-105 active:scale-95 relative overflow-hidden w-full max-w-sm md:max-w-none"
          onClick={() => router.push('/auth')}
        >
          <span className="relative z-10">지금 시작하기</span>
          <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-200 relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>

        {/* 하단 통계 */}
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 mt-8 md:mt-12 text-white/60 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <FaGlobe className="text-purple-400" />
            <span>글로벌 AI 커뮤니티</span>
          </div>
          <div className="flex items-center gap-2">
            <FaCode className="text-pink-400" />
            <span>최신 기술 트렌드</span>
          </div>
        </div>
      </div>

      {/* 하단 크레딧 */}
      <div className="absolute bottom-4 md:bottom-8 text-white/60 text-sm md:text-base z-10 select-none animate-fade-in px-4 text-center">
        © {new Date().getFullYear()} <span className="font-bold text-white/80">AI Mastery Hub</span>. All rights reserved.
      </div>

      {/* 커스텀 애니메이션 스타일 */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        @keyframes fade-in-out {
          0%, 100% { opacity: 0; transform: translateY(10px); }
          20%, 80% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 1.5s cubic-bezier(0.22,1,0.36,1) both;
        }
      `}</style>
    </div>
  )
} 
