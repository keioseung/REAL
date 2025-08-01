"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FaRobot, FaUser, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaStar, FaDollarSign, FaBrain } from 'react-icons/fa'
import { User } from '@/types'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const system = searchParams.get('system') || 'ai'
  
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // 마우스 위치 추적
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const getSystemConfig = () => {
    if (system === 'finance') {
      return {
        title: 'Finance Mastery Hub',
        subtitle: '지금 시작하고 금융 세계를 탐험하세요',
        icon: FaDollarSign,
        gradient: 'from-green-500 to-emerald-500',
        bgGradient: 'from-slate-900 via-green-900 to-slate-900',
        accentColor: 'green'
      }
    }
    return {
      title: 'AI Mastery Hub',
      subtitle: '지금 시작하고 AI 세계를 탐험하세요',
      icon: FaRobot,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-slate-900 via-purple-900 to-slate-900',
      accentColor: 'purple'
    }
  }

  const config = getSystemConfig()

  // 회원가입
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError('모든 필드를 입력하세요.')
      return
    }
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]')
    if (users.find(u => u.username === username)) {
      setError('이미 존재하는 아이디입니다.')
      return
    }
    users.push({ username, password, role })
    localStorage.setItem('users', JSON.stringify(users))
    setError('')
    alert('회원가입이 완료되었습니다. 로그인 해주세요!')
    setTab('login')
    setUsername('')
    setPassword('')
  }

  // 로그인
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]')
    const user = users.find(u => u.username === username && u.password === password)
    if (!user) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
      return
    }
    localStorage.setItem('isAdminLoggedIn', user.role === 'admin' ? 'true' : 'false')
    localStorage.setItem('currentUser', JSON.stringify(user))
    localStorage.setItem('sessionId', user.username)
    localStorage.setItem('selectedSystem', system)
    setError('')
    if (user.role === 'admin') {
      router.replace(`/admin?system=${system}`)
    } else {
      router.replace(system === 'finance' ? '/dashboard/finance' : '/dashboard')
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient} relative overflow-hidden`}>
      {/* 고급스러운 배경 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,255,0.15),transparent_50%)]" />
      
      {/* 움직이는 그라데이션 배경 */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-pink-900/20 animate-gradient-shift" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-purple-900/10 animate-gradient-float" />
      
      {/* 인터랙티브 마우스 효과 */}
      <div 
        className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-out"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          transform: 'translate(-50%, -50%)'
        }}
      />
      
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

      {/* 빛나는 효과 */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          {/* 로고 및 제목 */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className={`w-16 h-16 bg-gradient-to-r ${config.gradient} rounded-2xl flex items-center justify-center shadow-2xl animate-glow`}>
                  <config.icon className="text-2xl text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse flex items-center justify-center">
                  <FaStar className="text-xs text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl tracking-tight leading-tight mb-2">
              {config.title}
            </h1>
            <p className="text-purple-300 font-medium">{config.subtitle}</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/60">
              <span className={`px-3 py-1 rounded-full bg-${config.accentColor}-500/20 text-${config.accentColor}-400 border border-${config.accentColor}-500/30`}>
                {system === 'finance' ? '금융 학습 시스템' : 'AI 학습 시스템'}
              </span>
            </div>
          </div>

          {/* 인증 카드 */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              {/* 탭 메뉴 */}
              <div className="flex mb-8 bg-white/10 rounded-2xl p-1">
                <button
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                    tab === 'login' 
                      ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg` 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => { setTab('login'); setError('') }}
                >
                  로그인
                </button>
                <button
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                    tab === 'register' 
                      ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg` 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => { setTab('register'); setError('') }}
                >
                  회원가입
                </button>
              </div>

              {/* 폼 */}
              {tab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                      <FaUser className="text-purple-400" />
                      아이디
                    </label>
                    <input
                      type="text"
                      placeholder="아이디를 입력하세요"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                      <FaLock className="text-purple-400" />
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full p-4 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    className={`w-full py-4 bg-gradient-to-r ${config.gradient} text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group`}
                  >
                    <span>로그인</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                      <FaUser className="text-purple-400" />
                      아이디
                    </label>
                    <input
                      type="text"
                      placeholder="아이디를 입력하세요"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                      <FaLock className="text-purple-400" />
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full p-4 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2 flex items-center gap-2">
                      <FaBrain className="text-purple-400" />
                      역할
                    </label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as 'admin' | 'user')}
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    >
                      <option value="user">사용자</option>
                      <option value="admin">관리자</option>
                    </select>
                  </div>
                  {error && (
                    <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    className={`w-full py-4 bg-gradient-to-r ${config.gradient} text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group`}
                  >
                    <span>회원가입</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* 시스템 변경 링크 */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.push(`/auth?system=${system === 'ai' ? 'finance' : 'ai'}`)}
              className="text-white/60 hover:text-white transition-colors text-sm"
            >
              {system === 'ai' ? '금융 학습 시스템으로 변경' : 'AI 학습 시스템으로 변경'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(-10px) translateY(-10px); }
          50% { transform: translateX(10px) translateY(-5px); }
          75% { transform: translateX(-5px) translateY(10px); }
        }
        
        @keyframes gradient-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.5); }
          50% { box-shadow: 0 0 40px rgba(236, 72, 153, 0.8); }
        }
        
        .animate-gradient-shift {
          animation: gradient-shift 8s ease-in-out infinite;
        }
        
        .animate-gradient-float {
          animation: gradient-float 6s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
} 