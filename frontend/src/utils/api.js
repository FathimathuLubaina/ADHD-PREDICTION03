import axios from 'axios';

// In dev: use /api (Vite proxies to backend). In prod: use env or localhost:5000
const baseURL =
  import.meta.env.DEV
    ? '/api'
    : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

export function api(token) {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  instance.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
}

