import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import Layout from '../components/Layout/Layout';
import { getSpendingInsights } from '../api/reports';

const Dashboard = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await getSpendingInsights();
        setInsights(response.data);
      } catch (error) {
        console.error('Failed to fetch insights', error);
        setError('Failed to load dashboard data. Please ensure the API is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
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
      </Grid>
    </Layout>
  );
};

export default Dashboard;