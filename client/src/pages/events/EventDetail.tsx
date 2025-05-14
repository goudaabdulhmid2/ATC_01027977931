import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { AppDispatch, RootState } from "../../store";
import {
  fetchEventById,
  clearCurrentEvent,
} from "../../store/slices/eventSlice";
import { format } from "date-fns";
import api from "../../utils/axios";
import { useTranslation } from "react-i18next";

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentEvent, loading, error } = useSelector(
    (state: RootState) => state.event
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const [bookedEventIds, setBookedEventIds] = useState<string[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id));
    }
    return () => {
      dispatch(clearCurrentEvent());
    };
  }, [dispatch, id]);

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
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!currentEvent) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">{t("events.eventNotFound")}</Alert>
      </Container>
    );
  }

  const isBooked = currentEvent && bookedEventIds.includes(currentEvent._id);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {currentEvent.name}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip
                label={t(`events.categories.${currentEvent.category}`)}
                color="primary"
                sx={{ mr: 1 }}
              />
              <Chip
                label={`$${currentEvent.price}`}
                color="secondary"
                sx={{ mr: 1 }}
              />
              <Chip
                label={t("events.leftTickets", {
                  count: currentEvent.availableTickets,
                })}
                color="info"
              />
            </Box>
            <Typography variant="body1" paragraph>
              {currentEvent.description}
            </Typography>
            <Typography variant="h6" gutterBottom>
              {t("events.details")}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  {t("events.dateTime")}
                </Typography>
                <Typography variant="body1">
                  {format(new Date(currentEvent.date), "PPP p")}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  {t("events.venue")}
                </Typography>
                <Typography variant="body1">{currentEvent.location}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  {t("events.organizer")}
                </Typography>
                <Typography variant="body1">
                  {currentEvent.createdBy?.name}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  {t("events.contact")}
                </Typography>
                <Typography variant="body1">
                  {currentEvent.createdBy?.email || "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" gutterBottom>
                {t("events.bookTickets")}
              </Typography>
              <Typography variant="h4" color="primary" gutterBottom>
                ${currentEvent.price}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t("events.perTicket")}
              </Typography>
              {isBooked ? (
                <Chip
                  label={t("events.booked")}
                  color="success"
                  sx={{ height: 40, width: "100%", mt: 2 }}
                />
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/events/${currentEvent._id}/book`)}
                  disabled={currentEvent.availableTickets === 0}
                >
                  {currentEvent.availableTickets === 0
                    ? t("events.soldOut")
                    : t("events.bookNow")}
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default EventDetail;
