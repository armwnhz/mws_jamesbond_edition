import axios from 'axios';

// در محیط تولید از آدرس کامل بک‌اند استفاده کن
// در محیط توسعه (localhost) از پروکسی Vite استفاده کن
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor برای مدیریت خطاهای 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const originalRequest = error.config;
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