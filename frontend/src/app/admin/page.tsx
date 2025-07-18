'use client'

import Link from 'next/link'

export default function AdminMainPage() {
  return (
    <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold mb-8">⚙️ 관리자 페이지</h1>
      <div className="flex flex-col gap-6">
        <Link href="/admin/ai-info" className="block px-6 py-4 rounded-lg bg-blue-500 text-white text-xl font-semibold text-center hover:bg-blue-600 transition">AI 정보 관리</Link>
        <Link href="/admin/quiz" className="block px-6 py-4 rounded-lg bg-green-500 text-white text-xl font-semibold text-center hover:bg-green-600 transition">퀴즈 관리</Link>
        <Link href="/admin/prompt" className="block px-6 py-4 rounded-lg bg-purple-500 text-white text-xl font-semibold text-center hover:bg-purple-600 transition">프롬프트 관리</Link>
      </div>
    </div>
  )
} 