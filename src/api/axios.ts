import axios from 'axios';

// Use the institutional LAN IP for the backend gateway
export const API_BASE_URL = 'http://127.0.0.1:8080';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;