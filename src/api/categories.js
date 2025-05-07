import apiClient from './client';

export const getCategories = () => {
  return apiClient.get('/categories/');
};

export const getCategory = (id) => {
  return apiClient.get(`/categories/${id}`);
};