import apiClient from './client';

/**
 * Get spending by category within a date range
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise} - API response
 */
export const getSpendingByCategory = (startDate, endDate) => {
  let url = '/reports/spending-by-category';
  if (startDate && endDate) {
    url += `?start_date=${startDate}&end_date=${endDate}`;
  }
  return apiClient.get(url);
};

/**
 * Get monthly spending data for the specified number of months
 * @param {number} months - Number of months to analyze (default: 6)
 * @returns {Promise} - API response
 */
export const getMonthlySpending = (months = 6) => {
  return apiClient.get(`/reports/monthly-spending?months=${months}`);
};

/**
 * Get transaction trends with customizable interval and timeframe
 * @param {string} interval - Interval type: 'daily', 'weekly', or 'monthly'
 * @param {number} timeframe - Number of intervals to analyze
 * @returns {Promise} - API response
 */
export const getTransactionTrends = (interval = 'monthly', timeframe = 12) => {
  return apiClient.get(`/reports/transaction-trends?interval=${interval}&timeframe=${timeframe}`);
};

/**
 * Get performance metrics for all budgets
 * @returns {Promise} - API response
 */
export const getBudgetPerformance = () => {
  return apiClient.get('/reports/budget-performance');
};

/**
 * Get overall insights into spending patterns
 * @returns {Promise} - API response
 */
export const getSpendingInsights = () => {
  return apiClient.get('/reports/spending-insights');
};