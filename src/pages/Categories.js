// src/pages/Categories.js
import React, { useState, useEffect } from 'react';
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Typography, Box,
  CircularProgress, Snackbar, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Layout from '../components/Layout/Layout';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../api/categories';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCategories();
      setCategories(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch categories', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (category = null) => {
    if (category) {
      // Edit mode - populate form with category data
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description || ''
      });
    } else {
      // Create mode - reset form
      setSelectedCategory(null);
      setFormData({
        name: '',
        description: ''
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

  const handleSubmit = async () => {
    try {
      if (selectedCategory) {
        // Update existing category
        await updateCategory(selectedCategory.id, formData);
        setSnackbar({
          open: true,
          message: 'Category updated successfully',
          severity: 'success'
        });
      } else {
        // Create new category
        await createCategory(formData);
        setSnackbar({
          open: true,
          message: 'Category created successfully',
          severity: 'success'
        });
      }
      handleClose();
      fetchCategories(); // Refresh the list
    } catch (err) {
      console.error('Failed to save category', err);
      setSnackbar({
        open: true,
        message: 'Failed to save category. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCategory(selectedCategory.id);
      setDeleteDialogOpen(false);
      fetchCategories(); // Refresh the list
      setSnackbar({
        open: true,
        message: 'Category deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to delete category', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete category. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Layout title="Categories">
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Categories">
        <Paper sx={{ p: 3, bgcolor: '#fff4e5' }}>
          <Typography color="error">{error}</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={fetchCategories}
          >
            Try Again
          </Button>
        </Paper>
      </Layout>
    );
  }

  return (
    <Layout title="Categories">
      <Box mb={3} display="flex" justifyContent="flex-end">
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Category
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography py={2}>No categories found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpen(category)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(category)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Category Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCategory ? 'Edit Category' : 'Add Category'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the category "{selectedCategory?.name}"? This action cannot be undone.
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            Warning: Deleting this category may affect transactions that use it.
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

export default Categories;