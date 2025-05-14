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
  Button,
  Stack,
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
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { logout, getCurrentUser } from "../../store/slices/authSlice";
import { RootState, AppDispatch } from "../../store";
import NotificationBell from "../notifications/NotificationBell";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

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

interface LayoutProps {
  mode: string;
  toggleMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ mode, toggleMode }) => {
  const theme = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const [hasCheckedUser, setHasCheckedUser] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!user && !hasCheckedUser) {
      setHasCheckedUser(true);
      dispatch(getCurrentUser());
    }
  }, [dispatch, user, hasCheckedUser]);

  // RTL support for Arabic
  useEffect(() => {
    document.body.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

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
    { text: t("common.events"), icon: <EventIcon />, path: "/events" },
    {
      text: t("common.bookings"),
      icon: <BookOnlineIcon />,
      path: "/my-bookings",
    },
    { text: t("common.profile"), icon: <PersonIcon />, path: "/profile" },
  ];

  const adminMenuItems: MenuItem[] = [
    { text: t("admin.dashboard"), icon: <DashboardIcon />, path: "/admin" },
    { text: t("admin.events"), icon: <EventIcon />, path: "/admin/events" },
    {
      text: t("admin.bookings"),
      icon: <BookOnlineIcon />,
      path: "/admin/bookings",
    },
    { text: t("admin.users"), icon: <PeopleIcon />, path: "/admin/users" },
    { text: t("common.profile"), icon: <PersonIcon />, path: "/profile" },
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
              ...(muiTheme.palette.mode === "dark" && {
                bgcolor: "#23272f",
              }),
            }}
          >
            <Avatar
              src={user.imgUrl || user.profileImage || undefined}
              sx={{ width: 40, height: 40 }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </Avatar>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: muiTheme.palette.text.primary }}
              >
                {user.name || "Unknown User"}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: muiTheme.palette.text.secondary }}
              >
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
              end={item.path === "/admin"}
              selected={location.pathname === item.path}
              sx={{
                "&.Mui-selected": {
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
            <ListItemText primary={t("common.logout")} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding component="div">
          <ListItemButton onClick={toggleMode}>
            <ListItemIcon>
              {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </ListItemIcon>
            <ListItemText
              primary={
                mode === "dark" ? t("common.lightMode") : t("common.darkMode")
              }
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding component="div">
          <Box sx={{ width: "100%", px: 2, py: 1 }}>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Button
                variant={i18n.language === "en" ? "contained" : "outlined"}
                size="small"
                onClick={() => i18n.changeLanguage("en")}
              >
                {t("common.english")}
              </Button>
              <Button
                variant={i18n.language === "ar" ? "contained" : "outlined"}
                size="small"
                onClick={() => i18n.changeLanguage("ar")}
              >
                {t("common.arabic")}
              </Button>
            </Stack>
          </Box>
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
            {t(
              user?.role === "admin" ? "common.appName" : "common.userAppName"
            )}
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
            keepMounted: true,
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
