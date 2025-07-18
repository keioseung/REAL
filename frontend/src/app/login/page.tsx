"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { isLoggedIn, login } = useAuth()
  const router = useRouter()

  if (typeof window !== 'undefined' && isLoggedIn) {
    router.replace('/')
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (login(password)) {
      router.replace('/')
    } else {
      setError('비밀번호가 올바르지 않습니다.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 w-full max-w-sm shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center gradient-text">관리자 로그인</h2>
        <input
          type="password"
          placeholder="관리자 비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-3 mb-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        {error && <div className="text-red-400 mb-2 text-sm text-center">{error}</div>}
        <button type="submit" className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all">로그인</button>
      </form>
    </div>
  )
} 