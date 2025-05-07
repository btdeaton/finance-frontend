import apiClient from './client';

export const getTransactions = (params = {}) => {
  return apiClient.get('/transactions/', { params });
};

export const getTransaction = (id) => {
  return apiClient.get(`/transactions/${id}`);
};

export const createTransaction = (data) => {
  return apiClient.post('/transactions/', data);
};

export const updateTransaction = (id, data) => {
  return apiClient.put(`/transactions/${id}`, data);
};

export const deleteTransaction = (id) => {
  return apiClient.delete(`/transactions/${id}`);
};