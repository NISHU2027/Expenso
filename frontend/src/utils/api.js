const DEFAULT_API_URL = "https://expenso-backend-8529.onrender.com";

export const API_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
).replace(/\/$/, "");

export const API_BASE = `${API_URL}/api`;
