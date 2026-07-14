// frontend/src/api/axios.js

import axios from 'axios';

// تعیین آدرس پایه API
// در محیط تولید (Render) از متغیر محیطی VITE_API_URL استفاده می‌شود
// در محیط توسعه (localhost) از پروکسی Vite استفاده می‌شود
const baseURL = import.meta.env.VITE_API_URL || '/api';

// ایجاد نمونه Axios
const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,          // ✅ ارسال کوکی‌ها در تمام درخواست‌ها
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,                 // ۳۰ ثانیه تایم‌اوت
});

// ================================================================
//  Interceptor برای مدیریت خطاها و توکن
// ================================================================

// Interceptor برای درخواست‌ها (قبل از ارسال)
api.interceptors.request.use(
  (config) => {
    // می‌توانید هدرهای اضافی در اینجا اضافه کنید
    // مثلاً اگر از توکن در هدر استفاده می‌کنید (به‌جای کوکی)
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor برای پاسخ‌ها (بعد از دریافت)
api.interceptors.response.use(
  (response) => {
    // اگر پاسخ موفق بود، آن را برگردان
    return response;
  },
  (error) => {
    // اگر خطای ۴۰۱ (Unauthorized) رخ داد
    if (error.response?.status === 401) {
      const originalRequest = error.config;

      // اگر درخواست مربوط به احراز هویت است، ریدایرکت نکن
      if (
        originalRequest.url?.includes('/auth/me') ||
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/logout') ||
        originalRequest.url?.includes('/auth/register')
      ) {
        return Promise.reject(error);
      }

      // برای سایر درخواست‌ها، کاربر را به صفحه لاگین ببر
      // بررسی می‌کنیم که آیا قبلاً به لاگین ریدایرکت نشده است
      if (!window.location.pathname.includes('/login')) {
        console.warn('🔄 احراز هویت ناموفق، هدایت به صفحه لاگین');
        // کوکی را پاک کن
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/login';
      }
    }

    // اگر خطای ۴۲۲ (Validation Error) بود، پیام مناسب نمایش بده
    if (error.response?.status === 422) {
      console.error('❌ خطای اعتبارسنجی:', error.response.data);
    }

    // اگر خطای ۵۰۰ (Server Error) بود
    if (error.response?.status >= 500) {
      console.error('❌ خطای سرور:', error.response.data);
    }

    // اگر خطای شبکه (مثلاً قطع ارتباط)
    if (error.code === 'ERR_NETWORK') {
      console.error('❌ خطای شبکه: اتصال به سرور برقرار نشد');
    }

    return Promise.reject(error);
  }
);

// ================================================================
//  توابع کمکی برای احراز هویت (اختیاری)
// ================================================================

// تابع برای بررسی وضعیت احراز هویت
export const checkAuth = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    return null;
  }
};

// تابع برای خروج از حساب
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('خطا در خروج:', error);
  } finally {
    // پاک کردن کوکی در فرانت‌اند
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/login';
  }
};

// ================================================================
//  خروجی پیش‌فرض
// ================================================================

export default api;