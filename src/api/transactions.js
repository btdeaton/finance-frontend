import apiClient from './client';

export const getTransactions = (params = {}) => {
  return apiClient.get('/transactions/', { params });
};

export const getTransaction = (id) => {
  return apiClient.get(`/transactions/${id}`);
};

export const createTransaction = (data) => {
  console.log('Sending transaction data:', JSON.stringify(data, null, 2));
  return apiClient.post('/transactions/', data)
    .then(response => {
      console.log('Transaction created successfully:', response.data);
      return response;
    })
    .catch(error => {
      console.error('Error details:', error.response?.data || 'No response data');
      console.error('Request that caused error:', {
        url: '/transactions/',
        method: 'POST',
        data: data,
        headers: apiClient.defaults.headers
      });
      console.error('Full error object:', error);
      throw error;
    });
};

export const updateTransaction = (id, data) => {
  return apiClient.put(`/transactions/${id}`, data);
};

export const deleteTransaction = (id) => {
  return apiClient.delete(`/transactions/${id}`);
};

