import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  TextField,
  MenuItem,
  Slider,
  CardActions,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { AppDispatch, RootState } from "../../store";
import { fetchEvents } from "../../store/slices/eventSlice";
import { toast } from "react-toastify";
import api from "../../utils/axios";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { useTranslation } from "react-i18next";

const EventList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { events, loading, error } = useSelector(
    (state: RootState) => state.event
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const [bookedEventIds, setBookedEventIds] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const { t } = useTranslation();

  const categories = Array.from(new Set((events || []).map((e) => e.category)));

  // Calculate min and max price from events
  const prices = (events || []).map((e) => e.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 1000;
  const priceStep = maxPrice - minPrice > 100 ? 10 : 1;

  // Instead, set initial price range when events are loaded
  useEffect(() => {
    if (
      prices.length &&
      (priceRange[0] !== minPrice || priceRange[1] !== maxPrice)
    ) {
      setPriceRange([minPrice, maxPrice]);
    }
    // eslint-disable-next-line
  }, [minPrice, maxPrice]);

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  const handleResetFilters = () => {
    setCategory("");
    setSearch("");
    setPriceRange([minPrice, maxPrice]);
  };

  const filteredEvents = (events || []).filter((event) => {
    const matchesCategory = !category || event.category === category;
    const matchesSearch =
      !search ||
      (event.name || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (event.description || "")
        .toLowerCase()
        .includes((search || "").toLowerCase());
    const matchesPrice =
      event.price >= priceRange[0] && event.price <= priceRange[1];
    return matchesCategory && matchesSearch && matchesPrice;
  });

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (user) {
        try {
          const res = await api.get("/bookings/my-bookings");
          const ids = (res.data.data.bookings || [])
            .filter((b: any) => b.status !== "cancelled")
            .map((b: any) => b.event._id);
          setBookedEventIds(ids);
        } catch (err) {
          setBookedEventIds([]);
        }
      } else {
        setBookedEventIds([]);
      }
    };
    fetchUserBookings();
  }, [user]);

  const handleBookNow = (eventId: string) => {
    if (!user) {
      toast.info("Please log in or sign up to book tickets.");
      navigate("/login", { state: { from: `/events/${eventId}/book` } });
    } else {
      navigate(`/events/${eventId}/book`);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 700, letterSpacing: 1 }}
      >
        {t("events.title")}
      </Typography>

      {/* Filters */}
      <Box
        sx={(theme) => ({
          mb: 6,
          p: 4,
          borderRadius: 3,
          boxShadow: theme.palette.mode === "dark" ? 4 : 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor:
            theme.palette.mode === "dark" ? "background.paper" : "grey.100",
        })}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label={t("events.category")}
              select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sx={{ borderRadius: 2, bgcolor: "background.paper" }}
            >
              <MenuItem value="">{t("common.all")}</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {t(`events.categories.${cat}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ px: 2 }}>
              <Typography variant="body2" gutterBottom>
                {t("events.priceRange")}: {formatCurrency(priceRange[0])} -{" "}
                {formatCurrency(priceRange[1])}
              </Typography>
              <Slider
                value={priceRange}
                onChange={(_, newValue) => setPriceRange(newValue as number[])}
                valueLabelDisplay="auto"
                min={minPrice}
                max={maxPrice}
                step={priceStep}
                marks={[
                  { value: minPrice, label: formatCurrency(minPrice) },
                  { value: maxPrice, label: formatCurrency(maxPrice) },
                ]}
                sx={{ mt: 2 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label={t("common.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ borderRadius: 2, bgcolor: "background.paper" }}
            />
            <Button
              fullWidth
              variant="outlined"
              onClick={handleResetFilters}
              sx={{ mt: 1, borderRadius: 2 }}
            >
              {t("common.reset")}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Events Grid */}
      <Grid
        container
        spacing={4}
        sx={{
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
              : "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
          borderRadius: 4,
          p: 2,
          mt: 0,
        }}
      >
        {filteredEvents.map((event) => {
          const isBooked = bookedEventIds.includes(event._id);
          return (
            <Grid item key={event._id} xs={12} sm={6} md={4}>
              <Card
                sx={(theme) => ({
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  borderRadius: 4,
                  boxShadow: theme.palette.mode === "dark" ? 8 : 2,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-6px) scale(1.03)",
                    boxShadow: theme.palette.mode === "dark" ? 16 : 6,
                  },
                  bgcolor: theme.palette.background.paper,
                })}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={event.imgUrl || "/placeholder-event.jpg"}
                  alt={event.name}
                  sx={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="h2"
                    sx={{ fontWeight: 600 }}
                  >
                    {event.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {event.description}
                  </Typography>
                  <Box
                    sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}
                  >
                    <Chip
                      label={event.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                    <Chip
                      label={formatCurrency(event.price)}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(event.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.location}
                    </Typography>
                  </Box>
                </CardContent>
                <Box sx={{ p: 2, pt: 0, display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate(`/events/${event._id}`)}
                    sx={{ borderRadius: 2, fontWeight: 500 }}
                  >
                    {t("events.viewDetails")}
                  </Button>
                  {event.availableTickets === 0 ? (
                    <Chip
                      label={t("events.soldOut") || "Sold Out"}
                      color="error"
                      sx={{
                        height: 40,
                        width: "100%",
                        fontWeight: 700,
                        fontSize: 16,
                        borderRadius: 2,
                      }}
                    />
                  ) : isBooked ? (
                    <Chip
                      label={t("events.booked") || "Booked"}
                      color="success"
                      sx={{
                        height: 40,
                        width: "100%",
                        fontWeight: 700,
                        fontSize: 16,
                        borderRadius: 2,
                      }}
                    />
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleBookNow(event._id)}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: 16,
                        transition: "background 0.2s, box-shadow 0.2s",
                        boxShadow: 2,
                        "&:hover": {
                          background: (theme) => theme.palette.primary.dark,
                          boxShadow: 6,
                        },
                      }}
                    >
                      {t("events.bookNow")}
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
};

export default EventList;
