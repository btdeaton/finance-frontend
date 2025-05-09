import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Box, Paper } from '@mui/material';
import Layout from '../components/Layout/Layout';
import axios from 'axios';

const SimpleTransaction = () => {
  const [amount, setAmount] = useState('10.99');
  const [description, setDescription] = useState('Test transaction');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState('');

  useEffect(() => {
    // Fetch categories
    const token = localStorage.getItem('token');
    axios.get('http://localhost:8000/categories/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      setCategories(response.data);
      if (response.data.length > 0) {
        setCategoryId(response.data[0].id.toString());
      }
    })
    .catch(err => console.error('Failed to load categories', err));
  }, []);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const data = {
        amount: Number(amount),
        description,
        category_id: Number(categoryId),
        date: new Date().toISOString()
      };
      
      console.log('Sending data:', data);
      
      const response = await axios.post('http://localhost:8000/transactions/', data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      setResult(`Success! Transaction ID: ${response.data.id}`);
      console.log('Response:', response.data);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      console.error('Full error:', error);
    }
  };

  return (
    <Layout title="Simple Transaction Test">
      <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Create a Basic Transaction
        </Typography>
        
        <TextField
          label="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
          margin="normal"
        />
        
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          margin="normal"
        />
        
        <TextField
          select
          label="Category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          fullWidth
          margin="normal"
          SelectProps={{
            native: true,
          }}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </TextField>
        
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          fullWidth
          sx={{ mt: 2 }}
        >
          Create Transaction
        </Button>
        
        {result && (
          <Box mt={2} p={2} bgcolor={result.includes('Error') ? '#ffebee' : '#e8f5e9'}>
            <Typography>{result}</Typography>
          </Box>
        )}
      </Paper>
    </Layout>
  );
};

export default SimpleTransaction;