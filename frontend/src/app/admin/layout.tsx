'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const adminTabs = [
  { href: '/admin', label: '관리자 홈', icon: '🏠' },
  { href: '/admin/ai-info', label: 'AI 정보 관리', icon: '📝' },
  { href: '/admin/quiz', label: '퀴즈 관리', icon: '🎯' },
  { href: '/admin/prompt', label: '프롬프트 관리', icon: '🤖' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* 사이드 메뉴 */}
      <aside className="w-64 bg-white/90 shadow-2xl p-8 flex flex-col gap-4 border-r border-blue-100">
        <h2 className="text-2xl font-extrabold mb-10 text-blue-700 tracking-tight">⚙️ 관리자</h2>
        <nav className="flex flex-col gap-2">
          {adminTabs.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-3 px-5 py-3 rounded-lg font-semibold text-lg transition-all duration-150
                ${pathname === tab.href ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' : 'hover:bg-blue-100 text-blue-700'}`}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </Link>
          ))}
        </nav>
      </aside>
      {/* 메인 컨텐츠 */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  )
} 