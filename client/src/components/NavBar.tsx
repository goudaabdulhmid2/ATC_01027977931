import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { logout } from "../store/slices/authSlice";

const NavBar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/events"
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            Eventify
          </Typography>
          <Button component={RouterLink} to="/events" color="inherit">
            Events
          </Button>
          {user && (
            <Button component={RouterLink} to="/my-bookings" color="inherit">
              My Bookings
            </Button>
          )}
          {user && (
            <Button component={RouterLink} to="/profile" color="inherit">
              Profile
            </Button>
          )}
          {user?.role === "admin" && (
            <Button component={RouterLink} to="/admin" color="inherit">
              Admin Dashboard
            </Button>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {!user ? (
            <>
              <Button
                component={RouterLink}
                to="/login"
                color="primary"
                variant="outlined"
              >
                Log In
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                color="primary"
                variant="contained"
              >
                Sign Up
              </Button>
            </>
          ) : (
            <>
              <IconButton component={RouterLink} to="/profile" size="small">
                <Avatar src={user.imgUrl || user.profileImage}>
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </Avatar>
              </IconButton>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
