import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  getSpendingByCategory, 
  getMonthlySpending, 
  getTransactionTrends, 
  getBudgetPerformance,
  getSpendingInsights
} from '../api/reports';
import Layout from '../components/Layout/Layout';
import { 
  Box, Typography, Paper, Grid, CircularProgress, 
  FormControl, InputLabel, Select, MenuItem, TextField
} from '@mui/material';

const ReportsPage = () => {
  // State for each report type
  const [spendingByCategory, setSpendingByCategory] = useState(null);
  const [monthlySpending, setMonthlySpending] = useState(null);
  const [transactionTrends, setTransactionTrends] = useState(null);
  const [budgetPerformance, setBudgetPerformance] = useState(null);
  const [spendingInsights, setSpendingInsights] = useState(null);
  
  // State for filters
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [months, setMonths] = useState(6);
  const [interval, setInterval] = useState('monthly');
  const [timeframe, setTimeframe] = useState(12);
  
  // Loading states
  const [loading, setLoading] = useState({
    spendingByCategory: false,
    monthlySpending: false,
    transactionTrends: false,
    budgetPerformance: false,
    spendingInsights: false
  });

  // Error states
  const [error, setError] = useState({
    spendingByCategory: null,
    monthlySpending: null,
    transactionTrends: null,
    budgetPerformance: null,
    spendingInsights: null
  });

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BDB', '#FF6B6B', '#4ECDC4', '#C7F464'];

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Fetch spending by category
  const fetchSpendingByCategory = async () => {
    try {
      setLoading(prev => ({ ...prev, spendingByCategory: true }));
      const response = await getSpendingByCategory(dateRange.startDate, dateRange.endDate);
      setSpendingByCategory(response.data);
      setError(prev => ({ ...prev, spendingByCategory: null }));
    } catch (err) {
      setError(prev => ({ ...prev, spendingByCategory: err.message || 'Error fetching category data' }));
    } finally {
      setLoading(prev => ({ ...prev, spendingByCategory: false }));
    }
  };

  // Fetch monthly spending
  const fetchMonthlySpending = async () => {
    try {
      setLoading(prev => ({ ...prev, monthlySpending: true }));
      const response = await getMonthlySpending(months);
      setMonthlySpending(response.data);
      setError(prev => ({ ...prev, monthlySpending: null }));
    } catch (err) {
      setError(prev => ({ ...prev, monthlySpending: err.message || 'Error fetching monthly data' }));
    } finally {
      setLoading(prev => ({ ...prev, monthlySpending: false }));
    }
  };

  // Fetch transaction trends
  const fetchTransactionTrends = async () => {
    try {
      setLoading(prev => ({ ...prev, transactionTrends: true }));
      const response = await getTransactionTrends(interval, timeframe);
      setTransactionTrends(response.data);
      setError(prev => ({ ...prev, transactionTrends: null }));
    } catch (err) {
      setError(prev => ({ ...prev, transactionTrends: err.message || 'Error fetching trend data' }));
    } finally {
      setLoading(prev => ({ ...prev, transactionTrends: false }));
    }
  };

  // Fetch budget performance
  const fetchBudgetPerformance = async () => {
    try {
      setLoading(prev => ({ ...prev, budgetPerformance: true }));
      const response = await getBudgetPerformance();
      setBudgetPerformance(response.data);
      setError(prev => ({ ...prev, budgetPerformance: null }));
    } catch (err) {
      setError(prev => ({ ...prev, budgetPerformance: err.message || 'Error fetching budget data' }));
    } finally {
      setLoading(prev => ({ ...prev, budgetPerformance: false }));
    }
  };

  // Fetch spending insights
  const fetchSpendingInsights = async () => {
    try {
      setLoading(prev => ({ ...prev, spendingInsights: true }));
      const response = await getSpendingInsights();
      setSpendingInsights(response.data);
      setError(prev => ({ ...prev, spendingInsights: null }));
    } catch (err) {
      setError(prev => ({ ...prev, spendingInsights: err.message || 'Error fetching insights' }));
    } finally {
      setLoading(prev => ({ ...prev, spendingInsights: false }));
    }
  };

  // Handle date range change
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Initial data fetch
  useEffect(() => {
    fetchSpendingByCategory();
    fetchMonthlySpending();
    fetchTransactionTrends();
    fetchBudgetPerformance();
    fetchSpendingInsights();
  }, []);

  // Refetch spending by category when date range changes
  useEffect(() => {
    fetchSpendingByCategory();
  }, [dateRange]);

  // Refetch monthly spending when months changes
  useEffect(() => {
    fetchMonthlySpending();
  }, [months]);

  // Refetch transaction trends when interval or timeframe changes
  useEffect(() => {
    fetchTransactionTrends();
  }, [interval, timeframe]);

  return (
    <Layout title="Financial Reports">
      {/* Spending Insights */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Spending Insights
        </Typography>
        
        {loading.spendingInsights ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        ) : error.spendingInsights ? (
          <Typography color="error">Error: {error.spendingInsights}</Typography>
        ) : spendingInsights ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f9ff' }}>
                <Typography variant="subtitle2" color="textSecondary">This Month vs. Last Month</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ my: 1 }}>
                  {formatCurrency(spendingInsights.this_month_spending)}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: spendingInsights.month_over_month_change > 0 ? 'error.main' : 'success.main' 
                }}>
                  <span>{spendingInsights.month_over_month_change > 0 ? '↑' : '↓'}</span>
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {Math.abs(spendingInsights.month_over_month_change).toFixed(1)}% from last month
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f9ff' }}>
                <Typography variant="subtitle2" color="textSecondary">Biggest Expense</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ my: 1 }}>
                  {spendingInsights.biggest_expense_category}
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(spendingInsights.biggest_expense_amount)}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f9ff' }}>
                <Typography variant="subtitle2" color="textSecondary">Daily Average</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ my: 1 }}>
                  {formatCurrency(spendingInsights.average_daily_spending)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Day {spendingInsights.days_elapsed} of {spendingInsights.days_in_month}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Paper elevation={1} sx={{ p: 2, bgcolor: '#f5f9ff' }}>
                <Typography variant="subtitle2" color="textSecondary">Transactions</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ my: 1 }}>
                  {spendingInsights.transaction_count}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Avg: {formatCurrency(spendingInsights.average_transaction_amount)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Typography>No insight data available.</Typography>
        )}
      </Paper>
      
      {/* Monthly Spending */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Monthly Spending Trends
          </Typography>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="months-select-label">Months</InputLabel>
            <Select
              labelId="months-select-label"
              id="months-select"
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value))}
              label="Months"
            >
              <MenuItem value={3}>3</MenuItem>
              <MenuItem value={6}>6</MenuItem>
              <MenuItem value={12}>12</MenuItem>
              <MenuItem value={24}>24</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {loading.monthlySpending ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        ) : error.monthlySpending ? (
          <Typography color="error">Error: {error.monthlySpending}</Typography>
        ) : monthlySpending && monthlySpending.monthly_spending?.length > 0 ? (
          <Box sx={{ height: 400, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart
                data={monthlySpending.monthly_spending}
                margin={{ top: 10, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month_name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Spending']} />
                <Bar dataKey="total" fill="#0088FE" name="Total Spending" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Typography>No monthly spending data available.</Typography>
        )}
      </Paper>
      
      {/* Spending by Category */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Spending by Category
          </Typography>
          <Box display="flex" gap={2}>
            <TextField
              id="startDate"
              name="startDate"
              label="Start Date"
              type="date"
              value={dateRange.startDate}
              onChange={handleDateChange}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              id="endDate"
              name="endDate"
              label="End Date"
              type="date"
              value={dateRange.endDate}
              onChange={handleDateChange}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>
        
        {loading.spendingByCategory ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        ) : error.spendingByCategory ? (
          <Typography color="error">Error: {error.spendingByCategory}</Typography>
        ) : spendingByCategory && spendingByCategory.spending_by_category?.length > 0 ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 400, width: '100%' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={spendingByCategory.spending_by_category}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="total"
                      nameKey="category_name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {spendingByCategory.spending_by_category.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Spending']} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                <Box sx={{ minWidth: 650 }}>
                  <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                    <Box component="thead" sx={{ bgcolor: 'grey.100' }}>
                      <Box component="tr">
                        <Box component="th" sx={{ p: 2, textAlign: 'left' }}>Category</Box>
                        <Box component="th" sx={{ p: 2, textAlign: 'left' }}>Amount</Box>
                        <Box component="th" sx={{ p: 2, textAlign: 'left' }}>Percentage</Box>
                      </Box>
                    </Box>
                    <Box component="tbody">
                      {spendingByCategory.spending_by_category.map((category, index) => (
                        <Box component="tr" key={category.category_id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.50' } }}>
                          <Box component="td" sx={{ p: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box 
                                sx={{ 
                                  width: 12, 
                                  height: 12, 
                                  borderRadius: '50%', 
                                  mr: 1.5, 
                                  bgcolor: COLORS[index % COLORS.length] 
                                }} 
                              />
                              {category.category_name}
                            </Box>
                          </Box>
                          <Box component="td" sx={{ p: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
                            {formatCurrency(category.total)}
                          </Box>
                          <Box component="td" sx={{ p: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
                            {category.percentage.toFixed(1)}%
                          </Box>
                        </Box>
                      ))}
                    </Box>
                    <Box component="tfoot">
                      <Box component="tr" sx={{ fontWeight: 'bold', bgcolor: 'grey.100' }}>
                        <Box component="td" sx={{ p: 2 }}>Total</Box>
                        <Box component="td" sx={{ p: 2 }}>{formatCurrency(spendingByCategory.total_spending)}</Box>
                        <Box component="td" sx={{ p: 2 }}>100%</Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Typography>No category data available for the selected date range.</Typography>
        )}
      </Paper>
      
      {/* Transaction Trends */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h2">
            Transaction Trends
          </Typography>
          <Box display="flex" gap={2}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="interval-select-label">Interval</InputLabel>
              <Select
                labelId="interval-select-label"
                id="interval-select"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                label="Interval"
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="timeframe-select-label">Timeframe</InputLabel>
              <Select
                labelId="timeframe-select-label"
                id="timeframe-select"
                value={timeframe}
                onChange={(e) => setTimeframe(parseInt(e.target.value))}
                label="Timeframe"
              >
                <MenuItem value={7}>Last 7</MenuItem>
                <MenuItem value={12}>Last 12</MenuItem>
                <MenuItem value={30}>Last 30</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {loading.transactionTrends ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        ) : error.transactionTrends ? (
          <Typography color="error">Error: {error.transactionTrends}</Typography>
        ) : transactionTrends && transactionTrends.trend_data?.length > 0 ? (
          <Box sx={{ height: 400, width: '100%' }}>
            <ResponsiveContainer>
              <LineChart
                data={transactionTrends.trend_data}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="interval" />
                <YAxis yAxisId="left" tickFormatter={(value) => `${value}`} />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => value} />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="total_amount" 
                  stroke="#8884d8" 
                  name="Total Amount" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="transaction_count" 
                  stroke="#82ca9d" 
                  name="Transaction Count" 
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        ) : (
          <Typography>No transaction trend data available.</Typography>
        )}
      </Paper>
      
      {/* Budget Performance */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Budget Performance
        </Typography>
        
        {loading.budgetPerformance ? (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        ) : error.budgetPerformance ? (
          <Typography color="error">Error: {error.budgetPerformance}</Typography>
        ) : budgetPerformance && budgetPerformance.budget_performance?.length > 0 ? (
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 1000 }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead" sx={{ bgcolor: 'primary.light', color: 'white' }}>
                  <Box component="tr">
                    <Box component="th" sx={{ p: 2, textAlign: 'left' }}>Budget</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left' }}>Category</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left' }}>Time Period</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left' }}>Progress</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left' }}>Amount</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left' }}>Status</Box>
                    <Box component="th" sx={{ p: 2, textAlign: 'left' }}>Forecast</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {budgetPerformance.budget_performance.map((budget) => (
                    <Box component="tr" key={budget.budget_id} sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.50' } }}>
                      <Box component="td" sx={{ p: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
                        {budget.budget_name}
                      </Box>
                      <Box component="td" sx={{ p: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
                        {budget.category}
                      </Box>
                      <Box component="td" sx={{ p: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
                        <Typography variant="body2">
                          {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                        </Typography>
                        {budget.is_active && (
                          <Typography variant="caption" color="textSecondary">
                            {budget.days_remaining} days left
                          </Typography>
                        )}
                      </Box>
                      <Box component="td" sx={{ p: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
                        <Box sx={{ width: '100%', bgcolor: 'grey.300', borderRadius: 1, height: 8, position: 'relative' }}>
                          <Box 
                            sx={{ 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              height: '100%',
                              borderRadius: 1,
                              bgcolor: budget.percentage_used > 100 ? 'error.main' : 
                                     budget.percentage_used > 80 ? 'warning.main' : 'success.main',
                              width: `${Math.min(budget.percentage_used, 100)}%`
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          {budget.percentage_used.toFixed(1)}% used
                        </Typography>
                      </Box>
                      <Box component="td" sx={{ p: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
                        <Typography variant="body2">
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.budget_amount)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatCurrency(budget.remaining)} left
                        </Typography>
                      </Box>
                      <Box component="td" sx={{ p: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
                        <Box 
                          sx={{ 
                            display: 'inline-block',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 'medium',
                            bgcolor: budget.status === 'Over Budget' ? 'error.light' : 'success.light',
                            color: budget.status === 'Over Budget' ? 'error.dark' : 'success.dark'
                          }}
                        >
                          {budget.status}
                        </Box>
                      </Box>
                      <Box component="td" sx={{ p: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
                        {budget.is_active && (
                          <>
                            <Typography variant="body2">
                              Burn rate: {formatCurrency(budget.daily_burn_rate)}/day
                            </Typography>
                            <Typography variant="body2">
                              Forecast: {formatCurrency(budget.forecast_end_amount)}
                            </Typography>
                            <Box 
                              sx={{ 
                                display: 'inline-block',
                                mt: 0.5,
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: '0.75rem',
                                fontWeight: 'medium',
                                bgcolor: budget.forecast_status.includes('Over') ? 'error.light' : 'success.light',
                                color: budget.forecast_status.includes('Over') ? 'error.dark' : 'success.dark'
                              }}
                            >
                              {budget.forecast_status}
                            </Box>
                          </>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Typography>No budget data available.</Typography>
        )}
      </Paper>
    </Layout>
  );
};

export default ReportsPage;