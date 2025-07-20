import { useQuery } from '@tanstack/react-query'
import { financeUserProgressAPI } from '@/lib/api'

export const useFinanceUserProgress = (sessionId: string) => {
  return useQuery({
    queryKey: ['financeUserProgress', sessionId],
    queryFn: async () => {
      const response = await financeUserProgressAPI.get(sessionId)
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
      const response = await financeUserProgressAPI.getStats(sessionId)
      return response.data
    },
    staleTime: 1 * 60 * 1000, // 1분
    gcTime: 5 * 60 * 1000, // 5분
  })
} 