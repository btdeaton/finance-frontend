import apiClient from './client';

export const getBudgets = () => {
  return apiClient.get('/budgets/');
};

export const getBudget = (id) => {
  return apiClient.get(`/budgets/${id}`);
};

export const getBudgetStatus = () => {
  return apiClient.get('/budgets/status');
};

export const createBudget = (data) => {
  return apiClient.post('/budgets/', data);
};

export const updateBudget = (id, data) => {
  return apiClient.put(`/budgets/${id}`, data);
};

export const deleteBudget = (id) => {
  return apiClient.delete(`/budgets/${id}`);
};