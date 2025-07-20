import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financialAIInfoAPI } from '@/lib/api'
import type { AIInfoItem, AIInfoCreate } from '@/types'

function useFinancialAIInfo(date: string) {
  return useQuery({
    queryKey: ['financial-ai-info', date],
    queryFn: async () => {
      const response = await financialAIInfoAPI.getByDate(date)
      return response.data as AIInfoItem[]
    },
    enabled: !!date,
  })
}

export default useFinancialAIInfo

export function useAddFinancialAIInfo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: AIInfoCreate) => {
      const response = await financialAIInfoAPI.add(data)
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['financial-ai-info', variables.date] })
      queryClient.invalidateQueries({ queryKey: ['financial-ai-info-dates'] })
    },
  })
}

export function useDeleteFinancialAIInfo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (date: string) => {
      const response = await financialAIInfoAPI.delete(date)
      return response.data
    },
    onSuccess: (data, date) => {
      queryClient.invalidateQueries({ queryKey: ['financial-ai-info', date] })
      queryClient.invalidateQueries({ queryKey: ['financial-ai-info-dates'] })
    },
  })
}

export function useFinancialAIInfoDates() {
  return useQuery({
    queryKey: ['financial-ai-info-dates'],
    queryFn: async () => {
      const response = await financialAIInfoAPI.getAllDates()
      return response.data as string[]
    },
  })
} 