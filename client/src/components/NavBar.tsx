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
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface NavBarProps {
  mode: string;
  toggleMode: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ mode, toggleMode }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
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
            {t("common.events")}
          </Button>
          {user && (
            <Button component={RouterLink} to="/my-bookings" color="inherit">
              {t("common.bookings")}
            </Button>
          )}
          {user && (
            <Button component={RouterLink} to="/profile" color="inherit">
              {t("common.profile")}
            </Button>
          )}
          {user?.role === "admin" && (
            <Button component={RouterLink} to="/admin" color="inherit">
              {t("common.admin")}
            </Button>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button color="inherit" onClick={() => changeLanguage("en")}>
            EN
          </Button>
          <Button color="inherit" onClick={() => changeLanguage("ar")}>
            AR
          </Button>
          <IconButton color="inherit" onClick={toggleMode}>
            {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Typography
            variant="body2"
            sx={{ cursor: "pointer" }}
            onClick={toggleMode}
          >
            {mode === "dark" ? "Light Mode" : "Dark Mode"}
          </Typography>
          {!user ? (
            <>
              <Button
                component={RouterLink}
                to="/login"
                color="primary"
                variant="outlined"
              >
                {t("auth.signIn")}
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                color="primary"
                variant="contained"
              >
                {t("auth.signUp")}
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
                {t("common.logout")}
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
