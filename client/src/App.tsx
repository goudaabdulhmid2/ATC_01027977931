import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "./store/slices/authSlice";
import { AppDispatch } from "./store";

// Layout
import Layout from "./components/layout/Layout";
import GlobalLoader from "./components/GlobalLoader";

// Pages
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import NotFound from "./pages/NotFound";
import EventList from "./pages/events/EventList";
import EventDetail from "./pages/events/EventDetail";
import EventBooking from "./pages/events/EventBooking";
import MyBookings from "./pages/bookings/MyBookings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBookings from "./pages/admin/AdminBookings";
import UserProfile from "./pages/profile/UserProfile";

// Theme
import theme from "./theme";

// Protected Route
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NavBar from "./components/NavBar";

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [hasCheckedUser, setHasCheckedUser] = useState(false);

  useEffect(() => {
    if (!hasCheckedUser) {
      setHasCheckedUser(true);
      dispatch(getCurrentUser());
    }
  }, [dispatch, hasCheckedUser]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalLoader />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <NavBar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Public Event Routes */}
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetail />} />

          {/* Protected Routes with Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* User Routes */}
            <Route path="/" element={<Navigate to="/events" replace />} />
            <Route path="/events/:id/book" element={<EventBooking />} />
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="profile" element={<UserProfile />} />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Routes>
                    <Route path="" element={<AdminDashboard />} />
                    <Route path="events" element={<AdminEvents />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="bookings" element={<AdminBookings />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Organizer Routes */}
            <Route
              path="/organizer/*"
              element={
                <ProtectedRoute allowedRoles={["organizer"]}>
                  {/* Add organizer routes here */}
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ThemeProvider>
  );
};

export default App;
