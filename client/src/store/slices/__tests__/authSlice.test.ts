import { describe, it, expect, vi, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import authReducer, {
  login,
  register,
  getCurrentUser,
  logout,
} from "../authSlice";
import axios from "axios";
import { RootState } from "../../index";

// Mock axios
vi.mock("axios");
const mockedAxios = axios as unknown as {
  post: vi.Mock;
  get: vi.Mock;
};

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock as Storage;

describe("Auth Slice", () => {
  let store: ReturnType<typeof configureStore<{ auth: RootState["auth"] }>>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    vi.clearAllMocks();
  });

  describe("login", () => {
    const credentials = {
      email: "test@example.com",
      password: "password123",
    };

    const mockResponse = {
      data: {
        token: "mock-token",
        data: {
          user: {
            _id: "1",
            name: "Test User",
            email: "test@example.com",
            role: "user",
          },
        },
      },
    };

    it("should handle successful login", async () => {
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await store.dispatch(login(credentials) as any);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/v1/auth/login",
        credentials
      );
      expect(localStorage.setItem).toHaveBeenCalledWith("token", "mock-token");
      expect(store.getState().auth.token).toBe("mock-token");
      expect(store.getState().auth.user).toEqual(mockResponse.data.data.user);
    });

    it("should handle login failure", async () => {
      const errorMessage = "Invalid credentials";
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(login(credentials) as any);

      expect(store.getState().auth.error).toBe(errorMessage);
      expect(store.getState().auth.token).toBeNull();
    });
  });

  describe("register", () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    };

    const mockResponse = {
      data: {
        token: "mock-token",
        data: {
          user: {
            _id: "1",
            name: "Test User",
            email: "test@example.com",
            role: "user",
          },
        },
      },
    };

    it("should handle successful registration", async () => {
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await store.dispatch(register(userData) as any);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/v1/auth/register",
        userData
      );
      expect(localStorage.setItem).toHaveBeenCalledWith("token", "mock-token");
      expect(store.getState().auth.token).toBe("mock-token");
      expect(store.getState().auth.user).toEqual(mockResponse.data.data.user);
    });

    it("should handle registration failure", async () => {
      const errorMessage = "Email already exists";
      mockedAxios.post.mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(register(userData) as any);

      expect(store.getState().auth.error).toBe(errorMessage);
      expect(store.getState().auth.token).toBeNull();
    });
  });

  describe("getCurrentUser", () => {
    const mockUser = {
      _id: "1",
      name: "Test User",
      email: "test@example.com",
      role: "user",
    };

    it("should fetch current user successfully", async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockUser },
      });

      await store.dispatch(getCurrentUser() as any);

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/v1/auth/me");
      expect(store.getState().auth.user).toEqual(mockUser);
    });

    it("should handle getCurrentUser failure", async () => {
      const errorMessage = "Unauthorized";
      mockedAxios.get.mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });

      await store.dispatch(getCurrentUser() as any);

      expect(store.getState().auth.error).toBe(errorMessage);
      expect(store.getState().auth.user).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith("token");
    });
  });

  describe("logout", () => {
    it("should clear auth state and remove token", () => {
      store.dispatch(logout());

      expect(store.getState().auth.user).toBeNull();
      expect(store.getState().auth.token).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith("token");
    });
  });
});
