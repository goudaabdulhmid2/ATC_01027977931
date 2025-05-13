// src/services/authService.js
import api from "./api";
import jwtDecode from "jwt-decode";

// Set token in localStorage and API headers
const setToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  }
};

// Initialize token from localStorage
const initToken = () => {
  const token = localStorage.getItem("token");
  if (token) {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      // Token expired
      localStorage.removeItem("token");
      return null;
    }

    // Valid token
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return token;
  }
  return null;
};

// Get current user data
export const getCurrentUser = async () => {
  const token = initToken();
  if (!token) return null;

  try {
    const response = await api.get("/users/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
};

// Login user
export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  setToken(response.data.token);
  return response.data.user;
};

// Register user
export const register = async (userData) => {
  const response = await api.post("/auth/signup", userData);
  setToken(response.data.token);
  return response.data.user;
};

// Logout user
export const logout = () => {
  setToken(null);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.exp > Date.now() / 1000;
  } catch (error) {
    return false;
  }
};

// Check if user is admin
export const isAdmin = async () => {
  try {
    const user = await getCurrentUser();
    return user?.role === "admin";
  } catch (error) {
    return false;
  }
};
