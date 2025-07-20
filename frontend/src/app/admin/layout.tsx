"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaBrain, FaDollarSign, FaChartLine, FaQuestion, FaCog } from 'react-icons/fa'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'AI 정보 관리',
      href: '/admin/ai-info',
      icon: FaBrain,
      color: 'text-blue-400'
    },
    {
      name: 'AI 퀴즈 관리',
      href: '/admin/quiz',
      icon: FaQuestion,
      color: 'text-blue-400'
    },
    {
      name: 'AI 통계',
      href: '/admin/stats',
      icon: FaChartLine,
      color: 'text-blue-400'
    },
    {
      name: '금융 정보 관리',
      href: '/admin/finance',
      icon: FaDollarSign,
      color: 'text-green-400'
    },
    {
      name: '금융 퀴즈 관리',
      href: '/admin/finance-quiz',
      icon: FaQuestion,
      color: 'text-green-400'
    },
    {
      name: '금융 통계',
      href: '/admin/finance-stats',
      icon: FaChartLine,
      color: 'text-green-400'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* 네비게이션 */}
      <nav className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center gap-2 text-white font-bold text-xl">
                <FaCog className="text-blue-400" />
                관리자 대시보드
              </Link>
            </div>
            {/* 모바일 친화적 네비게이션: 가로 스크롤, 아이콘+짧은 텍스트 */}
            <div className="flex items-center overflow-x-auto space-x-2 sm:space-x-4 scrollbar-hide max-w-full py-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/60 hover:text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <item.icon className={item.color + ' text-base sm:text-lg'} />
                    <span className="hidden xs:inline sm:inline">{item.name}</span>
                    <span className="inline xs:hidden sm:hidden">{item.name.replace(/관리|통계|프롬프트|퀴즈/g, '')}</span>
                  </Link>
                )
              })}
              {/* 금융정보관리 탭(완전 동일) */}
              <Link
                href="/admin/financial-ai-info"
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${pathname === '/admin/financial-ai-info' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white/80 hover:bg-white/10'}`}
              >
                <FaDollarSign className="text-green-400 text-base sm:text-lg" />
                <span className="hidden xs:inline sm:inline">금융정보관리</span>
                <span className="inline xs:hidden sm:hidden">금융</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
} 