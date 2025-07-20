import { useQuery } from '@tanstack/react-query'
import { financeUserProgressAPI } from '@/lib/api'

export const useFinanceUserProgress = (sessionId: string) => {
  return useQuery({
    queryKey: ['financeUserProgress', sessionId],
    queryFn: async () => {
      // 임시 사용자 ID (실제로는 세션에서 사용자 ID를 가져와야 함)
      const userId = 1
      const response = await financeUserProgressAPI.getUserProgress(userId)
      return response.data
    },
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
  })
}

export const useFinanceUserStats = (sessionId: string) => {
  return useQuery({
    queryKey: ['financeUserStats', sessionId],
    queryFn: async () => {
      // 임시 사용자 ID (실제로는 세션에서 사용자 ID를 가져와야 함)
      const userId = 1
      const response = await financeUserProgressAPI.getStats(userId)
      return response.data
    },
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
  })
} 