"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  username: string
  password: string
  role: 'admin' | 'user'
}

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'user'>('user')
  const [error, setError] = useState('')
  const router = useRouter()

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
    setError('')
    if (user.role === 'admin') {
      router.replace('/admin')
    } else {
      router.replace('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      <div className="glass rounded-2xl p-8 w-full max-w-md shadow-lg">
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 font-bold rounded-l-2xl ${tab === 'login' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60'}`}
            onClick={() => { setTab('login'); setError('') }}
          >로그인</button>
          <button
            className={`flex-1 py-2 font-bold rounded-r-2xl ${tab === 'register' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60'}`}
            onClick={() => { setTab('register'); setError('') }}
          >회원가입</button>
        </div>
        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="아이디"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 mb-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 mb-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            {error && <div className="text-red-400 mb-2 text-sm text-center">{error}</div>}
            <button type="submit" className="w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all">로그인</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="아이디"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 mb-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 mb-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <div className="flex gap-4 mb-4">
              <label className="flex-1 flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={() => setRole('user')}
                  className="accent-blue-500"
                />
                <span className="text-white">일반 사용자</span>
              </label>
              <label className="flex-1 flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="accent-purple-500"
                />
                <span className="text-white">관리자</span>
              </label>
            </div>
            {error && <div className="text-red-400 mb-2 text-sm text-center">{error}</div>}
            <button type="submit" className="w-full p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all">회원가입</button>
          </form>
        )}
      </div>
    </div>
  )
} 