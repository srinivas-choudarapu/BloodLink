import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for cookie handling
});

// Helper function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// We don't need to set cookies from frontend as they are set by the backend
// Keeping this function for backward compatibility but it should not be used for auth tokens
const setCookie = (name, value, days = 7) => {
  // Only use for non-auth related cookies
  // Auth cookies should be set by the backend only
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

// Helper function to delete cookie
const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Add auth token to requests if available (from localStorage or cookies)
api.interceptors.request.use((config) => {
  // Try to get token from localStorage first, then from cookies
  let token = localStorage.getItem('token');
  if (!token) {
    token = getCookie('token');
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response - cookies are already set by backend
api.interceptors.response.use(
  (response) => {
    // Backend already sets cookies, just return the response
    return response;
  },
  (error) => {
    // Handle 401 errors by clearing authentication
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      localStorage.removeItem('userData');
      deleteCookie('token');
      deleteCookie('userType');
      deleteCookie('userData');
    }
    return Promise.reject(error);
  }
);

// Export helper functions for use in components
export { getCookie, setCookie, deleteCookie };
export default api;
