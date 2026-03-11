/**
 * Centralized API configuration for the Crayonz Admin Panel.
 * Changing the URL here will update it across the entire application.
 */

// Use your ngrok URL or localhost depending on your environment
const BASE_URL = "https://vix-backend.vercel.app";

export const API_CONFIG = {
  BASE_URL,
  API_BASE: `${BASE_URL}/api`,
  ENDPOINTS: {
    EMPLOYEES: "/employee",
    ATTENDANCE: "/attendance",
    ADMIN: "/admin",
  },
};

export default API_CONFIG;
