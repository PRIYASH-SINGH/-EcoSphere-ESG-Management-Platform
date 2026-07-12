import { useQuery } from '@tanstack/react-query';
import { reportsService } from '../services/reportsService';

export function useDashboardData() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardScores'],
    queryFn: async () => {
      const res = await reportsService.getDashboardScores();
      return res.data.data;
    }
  });

  // Calculate some aggregate metrics from the scores or use defaults
  const latestScore = data && data.length > 0 ? data[0] : null;

  const metrics = [
    { label: 'Environmental Score', value: latestScore ? latestScore.environmental : 0, trend: '+2%' },
    { label: 'Social Score', value: latestScore ? latestScore.social : 0, trend: '+1%' },
    { label: 'Governance Score', value: latestScore ? latestScore.governance : 0, trend: '0%' },
    { label: 'Overall ESG', value: latestScore ? latestScore.total : 0, trend: '+1.5%' },
  ];

  return { metrics, isLoading, error, data };
}
