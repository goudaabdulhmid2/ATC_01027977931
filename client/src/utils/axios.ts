import axios from "axios";
import { store } from "../store";
import { setLoading } from "../store/slices/loaderSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_BACKEND_URL + "/api/v1", // Using environment variable for backend URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Show loader for non-GET requests or if explicitly requested
    if (config.method !== "get" || config.headers.showLoader) {
      store.dispatch(setLoading({ loading: true }));
    }
    return config;
  },
  (error) => {
    store.dispatch(setLoading({ loading: false }));
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Hide loader after response
    store.dispatch(setLoading({ loading: false }));
    return response;
  },
  (error) => {
    // Hide loader on error
    store.dispatch(setLoading({ loading: false }));

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
