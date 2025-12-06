import axios from 'axios';

// Use relative URLs - Vite proxy forwards /api to backend
const API_BASE_URL = '';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies (same-origin)
});

// CSRF token management
let csrfToken: string | null = null;

// Fetch CSRF token on app initialization
export const initCSRF = async () => {
  try {
    const response = await api.get('/api/auth/csrf-token');
    csrfToken = response.data.csrf_token;
    return csrfToken;
  } catch (error) {
    // User not authenticated yet, will get CSRF on login/register
    console.log('CSRF token will be provided on login');
    return null;
  }
};

// Add CSRF token to state-changing requests
api.interceptors.request.use(
  (config) => {
    // Add CSRF token to state-changing requests (POST, PUT, DELETE, PATCH)
    if (config.method && ['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle CSRF token refresh on 403 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 && error.response?.data?.detail === 'CSRF token invalid') {
      // Refresh CSRF token and retry request
      await initCSRF();
      if (csrfToken && error.config) {
        error.config.headers['X-CSRF-Token'] = csrfToken;
        return api.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Register a new user
  register: async (email: string, password: string) => {
    const response = await api.post('/api/auth/register', { email, password });
    // Server sets httpOnly cookie and returns CSRF token
    if (response.data.csrf_token) {
      csrfToken = response.data.csrf_token;
    }
    return response.data;
  },

  // Login user
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    // Server sets httpOnly cookie and returns CSRF token
    if (response.data.csrf_token) {
      csrfToken = response.data.csrf_token;
    }
    return response.data;
  },

  // Get current user info
  me: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Logout - server-side session termination
  logout: async () => {
    try {
      await api.post('/api/auth/logout');
      // Server clears the httpOnly cookie
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  // Refresh access token
  refresh: async () => {
    const response = await api.post('/api/auth/refresh');
    // Server sets new httpOnly cookie
    return response.data;
  },
};

export default api;
