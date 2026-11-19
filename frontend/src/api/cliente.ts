import axios from "axios";

// Instancia única de Axios para toda la app
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.trim() || "https://api-ligamx-puw6.onrender.com",
  timeout: 60_000,
});
