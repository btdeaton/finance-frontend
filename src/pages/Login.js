import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { register as apiRegister } from '../api/auth';

const Login = ({ register: isRegister = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    let timeout;
    if (loading) {
      timeout = setTimeout(() => {
        setLoading(false);
        setError('Request timed out. The server might be unresponsive. Please try again.');
      }, 10000); // 10-second timeout
    }
    return () => clearTimeout(timeout);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      if (isRegister) {
        // Registration flow
        console.log('Attempting to register:', email);
        
        try {
          const registerResponse = await apiRegister(email, password);
          console.log('Register response:', registerResponse);
          
          setSuccess('Registration successful! You can now log in.');
          setLoading(false);
          // Navigate to login page after successful registration
          setTimeout(() => navigate('/login'), 2000);
          return;
        } catch (registerErr) {
          console.error('Registration error:', registerErr);
          if (registerErr.response?.status === 400 && 
              registerErr.response?.data?.detail === "Email already registered") {
            setError('This email is already registered. Please try logging in instead.');
          } else {
            setError('Registration failed: ' + (registerErr.response?.data?.detail || 'Unknown error'));
          }
          setLoading(false);
          return;
        }
      } else {
        // Login flow
        console.log('Attempting to login:', email);
        const success = await login(email, password);
        if (success) {
          navigate('/');
        } else {
          setError('Login failed. Please check your credentials.');
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      let errorMessage = 'An error occurred';
      
      if (err.response) {
        console.error('Server response:', err.response.data);
        errorMessage = err.response.data?.detail || 'Server error';
      } else if (err.request) {
        // Request was made but no response received
        console.error('No response received:', err.request);
        errorMessage = 'No response from server. Is the API running?';
      } else {
        // Something else caused the error
        console.error('Error message:', err.message);
        errorMessage = err.message || 'Unknown error';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          {isRegister ? 'Register' : 'Login'}
        </Typography>
        
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{success}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                {isRegister ? 'Registering...' : 'Logging in...'}
              </Box>
            ) : (
              isRegister ? 'Register' : 'Login'
            )}
          </Button>
          
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate(isRegister ? '/login' : '/register')}
            disabled={loading}
          >
            {isRegister ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;