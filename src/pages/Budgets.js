import React, { useState, useEffect } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, IconButton, Typography, Box, CircularProgress,
  Snackbar, Alert, LinearProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addMonths } from 'date-fns';
import Layout from '../components/Layout/Layout';
import { getBudgets, getBudgetStatus, createBudget, updateBudget, deleteBudget } from '../api/budgets';
import { getCategories } from '../api/categories';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    name: '',
    start_date: new Date(),
    end_date: addMonths(new Date(), 1)
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      
      // Get budget status (active budgets with spending data)
      const statusResponse = await getBudgetStatus();
      console.log('Budget status response:', statusResponse.data);
      setBudgetStatus(statusResponse.data || []); // API returns list directly
      
      // Also get regular budgets for editing/deleting
      const budgetsResponse = await getBudgets();
      console.log('Budgets response:', budgetsResponse.data);
      setBudgets(budgetsResponse.data || []);
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch budgets', err);
      setBudgetStatus([]);
      setBudgets([]);
      setError('Failed to load budgets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
      
      // If we have categories and no selected category in form, default to first category
      if (response.data.length > 0 && !formData.category_id) {
        setFormData(prevData => ({
          ...prevData,
          category_id: response.data[0].id
        }));
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const handleOpen = (budget = null) => {
    if (budget) {
      // Edit mode - populate form with budget data
      setSelectedBudget(budget);
      setFormData({
        amount: budget.amount,
        category_id: budget.category_id,
        name: budget.name || '',
        start_date: new Date(budget.start_date),
        end_date: new Date(budget.end_date)
      });
    } else {
      // Create mode - reset form
      setSelectedBudget(null);
      setFormData({
        amount: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        name: '',
        start_date: new Date(),
        end_date: addMonths(new Date(), 1)
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: name === 'category_id' || name === 'amount' ? Number(value) : value
    }));
  };

    const handleDateChange = (name, newDate) => {
      setFormData(prevData => ({
        ...prevData,
        [name]: newDate
      }));
    };

    const handleSubmit = async () => {
    // Basic validation
    if (!formData.amount || !formData.category_id) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    try {
      // Prepare data for API - convert types and format date properly
      const dataToSend = {
        amount: Number(formData.amount),
        category_id: Number(formData.category_id),
        name: formData.name || null, // Handle empty string case
        start_date: formData.start_date ? formData.start_date.toISOString().split('T')[0] : null, // Format as YYYY-MM-DD
        end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : null // Format as YYYY-MM-DD
      };

      console.log('Sending budget data:', dataToSend);

      if (selectedBudget) {
        // Update existing budget
        await updateBudget(selectedBudget.id, dataToSend);
        setSnackbar({
          open: true,
          message: 'Budget updated successfully',
          severity: 'success'
        });
      } else {
        // Create new budget
        try {
          const response = await createBudget(dataToSend);
          console.log('Budget creation response:', response.data);
          setSnackbar({
            open: true,
            message: 'Budget created successfully',
            severity: 'success'
          });
        } catch (error) {
          console.error('Detailed error:', error.response?.data);
          throw error;
        }
      }
      handleClose();
      fetchBudgets(); // Refresh the list
    } catch (err) {
      console.error('Failed to save budget', err);
      console.error('Validation errors:', err.response?.data?.errors);
      setSnackbar({
        open: true,
        message: `Failed to save budget: ${err.response?.data?.detail || err.message}`,
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (budget) => {
    setSelectedBudget(budget);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteBudget(selectedBudget.id);
      setDeleteDialogOpen(false);
      fetchBudgets(); // Refresh the list
      setSnackbar({
        open: true,
        message: 'Budget deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to delete budget', err);
      setSnackbar({
        open: true,
        message: `Failed to delete budget: ${err.response?.data?.detail || err.message}`,
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'On Track': return 'success.main';
      case 'Projected Over Budget': return 'warning.main';
      case 'Over Budget': return 'error.main';
      default: return 'info.main';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage <= 70) return 'success';
    if (percentage <= 90) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Layout title="Budgets">
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Budgets">
        <Paper sx={{ p: 3, bgcolor: '#fff4e5' }}>
          <Typography color="error">{error}</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={fetchBudgets}
          >
            Try Again
          </Button>
        </Paper>
      </Layout>
    );
  }

  return (
    <Layout title="Budgets">
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          {budgetStatus && budgetStatus.length > 0 && (
            <Button 
              onClick={fetchBudgets}
              startIcon={<RefreshIcon />}
              variant="outlined"
            >
              Refresh
            </Button>
          )}
        </Box>
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Budget
        </Button>
      </Box>

      {!budgetStatus || budgetStatus.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>No budgets found</Typography>
          <Typography color="text.secondary" mb={3}>
            Create budgets to track your spending by category
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpen()}
          >
            Create Your First Budget
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Budget Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Spent</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgetStatus.map((budget) => {
                // Calculate status based on spending percentages
                let status = "On Track";
                if (budget.percentage_used > 100) {
                  status = "Over Budget";
                } else if (budget.percentage_used > 90) {
                  status = "Projected Over Budget";
                }
                
                return (
                  <TableRow key={budget.id}>
                    <TableCell>{budget.name || `Budget for ${budget.category.name}`}</TableCell>
                    <TableCell>{budget.category.name}</TableCell>
                    <TableCell>
                      {format(new Date(budget.start_date), 'MMM d')} - {format(new Date(budget.end_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>${budget.amount.toFixed(2)}</TableCell>
                    <TableCell>${budget.spent.toFixed(2)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min(budget.percentage_used, 100)} 
                            color={getProgressColor(budget.percentage_used)}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(budget.percentage_used)}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography color={getStatusColor(status)}>
                        {status}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        onClick={() => handleOpen(budgets.find(b => b.id === budget.id))}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteClick(budgets.find(b => b.id === budget.id))}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Budget Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedBudget ? 'Edit Budget' : 'Add Budget'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              label="Budget Name (Optional)"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Monthly Groceries"
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              inputProps={{ step: "0.01", min: "0" }}
              value={formData.amount}
              onChange={handleChange}
              error={formData.amount === ''}
              helperText={formData.amount === '' ? 'Amount is required' : ''}
            />
            
            <FormControl fullWidth margin="normal" error={!formData.category_id}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {!formData.category_id && (
                <Typography variant="caption" color="error">
                  Category is required
                </Typography>
              )}
            </FormControl>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker 
                label="Start Date"
                value={formData.start_date}
                onChange={(newDate) => handleDateChange('start_date', newDate)}
                slotProps={{ 
                  textField: { 
                    fullWidth: true, 
                    margin: 'normal' 
                  } 
                }}
              />
              
              <DatePicker 
                label="End Date"
                value={formData.end_date}
                onChange={(newDate) => handleDateChange('end_date', newDate)}
                slotProps={{ 
                  textField: { 
                    fullWidth: true, 
                    margin: 'normal' 
                  } 
                }}
                minDate={formData.start_date}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.amount || !formData.category_id}
          >
            {selectedBudget ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this budget? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Budgets;