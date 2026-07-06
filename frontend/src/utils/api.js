// Centralized API URL configuration for the frontend.
//
// Usage across the app:
//   - import { API_URL } from "../utils/api";
//   - import { API_BASE } from "../utils/api";
//
// You can override this at build/runtime via:
//   VITE_API_URL
// Example: VITE_API_URL=http://localhost:4000

const fallbackApiUrl = "https://expenso-backend-52g9.onrender.com";

// Vite exposes environment vars prefixed with VITE_
const API_URL = import.meta.env.VITE_API_URL || fallbackApiUrl;

// Some parts of the app import API_BASE as the base.
// Keep it consistent.
const API_BASE = `${API_URL}/api`;

export { API_URL, API_BASE };