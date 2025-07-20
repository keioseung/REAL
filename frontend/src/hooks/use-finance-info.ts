import { useQuery } from '@tanstack/react-query'
import { financeInfoAPI } from '@/lib/api'

export const useFinanceInfo = (date: string) => {
  return useQuery({
    queryKey: ['financeInfo', date],
    queryFn: async () => {
      const response = await financeInfoAPI.getAll()
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  })
}

export const useFetchFinanceNews = () => {
  return useQuery({
    queryKey: ['financeNews'],
    queryFn: async () => {
      // 임시 뉴스 데이터 (실제로는 금융 뉴스 API를 호출해야 함)
      return [
        {
          title: "주식시장 상승세 지속, 투자자들 낙관적",
          content: "최근 주식시장이 상승세를 보이며 투자자들의 관심이 높아지고 있습니다. 다양한 섹터에서 성장세를 보이고 있어 시장 전망이 밝습니다.",
          link: "#"
        },
        {
          title: "암호화폐 시장 변동성 증가",
          content: "암호화폐 시장에서 변동성이 증가하고 있습니다. 투자자들은 신중한 접근이 필요하다는 전문가들의 조언이 나오고 있습니다.",
          link: "#"
        },
        {
          title: "부동산 시장 정책 변화 예상",
          content: "정부의 부동산 정책 변화가 예상되며, 시장 참여자들의 관심이 집중되고 있습니다. 투자 전략 재검토가 필요한 상황입니다.",
          link: "#"
        }
      ]
    },
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 20 * 60 * 1000, // 20분
  })
} 