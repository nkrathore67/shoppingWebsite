import axios from "axios";
import { getSession } from "next-auth/react";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the Bearer token from the NextAuth session before every request
api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const session = await getSession();
    const token = (session?.user as { accessToken?: string })?.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
