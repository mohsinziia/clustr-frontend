import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1", // Proxy this in vite.config.ts to http://localhost:8000
  withCredentials: true,
});

export default api;
