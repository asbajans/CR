import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://crmapi.asb.web.tr';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crdent_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('crdent_token');
      localStorage.removeItem('crdent_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
