import axios from 'axios';

// ── Axios singleton ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor: attach JWT from localStorage ─────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('esg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('esg_token');
      localStorage.removeItem('esg_user');
      // window.location.href = '/login'; // bypassed
    }
    return Promise.reject(error);
  }
);

export default api;
