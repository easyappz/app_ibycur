import { instance } from './axios';

/**
 * Get all messages
 * @returns {Promise} Response with messages array
 */
export const getMessages = async () => {
  const response = await instance.get('/api/messages');
  return response.data;
};

/**
 * Send a new message
 * @param {string} text - Message text content
 * @returns {Promise} Response with created message
 */
export const sendMessage = async (text) => {
  const response = await instance.post('/api/messages', {
    text,
  });
  return response.data;
};
