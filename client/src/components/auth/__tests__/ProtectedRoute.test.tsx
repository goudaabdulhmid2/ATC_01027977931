import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ReactNode } from "react";
import ProtectedRoute from "../ProtectedRoute";
import authReducer from "../../../store/slices/authSlice";

// Mock child component
const MockChild = () => <div data-testid="mock-child">Mock Child</div>;

// Mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

interface TestWrapperProps {
  children: ReactNode;
  initialState?: Record<string, unknown>;
}

// Test wrapper component
const TestWrapper = ({ children, initialState = {} }: TestWrapperProps) => {
  const store = createMockStore(initialState);
  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={children} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe("ProtectedRoute", () => {
  it("should render children when authenticated", () => {
    const store = createMockStore({
      user: {
        _id: "1",
        name: "Test User",
        email: "test@example.com",
        role: "user",
      },
      token: "valid-token",
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ProtectedRoute>
            <MockChild />
          </ProtectedRoute>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByTestId("mock-child")).toBeInTheDocument();
  });

  it("should redirect to login when not authenticated", () => {
    render(
      <TestWrapper>
        <ProtectedRoute>
          <MockChild />
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.queryByTestId("mock-child")).not.toBeInTheDocument();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("should show loading spinner when checking authentication", () => {
    render(
      <TestWrapper initialState={{ loading: true }}>
        <ProtectedRoute>
          <MockChild />
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should redirect to home when user role is not allowed", () => {
    const store = createMockStore({
      user: {
        _id: "1",
        name: "Test User",
        email: "test@example.com",
        role: "user",
      },
      token: "valid-token",
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ProtectedRoute allowedRoles={["admin"]}>
            <MockChild />
          </ProtectedRoute>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.queryByTestId("mock-child")).not.toBeInTheDocument();
  });
});
