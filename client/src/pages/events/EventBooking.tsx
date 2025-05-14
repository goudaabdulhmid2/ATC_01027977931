import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { AppDispatch, RootState } from "../../store";
import { fetchEventById } from "../../store/slices/eventSlice";
import { toast } from "react-toastify";
import api from "../../utils/axios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useTranslation } from "react-i18next";

const EventBooking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentEvent, loading, error } = useSelector(
    (state: RootState) => state.event
  );
  const [ticketCount, setTicketCount] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id));
    }
  }, [dispatch, id]);

  const handleBooking = async () => {
    if (!id) return;
    setBookingLoading(true);
    try {
      await api.post(`/bookings/book-event/${id}`, { quantity: ticketCount });
      setShowCongrats(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCloseCongrats = () => {
    setShowCongrats(false);
    navigate("/my-bookings");
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

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t("eventBooking.bookTicketsFor")}{" "}
          {currentEvent.title || currentEvent.name}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            {t("eventBooking.ticketInfo")}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {t("eventBooking.pricePerTicket", { price: currentEvent.price })}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {t("eventBooking.availableTickets", {
              count: currentEvent.availableTickets,
            })}
          </Typography>

          <TextField
            type="number"
            label={t("eventBooking.numberOfTickets")}
            value={ticketCount}
            onChange={(e) =>
              setTicketCount(
                Math.max(
                  1,
                  Math.min(
                    currentEvent.availableTickets,
                    parseInt(e.target.value) || 1
                  )
                )
              )
            }
            inputProps={{ min: 1, max: currentEvent.availableTickets }}
            fullWidth
            margin="normal"
          />

          <Typography variant="h6" sx={{ mt: 4 }}>
            {t("eventBooking.total", {
              total: (currentEvent.price * ticketCount).toFixed(2),
            })}
          </Typography>

          <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/events/${id}`)}
            >
              {t("eventBooking.backToEvent")}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBooking}
              disabled={
                ticketCount > currentEvent.availableTickets || bookingLoading
              }
            >
              {bookingLoading ? (
                <CircularProgress size={24} />
              ) : (
                t("eventBooking.confirmBooking")
              )}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog
        open={showCongrats}
        onClose={handleCloseCongrats}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            {t("common.success")}
          </Typography>
          <Typography variant="body1" paragraph>
            {t("eventBooking.bookTicketsFor")}{" "}
            {currentEvent.title || currentEvent.name} {t("bookings.confirmed")}
          </Typography>
          <Typography variant="body1" paragraph>
            {t("eventBooking.numberOfTickets")}: {ticketCount}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("eventBooking.total", {
              total: (currentEvent.price * ticketCount).toFixed(2),
            })}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseCongrats}
          >
            {t("bookings.myBookings")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventBooking;
