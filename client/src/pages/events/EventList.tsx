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
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { AppDispatch, RootState } from "../../store";
import { fetchEvents } from "../../store/slices/eventSlice";
import { toast } from "react-toastify";
import api from "../../utils/axios";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

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
      event.name.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase());
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
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          />
          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ minWidth: 220 }}>
            <Typography variant="body2">
              Price Range: {formatCurrency(priceRange[0])} -{" "}
              {formatCurrency(priceRange[1])}
            </Typography>
            <Slider
              value={priceRange}
              onChange={(_, val) => setPriceRange(val as number[])}
              valueLabelDisplay="auto"
              min={minPrice}
              max={maxPrice}
              step={priceStep}
              sx={{ width: 150 }}
              disabled={minPrice === maxPrice}
            />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: -1 }}
            >
              <Typography variant="caption">
                {formatCurrency(minPrice)}
              </Typography>
              <Typography variant="caption">
                {formatCurrency(maxPrice)}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleResetFilters}
            sx={{ ml: 2, height: 40 }}
          >
            Reset Filters
          </Button>
        </Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Upcoming Events
        </Typography>
        <Grid container spacing={4}>
          {(filteredEvents || []).map((event) => {
            const isBooked = bookedEventIds.includes(event._id);
            return (
              <Grid item key={event._id} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={event.imgUrl || "/placeholder-event.jpg"}
                    alt={event.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
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
                      />
                      <Chip
                        label={`$${event.price}`}
                        size="small"
                        color="secondary"
                        variant="outlined"
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
                    >
                      See Details
                    </Button>
                    {event.availableTickets === 0 ? (
                      <Chip
                        label="Sold Out"
                        color="error"
                        sx={{ height: 40, width: "100%" }}
                      />
                    ) : isBooked ? (
                      <Chip
                        label="Booked"
                        color="success"
                        sx={{ height: 40, width: "100%" }}
                      />
                    ) : (
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleBookNow(event._id)}
                      >
                        Book Now
                      </Button>
                    )}
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </>
  );
};

export default EventList;
