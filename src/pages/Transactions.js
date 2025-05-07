// src/pages/Transactions.js
import React, { useState, useEffect } from 'react';
import { 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, IconButton, Typography, Box, CircularProgress,
  Snackbar, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import Layout from '../components/Layout/Layout';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../api/transactions';
import { getCategories } from '../api/categories';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category_id: '',
    date: new Date()
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await getTransactions();
      setTransactions(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
      // We don't set error here as transactions are the primary data
    }
  };

  const handleOpen = (transaction = null) => {
    if (transaction) {
      // Edit mode - populate form with transaction data
      setSelectedTransaction(transaction);
      setFormData({
        amount: transaction.amount,
        description: transaction.description,
        category_id: transaction.category_id,
        date: new Date(transaction.date)
      });
    } else {
      // Create mode - reset form
      setSelectedTransaction(null);
      setFormData({
        amount: '',
        description: '',
        category_id: '',
        date: new Date()
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
      [name]: value
    }));
  };

  const handleDateChange = (newDate) => {
    setFormData(prevData => ({
      ...prevData,
      date: newDate
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedTransaction) {
        // Update existing transaction
        await updateTransaction(selectedTransaction.id, formData);
        setSnackbar({
          open: true,
          message: 'Transaction updated successfully',
          severity: 'success'
        });
      } else {
        // Create new transaction
        await createTransaction(formData);
        setSnackbar({
          open: true,
          message: 'Transaction created successfully',
          severity: 'success'
        });
      }
      handleClose();
      fetchTransactions(); // Refresh the list
    } catch (err) {
      console.error('Failed to save transaction', err);
      setSnackbar({
        open: true,
        message: 'Failed to save transaction. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTransaction(selectedTransaction.id);
      setDeleteDialogOpen(false);
      fetchTransactions(); // Refresh the list
      setSnackbar({
        open: true,
        message: 'Transaction deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to delete transaction', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete transaction. Please try again.',
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

  if (loading) {
    return (
      <Layout title="Transactions">
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Transactions">
        <Paper sx={{ p: 3, bgcolor: '#fff4e5' }}>
          <Typography color="error">{error}</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={fetchTransactions}
          >
            Try Again
          </Button>
        </Paper>
      </Layout>
    );
  }

  return (
    <Layout title="Transactions">
      <Box mb={3} display="flex" justifyContent="flex-end">
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Transaction
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography py={2}>No transactions found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{format(new Date(transaction.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{getCategoryName(transaction.category_id)}</TableCell>
                  <TableCell align="right">${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(transaction)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(transaction)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Transaction Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
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
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
            <FormControl fullWidth margin="normal">
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
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker 
                label="Date"
                value={formData.date}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedTransaction ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this transaction? This action cannot be undone.
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

export default Transactions;