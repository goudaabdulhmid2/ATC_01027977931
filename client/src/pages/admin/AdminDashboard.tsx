import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stack,
  Paper,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import api from "../../utils/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

interface DashboardStats {
  bookings: {
    totalBookings: number;
    totalRevenue: number;
    confirmedBookings: number;
    cancelledBookings: number;
  };
  events: {
    totalEvents: number;
    upcomingEvents: number;
    totalTickets: number;
    availableTickets: number;
  };
  users: {
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingTrends, setBookingTrends] = useState<any[]>([]);
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [trendsError, setTrendsError] = useState<string | null>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/dashboard/stats");
        setStats(res.data.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setTrendsLoading(true);
        const res = await api.get("/admin/bookings/trends");
        setBookingTrends(res.data.data);
        setTrendsError(null);
      } catch (err: any) {
        setTrendsError(
          err.response?.data?.message || "Failed to load booking trends"
        );
      } finally {
        setTrendsLoading(false);
      }
    };
    fetchTrends();
  }, []);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setActivityLoading(true);
        const res = await api.get("/admin/activity");
        setActivity(res.data.data);
        setActivityError(null);
      } catch (err: any) {
        setActivityError(
          err.response?.data?.message || "Failed to load activity"
        );
      } finally {
        setActivityLoading(false);
      }
    };
    fetchActivity();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Admin Dashboard
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Overview
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 3,
                minWidth: 200,
                minHeight: 170,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "background.paper",
                boxShadow: 3,
              }}
              component={Link}
              to="/admin/events"
            >
              <Stack alignItems="center" spacing={1} sx={{ mt: 2 }}>
                <EventIcon color="primary" fontSize="large" />
                <Typography variant="h4" fontWeight={700}>
                  {stats?.events.totalEvents ?? "..."}
                </Typography>
                <Typography color="text.secondary">Events</Typography>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 3,
                minWidth: 200,
                minHeight: 170,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "background.paper",
                boxShadow: 3,
              }}
              component={Link}
              to="/admin/users"
            >
              <Stack alignItems="center" spacing={1} sx={{ mt: 2 }}>
                <PeopleIcon color="secondary" fontSize="large" />
                <Typography variant="h4" fontWeight={700}>
                  {stats?.users.totalUsers ?? "..."}
                </Typography>
                <Typography color="text.secondary">Users</Typography>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 3,
                minWidth: 200,
                minHeight: 170,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "background.paper",
                boxShadow: 3,
              }}
              component={Link}
              to="/admin/bookings"
            >
              <Stack alignItems="center" spacing={1} sx={{ mt: 2 }}>
                <BookOnlineIcon color="success" fontSize="large" />
                <Typography variant="h4" fontWeight={700}>
                  {stats?.bookings.totalBookings ?? "..."}
                </Typography>
                <Typography color="text.secondary">Bookings</Typography>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 3,
                minWidth: 200,
                minHeight: 170,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                bgcolor: "background.paper",
                boxShadow: 3,
              }}
            >
              <Stack alignItems="center" spacing={1} sx={{ mt: 2 }}>
                <MonetizationOnIcon color="warning" fontSize="large" />
                <Typography variant="h4" fontWeight={700}>
                  ${stats?.bookings.totalRevenue?.toLocaleString() ?? "..."}
                </Typography>
                <Typography color="text.secondary">Revenue</Typography>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {activityLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : activityError ? (
              <Alert severity="error">{activityError}</Alert>
            ) : (
              <Stack spacing={2}>
                {activity.length === 0 ? (
                  <Typography color="text.secondary">
                    No recent activity.
                  </Typography>
                ) : (
                  activity.map((item, idx) => (
                    <Box key={idx}>
                      <Typography variant="body2">{item.text}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.date}
                      </Typography>
                    </Box>
                  ))
                )}
              </Stack>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Bookings & Revenue Trends
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {trendsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <CircularProgress />
              </Box>
            ) : trendsError ? (
              <Alert severity="error">{trendsError}</Alert>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={bookingTrends}
                  margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    yAxisId="left"
                    label={{
                      value: "Bookings",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{
                      value: "Revenue",
                      angle: 90,
                      position: "insideRight",
                    }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bookings"
                    stroke="#1976d2"
                    name="Bookings"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#43a047"
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Typography variant="subtitle1" gutterBottom>
        Welcome, Admin! Use the links below to manage the system.
      </Typography>
      <Grid container spacing={2} sx={{ mt: 2, mb: 4 }}>
        <Grid item>
          <Button
            component={Link}
            to="/admin/events"
            variant="contained"
            color="primary"
          >
            Manage Events
          </Button>
        </Grid>
        <Grid item>
          <Button
            component={Link}
            to="/admin/users"
            variant="contained"
            color="secondary"
          >
            Manage Users
          </Button>
        </Grid>
        <Grid item>
          <Button
            component={Link}
            to="/admin/bookings"
            variant="contained"
            color="success"
          >
            Manage Bookings
          </Button>
        </Grid>
      </Grid>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : stats ? (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Users</Typography>
                  <Typography>Total: {stats.users.totalUsers}</Typography>
                  <Typography>Active: {stats.users.activeUsers}</Typography>
                  <Typography>Admins: {stats.users.adminUsers}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Events</Typography>
                  <Typography>Total: {stats.events.totalEvents}</Typography>
                  <Typography>
                    Upcoming: {stats.events.upcomingEvents}
                  </Typography>
                  <Typography>Tickets: {stats.events.totalTickets}</Typography>
                  <Typography>
                    Available: {stats.events.availableTickets}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Bookings</Typography>
                  <Typography>Total: {stats.bookings.totalBookings}</Typography>
                  <Typography>
                    Confirmed: {stats.bookings.confirmedBookings}
                  </Typography>
                  <Typography>
                    Cancelled: {stats.bookings.cancelledBookings}
                  </Typography>
                  <Typography>
                    Revenue: ${stats.bookings.totalRevenue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      ) : null}
    </Box>
  );
};

export default AdminDashboard;
