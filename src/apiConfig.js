// Centralized API Configuration
const isProd = import.meta.env.PROD;

// In production (Vercel), we use the relative /api path
// In development, we use the local Express server on port 5001
export const API_URL = isProd ? '/api' : 'http://localhost:5001/api';

export default API_URL;
