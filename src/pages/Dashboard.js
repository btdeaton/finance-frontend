import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Divider,
  Chip,
  LinearProgress,
  Button,
  CircularProgress,
  IconButton
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  AttachMoney, 
  CalendarToday, 
  Receipt,
  ArrowForward
} from '@mui/icons-material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { getSpendingInsights, getSpendingByCategory, getMonthlySpending } from '../api/reports';

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
    <Layout title="Financial Dashboard">
      <Box mb={3}>
        <Typography variant="subtitle1" color="text.secondary">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Monthly Spending Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 2, height: '100%', overflow: 'hidden', position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '5px', height: '100%', bgcolor: 'primary.main' }} />
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    This Month's Spending
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="text.primary">
                    {formatCurrency(insights.this_month_spending)}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'primary.light', p: 1, borderRadius: 2, display: 'flex' }}>
                  <AttachMoney fontSize="large" sx={{ color: 'primary.main' }} />
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center" mt={2}>
                {insights.month_over_month_change > 0 ? (
                  <>
                    <TrendingUp color="error" fontSize="small" />
                    <Typography variant="body2" color="error.main" ml={1}>
                      Up {insights.month_over_month_change.toFixed(1)}% from last month
                    </Typography>
                  </>
                ) : insights.month_over_month_change < 0 ? (
                  <>
                    <TrendingDown color="success" fontSize="small" />
                    <Typography variant="body2" color="success.main" ml={1}>
                      Down {Math.abs(insights.month_over_month_change).toFixed(1)}% from last month
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary" ml={1}>
                      No change from last month
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Biggest Expense Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 2, height: '100%', overflow: 'hidden', position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '5px', height: '100%', bgcolor: 'warning.main' }} />
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Biggest Expense
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="text.primary">
                    {insights.biggest_expense_category}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'warning.light', p: 1, borderRadius: 2, display: 'flex' }}>
                  <PieChartIcon fontSize="large" sx={{ color: 'warning.main' }} />
                </Box>
              </Box>
              
              <Typography variant="h6" mt={2} color="text.secondary">
                {formatCurrency(insights.biggest_expense_amount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Daily Average Card */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 2, height: '100%', overflow: 'hidden', position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '5px', height: '100%', bgcolor: 'info.main' }} />
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Daily Average
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="text.primary">
                    {formatCurrency(insights.average_daily_spending)}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'info.light', p: 1, borderRadius: 2, display: 'flex' }}>
                  <CalendarToday fontSize="large" sx={{ color: 'info.main' }} />
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary" mt={2} mb={1}>
                Based on {insights.days_elapsed} of {insights.days_in_month} days this month
              </Typography>
              
              <LinearProgress 
                variant="determinate" 
                value={(insights.days_elapsed / insights.days_in_month) * 100}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Category Breakdown Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <PieChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">
                  Top Spending Categories
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {categoryData.length > 0 ? (
                <Box sx={{ display: 'flex', height: '100%', flexGrow: 1 }}>
                  <Box sx={{ width: '50%' }}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="total"
                          stroke="#fff"
                          strokeWidth={2}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box sx={{ width: '50%', pl: 3 }}>
                    {categoryData.map((category, index) => (
                      <Box key={category.category_id} sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center" mb={0.5}>
                          <Box 
                            sx={{ 
                              width: 14, 
                              height: 14, 
                              borderRadius: '50%', 
                              mr: 1, 
                              bgcolor: COLORS[index % COLORS.length] 
                            }} 
                          />
                          <Typography variant="body1" fontWeight="medium">
                            {category.category_name}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" pl={3}>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(category.total)}
                          </Typography>
                          <Chip 
                            label={`${category.percentage.toFixed(0)}%`} 
                            size="small" 
                            sx={{ 
                              bgcolor: `${COLORS[index % COLORS.length]}22`, 
                              color: COLORS[index % COLORS.length],
                              fontWeight: 'bold'
                            }} 
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                  <Typography variant="body1" color="text.secondary">
                    No category data available
                  </Typography>
                </Box>
              )}
            </CardContent>
            <Divider />
            <Box p={2} display="flex" justifyContent="flex-end">
              <Button 
                component={Link} 
                to="/reports" 
                endIcon={<ArrowForward />}
                color="primary"
              >
                View Full Reports
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Monthly Trend Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flexGrow: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">
                  Monthly Spending Trend
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={monthlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month_name" 
                      tick={{ fill: '#666', fontSize: 12 }}
                      axisLine={{ stroke: '#ccc' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`} 
                      tick={{ fill: '#666', fontSize: 12 }}
                      axisLine={{ stroke: '#ccc' }}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value), 'Spending']}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: 8,
                        border: '1px solid #eee',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#2196f3" 
                      strokeWidth={3}
                      dot={{ r: 6, strokeWidth: 2, fill: '#fff', stroke: '#2196f3' }}
                      activeDot={{ r: 8, strokeWidth: 0, fill: '#2196f3' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 250 }}>
                  <Typography variant="body1" color="text.secondary">
                    No monthly trend data available
                  </Typography>
                </Box>
              )}
            </CardContent>
            <Divider />
            <Box p={2} display="flex" justifyContent="flex-end">
              <Button 
                component={Link} 
                to="/reports" 
                endIcon={<ArrowForward />}
                color="primary"
              >
                View Full Reports
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Transaction Summary Card */}
        <Grid item xs={12}>
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Receipt color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="medium">
                  Transaction Summary
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <Box bgcolor="grey.50" p={2.5} borderRadius={2} textAlign="center" height="100%">
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Total Transactions
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="text.primary">
                      {insights.transaction_count}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box bgcolor="grey.50" p={2.5} borderRadius={2} textAlign="center" height="100%">
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Average Transaction
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="text.primary">
                      {formatCurrency(insights.average_transaction_amount)}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box bgcolor="grey.50" p={2.5} borderRadius={2} textAlign="center" height="100%">
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Days in Month
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="text.primary">
                      {insights.days_in_month}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Box bgcolor="grey.50" p={2.5} borderRadius={2} height="100%">
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom textAlign="center">
                      Days Elapsed
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color="text.primary" textAlign="center">
                      {insights.days_elapsed}
                    </Typography>
                    <Box mt={1.5} width="100%" display="flex" alignItems="center">
                      <LinearProgress 
                        variant="determinate" 
                        value={(insights.days_elapsed / insights.days_in_month) * 100}
                        sx={{ height: 10, borderRadius: 5, flexGrow: 1, mr: 1.5 }}
                      />
                      <Typography variant="body2" color="text.secondary" fontWeight="medium">
                        {Math.round((insights.days_elapsed / insights.days_in_month) * 100)}%
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              
              <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to="/transactions"
                  endIcon={<ArrowForward />}
                >
                  View All Transactions
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Dashboard;