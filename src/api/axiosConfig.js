import axios from 'axios';

const API_BASE_URL = 'https://cpms-backend-production.up.railway.app';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export the instance as default
export default axiosInstance;

// Export authAPI as named export
export const authAPI = {
  register: (userData) => axiosInstance.post('/api/auth/register', userData),
  login: (credentials) => axiosInstance.post('/api/auth/login', credentials),
  logout: () => axiosInstance.post('/api/auth/logout'),
  getCurrentUser: () => axiosInstance.get('/api/auth/me'),
};