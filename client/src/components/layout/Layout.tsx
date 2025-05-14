import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, NavLink, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Event as EventIcon,
  BookOnline as BookOnlineIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { logout, getCurrentUser } from "../../store/slices/authSlice";
import { RootState } from "../../store";
import NotificationBell from "../notifications/NotificationBell";

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarUser {
  name?: string;
  role?: string;
  profileImage?: string;
}

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const [hasCheckedUser, setHasCheckedUser] = useState(false);

  useEffect(() => {
    if (!user && !hasCheckedUser) {
      setHasCheckedUser(true);
      dispatch(getCurrentUser());
    }
  }, [dispatch, user, hasCheckedUser]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const menuItems: MenuItem[] = [
    { text: "Home", icon: <HomeIcon />, path: "/" },
    { text: "Events", icon: <EventIcon />, path: "/events" },
    { text: "My Bookings", icon: <BookOnlineIcon />, path: "/my-bookings" },
    { text: "Profile", icon: <PersonIcon />, path: "/profile" },
  ];

  const adminMenuItems: MenuItem[] = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
    { text: "Events", icon: <EventIcon />, path: "/admin/events" },
    { text: "Bookings", icon: <BookOnlineIcon />, path: "/admin/bookings" },
    { text: "Users", icon: <PeopleIcon />, path: "/admin/users" },
    { text: "Profile", icon: <PersonIcon />, path: "/profile" },
  ];

  const drawer = (
    <div>
      <Toolbar />
      {loading ? (
        <Box
          sx={{
            px: 2,
            py: 2,
            mb: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.100",
            borderRadius: 1,
          }}
        >
          <CircularProgress size={32} />
        </Box>
      ) : (
        user && (
          <Box
            sx={{
              px: 2,
              py: 2,
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: "grey.100",
              borderRadius: 1,
            }}
          >
            <Avatar
              src={user.imgUrl || user.profileImage || undefined}
              sx={{ width: 40, height: 40 }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </Avatar>
            <Box>
              <Typography variant="subtitle2">
                {user.name || "Unknown User"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : "Role"}
              </Typography>
            </Box>
          </Box>
        )
      )}
      <List>
        {(user?.role === "admin" ? adminMenuItems : menuItems).map((item) => (
          <ListItem key={item.text} disablePadding component="div">
            <ListItemButton
              component={NavLink}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                "&.active": {
                  bgcolor: "primary.main",
                  color: "#fff",
                  "& .MuiListItemIcon-root": { color: "#fff" },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding component="div">
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Event Management System
          </Typography>
          {user?.role === "admin" && <NotificationBell />}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
