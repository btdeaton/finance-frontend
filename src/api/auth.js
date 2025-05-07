// src/api/auth.js
import apiClient from './client';

export const login = async (email, password) => {
  try {
    // For FastAPI's OAuth2 you need to use x-www-form-urlencoded format
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await apiClient.post('/token', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    console.log('Login response:', response.data);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (email, password) => {
  try {
    const response = await apiClient.post('/users/', { email, password });
    console.log('Register response:', response.data);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return apiClient.get('/users/me');
};