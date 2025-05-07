import apiClient from './client';

export const getSpendingInsights = () => {
  return apiClient.get('/reports/spending-insights');
};

export const getSpendingByCategory = (startDate, endDate) => {
  let url = '/reports/spending-by-category';
  if (startDate && endDate) {
    url += `?start_date=${startDate}&end_date=${endDate}`;
  }
  return apiClient.get(url);
};

export const getMonthlySpending = (months = 6) => {
  return apiClient.get(`/reports/monthly-spending?months=${months}`);
};

export const getTransactionTrends = (interval = 'monthly', timeframe = 12) => {
  return apiClient.get(`/reports/transaction-trends?interval=${interval}&timeframe=${timeframe}`);
};

export const getBudgetPerformance = () => {
  return apiClient.get('/reports/budget-performance');
};