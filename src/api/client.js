import axios from 'axios';

const API_URL = 'http://localhost:8000'; 

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false,
  timeout: 10000
});

// Add request interceptor to include token in ALL requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Make sure token format is correct with 'Bearer ' prefix
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Using authorization token with request');
    } else {
      console.warn('No authorization token found for request');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    // Success response handling
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', error.response.status, error.response.data);
      
      // If unauthorized (401), you might want to handle token expiration
      if (error.response.status === 401) {
        console.warn('Unauthorized request - token might be expired');
        // Optionally clear token or redirect to login
        // localStorage.removeItem('token');
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Request Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;