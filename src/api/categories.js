// src/api/categories.js
import apiClient from './client';

export const getCategories = () => {
  return apiClient.get('/categories/');
};

export const getCategory = (id) => {
  return apiClient.get(`/categories/${id}`);
};

export const createCategory = (data) => {
  return apiClient.post('/categories/', data);
};

export const updateCategory = (id, data) => {
  return apiClient.put(`/categories/${id}`, data);
};

export const deleteCategory = (id) => {
  return apiClient.delete(`/categories/${id}`);
};