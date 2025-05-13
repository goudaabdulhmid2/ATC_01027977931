// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import {
  login,
  register,
  logout,
  getCurrentUser,
} from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkLoggedIn = async () => {
      try {
        const userData = await getCurrentUser();
        setCurrentUser(userData);
      } catch (err) {
        console.error("Not authenticated", err);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      setError(null);
      const userData = await login(email, password);
      setCurrentUser(userData);
      return userData;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    }
  };

  const handleRegister = async (userData) => {
    try {
      setError(null);
      const newUser = await register(userData);
      setCurrentUser(newUser);
      return newUser;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
  };

  const isAdmin = () => {
    return currentUser?.role === "admin";
  };

  const value = {
    currentUser,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
