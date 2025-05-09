import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import Layout from '../components/Layout/Layout';
import { getSpendingInsights } from '../api/reports';
import { 
  PieChart, Pie, Cell, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { getSpendingByCategory, getMonthlySpending } from '../api/reports';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // State for insights
  const [insights, setInsights] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BDB'];

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get spending insights
        const insightsResponse = await getSpendingInsights();
        setInsights(insightsResponse.data);
        
        // Get top spending categories for current month
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const formattedFirstDay = firstDay.toISOString().split('T')[0];
        const formattedToday = today.toISOString().split('T')[0];
        
        const categoryResponse = await getSpendingByCategory(formattedFirstDay, formattedToday);
        // Get top 5 categories
        if (categoryResponse.data.spending_by_category && categoryResponse.data.spending_by_category.length > 0) {
          const topCategories = categoryResponse.data.spending_by_category.slice(0, 5);
          setCategoryData(topCategories);
        }
        
        // Get monthly spending data
        const monthlyResponse = await getMonthlySpending(6);
        if (monthlyResponse.data.monthly_spending) {
          setMonthlyData(monthlyResponse.data.monthly_spending);
        }
        
        setError(null);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
        setError('Failed to load dashboard data. Please ensure the API is running.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <Paper sx={{ p: 3, bgcolor: '#fff4e5' }}>
          <Typography color="error">{error}</Typography>
          <Typography mt={2}>
            Make sure your FastAPI backend is running on http://localhost:8000 and CORS is properly configured.
          </Typography>
        </Paper>
      </Layout>
    );
  }

  // If we haven't fetched insights yet or the API isn't connected
  if (!insights) {
    return (
      <Layout title="Dashboard">
        <Typography>
          Dashboard data will appear here once connected to the API.
        </Typography>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <Grid container spacing={3}>
        {/* Monthly Spending */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              This Month's Spending
            </Typography>
            <Typography component="p" variant="h4">
              ${insights?.this_month_spending.toFixed(2)}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              {insights?.month_over_month_change > 0 ?
                `Up ${insights.month_over_month_change.toFixed(1)}%` :
                `Down ${Math.abs(insights.month_over_month_change).toFixed(1)}%`} from last month
            </Typography>
          </Paper>
        </Grid>
       
        {/* Biggest Expense */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Biggest Expense
            </Typography>
            <Typography component="p" variant="h4">
              {insights?.biggest_expense_category}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              ${insights?.biggest_expense_amount.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
       
        {/* Daily Average */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Daily Average
            </Typography>
            <Typography component="p" variant="h4">
              ${insights?.average_daily_spending.toFixed(2)}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              Based on {insights?.days_elapsed} days this month
            </Typography>
          </Paper>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 365 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Top Spending Categories
            </Typography>
            {categoryData.length > 0 ? (
              <Box sx={{ display: 'flex', height: '100%', mt: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="total"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {categoryData.map((category, index) => (
                    <Box key={category.category_id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          mr: 1, 
                          bgcolor: COLORS[index % COLORS.length] 
                        }} 
                      />
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {category.category_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatCurrency(category.total)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  No category data available
                </Typography>
              </Box>
            )}
            <Box sx={{ mt: 'auto', textAlign: 'center' }}>
              <Link 
                to="/reports" 
                style={{ color: '#1976d2', textDecoration: 'none', fontSize: '0.875rem' }}
              >
                View Full Reports →
              </Link>
            </Box>
          </Paper>
        </Grid>

        {/* Monthly Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 365 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Monthly Spending Trend
            </Typography>
            {monthlyData.length > 0 ? (
              <Box sx={{ flex: 1, height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month_name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Spending']} />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                      name="Monthly Spending"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  No monthly trend data available
                </Typography>
              </Box>
            )}
            <Box sx={{ mt: 'auto', textAlign: 'center' }}>
              <Link 
                to="/reports" 
                style={{ color: '#1976d2', textDecoration: 'none', fontSize: '0.875rem' }}
              >
                View Full Reports →
              </Link>
            </Box>
          </Paper>
        </Grid>

        {/* Transaction Stats */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Transaction Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle1">Total Transactions</Typography>
                <Typography variant="h4">{insights.transaction_count}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle1">Average Transaction</Typography>
                <Typography variant="h4">${insights.average_transaction_amount.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle1">Days in Month</Typography>
                <Typography variant="h4">{insights.days_in_month}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle1">Days Elapsed</Typography>
                <Typography variant="h4">{insights.days_elapsed}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Dashboard;