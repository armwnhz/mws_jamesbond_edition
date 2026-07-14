import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config;
      // برای درخواست‌های احراز هویت، ریدایرکت نکن
      if (
        originalRequest.url?.includes('/auth/me') ||
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/logout') ||
        originalRequest.url?.includes('/auth/register')
      ) {
        return Promise.reject(error);
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;