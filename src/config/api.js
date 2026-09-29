// Centralized API configuration for RepoGraph Frontend
// Uses VITE_API_BASE_URL if configured, otherwise falls back to the live Render deployment
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://repograph-backend-n6dl.onrender.com'
).replace(/\/$/, '');
