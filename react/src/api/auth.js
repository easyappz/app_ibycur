import { instance } from './axios';

/**
 * Register a new user
 * @param {string} username - Username for registration
 * @param {string} password - Password for registration
 * @returns {Promise} Response with token
 */
export const register = async (username, password) => {
  const response = await instance.post('/api/auth/register', {
    username,
    password,
  });
  return response.data;
};

/**
 * Login user
 * @param {string} username - Username for login
 * @param {string} password - Password for login
 * @returns {Promise} Response with token
 */
export const login = async (username, password) => {
  const response = await instance.post('/api/auth/login', {
    username,
    password,
  });
  return response.data;
};

/**
 * Get current authenticated user
 * @returns {Promise} Response with user information
 */
export const getMe = async () => {
  const response = await instance.get('/api/auth/me');
  return response.data;
};
