import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userProgressAPI } from '@/lib/api'
import type { UserProgress, UserStats } from '@/types'

function useUserProgress(sessionId: string) {
  return useQuery({
    queryKey: ['user-progress', sessionId],
    queryFn: async () => {
      const response = await userProgressAPI.get(sessionId)
      return response.data as UserProgress
    },
    enabled: !!sessionId,
  })
}

export default useUserProgress

export function useUserStats(sessionId: string) {
  return useQuery({
    queryKey: ['user-stats', sessionId],
    queryFn: async () => {
      const response = await userProgressAPI.getStats(sessionId)
      return response.data as UserStats
    },
    enabled: !!sessionId,
  })
}

export function useUpdateUserProgress() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      date, 
      infoIndex 
    }: { 
      sessionId: string
      date: string
      infoIndex: number 
    }) => {
      const response = await userProgressAPI.update(sessionId, date, infoIndex)
      return response.data
    },
    onSuccess: (data, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-progress', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['user-stats', sessionId] })
    },
  })
}

export function useUpdateUserStats() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      stats 
    }: { 
      sessionId: string
      stats: UserStats 
    }) => {
      const response = await userProgressAPI.updateStats(sessionId, stats)
      return response.data
    },
    onSuccess: (data, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-stats', sessionId] })
    },
  })
}

export function useCheckAchievements() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await userProgressAPI.checkAchievements(sessionId)
      return response.data
    },
    onSuccess: (data, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['user-stats', sessionId] })
    },
  })
} 
