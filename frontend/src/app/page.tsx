"use client"

import { useRouter } from 'next/navigation'
import { FaRobot, FaArrowRight, FaBrain, FaRocket, FaChartLine } from 'react-icons/fa'
import { useEffect, useState } from 'react'

export default function IntroPage() {
  const router = useRouter()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
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

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* 헤더 섹션 */}
        <div className="text-center mb-16 md:mb-20">
          {/* 로고 및 제목 */}
          <div className="flex flex-col items-center gap-8 mb-12">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <FaRobot className="text-4xl md:text-5xl text-white" />
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl tracking-tight leading-tight mb-6">
                {typedText}
                {isTyping && <span className="animate-blink">|</span>}
              </h1>
              <div className="h-10 md:h-12">
                <p className="text-xl md:text-2xl lg:text-3xl text-purple-300 font-medium animate-fade-in-out">
                  {taglines[currentTagline]}
                </p>
              </div>
            </div>
          </div>

          {/* 메인 설명 */}
          <div className="max-w-3xl mx-auto mb-16">
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed">
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
          </div>

          {/* CTA 버튼 */}
          <button
            className="group px-12 md:px-16 py-5 md:py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white text-xl md:text-2xl rounded-2xl font-bold shadow-2xl hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all flex items-center gap-4 mx-auto animate-fade-in hover:scale-105 active:scale-95 relative overflow-hidden"
            onClick={() => router.push('/auth')}
          >
            <span className="relative z-10">지금 시작하기</span>
            <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-200 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>

        {/* 기능 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full max-w-5xl mb-20">
          {[
            { 
              icon: FaBrain, 
              title: "AI 트렌드", 
              desc: "매일 업데이트되는 최신 AI 정보와 트렌드를 한눈에 확인하세요. 전문가들이 선별한 핵심 내용으로 AI 세계의 최전선을 경험해보세요.", 
              color: "from-blue-500 to-cyan-500"
            },
            { 
              icon: FaRocket, 
              title: "실전 퀴즈", 
              desc: "AI 지식을 실전 퀴즈로 점검하고 실력을 향상시켜보세요. 다양한 난이도의 문제로 체계적인 학습이 가능합니다.", 
              color: "from-purple-500 to-pink-500"
            },
            { 
              icon: FaChartLine, 
              title: "학습 통계", 
              desc: "개인별 학습 진행 상황을 상세한 통계로 추적하고 분석하세요. 목표 설정과 성과 관리를 통해 효율적인 학습을 지원합니다.", 
              color: "from-green-500 to-emerald-500"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:bg-white/10 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white text-2xl" />
                </div>
                <h3 className="text-white font-bold text-2xl mb-4">{feature.title}</h3>
                <p className="text-gray-300 text-base leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 통계 */}
        <div className="grid grid-cols-3 gap-8 md:gap-12 w-full max-w-4xl">
          {[
            { label: "AI 정보", value: "1000+", icon: FaBrain },
            { label: "퀴즈 문제", value: "500+", icon: FaRocket },
            { label: "학습자", value: "10K+", icon: FaChartLine }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="text-purple-400 text-2xl md:text-3xl" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-white/60 text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

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

