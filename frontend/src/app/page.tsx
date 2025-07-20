"use client"

import { useRouter } from 'next/navigation'
import { FaRobot, FaArrowRight, FaBrain, FaRocket, FaTrophy, FaChartLine, FaLightbulb, FaUsers } from 'react-icons/fa'
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
        <div className="text-center mb-12 md:mb-16">
          {/* 로고 및 제목 */}
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <FaRobot className="text-3xl md:text-4xl text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl tracking-tight leading-tight mb-4">
                {typedText}
                {isTyping && <span className="animate-blink">|</span>}
              </h1>
              <div className="h-8 md:h-10">
                <p className="text-lg md:text-xl lg:text-2xl text-purple-300 font-medium animate-fade-in-out">
                  {taglines[currentTagline]}
                </p>
              </div>
            </div>
          </div>

          {/* 메인 설명 */}
          <div className="max-w-2xl mx-auto mb-12">
            <p className="text-lg md:text-xl text-white/80 leading-relaxed">
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
            className="group px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white text-lg md:text-xl rounded-2xl font-bold shadow-2xl hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all flex items-center gap-3 mx-auto animate-fade-in hover:scale-105 active:scale-95 relative overflow-hidden"
            onClick={() => router.push('/auth')}
          >
            <span className="relative z-10">지금 시작하기</span>
            <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-200 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </button>
        </div>

        {/* 기능 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl mb-16">
          {[
            { 
              icon: FaBrain, 
              title: "AI 트렌드", 
              desc: "매일 업데이트되는 최신 AI 정보와 트렌드를 한눈에", 
              color: "from-blue-500 to-cyan-500"
            },
            { 
              icon: FaRocket, 
              title: "실전 퀴즈", 
              desc: "AI 지식을 실전 퀴즈로 점검하고 실력을 향상시켜보세요", 
              color: "from-purple-500 to-pink-500"
            },
            { 
              icon: FaChartLine, 
              title: "학습 통계", 
              desc: "개인별 학습 진행 상황을 상세한 통계로 추적하고 분석", 
              color: "from-green-500 to-emerald-500"
            },
            { 
              icon: FaTrophy, 
              title: "성취 시스템", 
              desc: "학습 목표 달성에 따른 보상과 성취감을 경험하세요", 
              color: "from-yellow-500 to-orange-500"
            },
            { 
              icon: FaLightbulb, 
              title: "스마트 학습", 
              desc: "개인화된 학습 경로와 맞춤형 콘텐츠로 효율적인 학습", 
              color: "from-indigo-500 to-purple-500"
            },
            { 
              icon: FaUsers, 
              title: "커뮤니티", 
              desc: "다른 학습자들과 함께 성장하고 지식을 공유하는 공간", 
              color: "from-pink-500 to-rose-500"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:bg-white/10 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="text-white text-xl" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 w-full max-w-4xl">
          {[
            { label: "AI 정보", value: "1000+", icon: FaBrain },
            { label: "퀴즈 문제", value: "500+", icon: FaRocket },
            { label: "학습자", value: "10K+", icon: FaUsers },
            { label: "성공률", value: "95%", icon: FaTrophy }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <stat.icon className="text-purple-400 text-xl md:text-2xl" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/60 text-sm">{stat.label}</div>
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

