import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Box,
  Alert,
  Chip,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

interface Booking {
  _id: string;
  event: {
    _id: string;
    title: string;
    date: string;
    location: string;
    imgUrl?: string;
  };
  quantity: number;
  status: string;
  bookingDate: string;
  totalPrice?: number;
}

const statusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "success";
    case "cancelled":
      return "error";
    case "pending":
      return "warning";
    default:
      return "default";
  }
};

const MyBookings: React.FC = () => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editLoading, setEditLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<{
    title: string;
    message: string;
    details: string;
  } | null>(null);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings/my-bookings");
      const sortedBookings = (res.data.data.bookings || []).sort(
        (a: Booking, b: Booking) => {
          // First sort by status (confirmed first)
          if (a.status === "confirmed" && b.status !== "confirmed") return -1;
          if (a.status !== "confirmed" && b.status === "confirmed") return 1;

          // Then sort by event date (most recent first)
          return (
            new Date(b.event.date).getTime() - new Date(a.event.date).getTime()
          );
        }
      );
      setBookings(sortedBookings);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId: string) => {
    setCancelLoading(bookingId);
    try {
      const booking = bookings.find((b) => b._id === bookingId);
      await api.patch(`/bookings/${bookingId}/cancel`);
      setSuccessMessage({
        title: "Booking Cancelled",
        message: "Your booking has been successfully cancelled.",
        details: `Booking for ${booking?.event.title} has been cancelled.`,
      });
      setShowSuccessDialog(true);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelLoading(null);
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditId(booking._id);
    setEditQuantity(booking.quantity);
    setSelectedBooking(booking);
    setDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editId || !selectedBooking) return;
    setEditLoading(true);
    try {
      await api.patch(`/bookings/my-bookings/${editId}`, {
        quantity: editQuantity,
      });
      setSuccessMessage({
        title: "Booking Updated",
        message: "Your booking has been successfully updated.",
        details: `Booking for ${selectedBooking.event.title} has been updated to ${editQuantity} ticket(s).`,
      });
      setShowSuccessDialog(true);
      setDialogOpen(false);
      fetchBookings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update booking");
    } finally {
      setEditLoading(false);
      setEditId(null);
      setSelectedBooking(null);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    setSuccessMessage(null);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t("bookings.myBookings")}
      </Typography>
      {bookings.length === 0 ? (
        <Alert severity="info">{t("bookings.noBookings")}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("bookings.image")}</TableCell>
                <TableCell>{t("bookings.event")}</TableCell>
                <TableCell>{t("bookings.date")}</TableCell>
                <TableCell>{t("bookings.bookingDate")}</TableCell>
                <TableCell>{t("bookings.quantity")}</TableCell>
                <TableCell>{t("bookings.totalPrice")}</TableCell>
                <TableCell>{t("bookings.status")}</TableCell>
                <TableCell>{t("bookings.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>
                    {booking.event.imgUrl ? (
                      <img
                        src={booking.event.imgUrl}
                        alt={booking.event.title}
                        style={{
                          width: 60,
                          height: 40,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 60,
                          height: 40,
                          bgcolor: "grey.200",
                          borderRadius: 4,
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{booking.event.title}</TableCell>
                  <TableCell>
                    {new Date(booking.event.date).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {new Date(booking.bookingDate).toLocaleString()}
                  </TableCell>
                  <TableCell>{booking.quantity}</TableCell>
                  <TableCell>
                    $
                    {booking.totalPrice
                      ? booking.totalPrice.toFixed(2)
                      : (
                          booking.quantity * (booking.event as any).price || 0
                        ).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`bookings.statuses.${booking.status}`)}
                      color={statusColor(booking.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/events/${booking.event._id}`)}
                    >
                      {t("bookings.viewEvent")}
                    </Button>
                    {booking.status === "confirmed" && (
                      <>
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(booking)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleCancel(booking._id)}
                          size="small"
                          disabled={cancelLoading === booking._id}
                        >
                          <CancelIcon />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{t("bookings.edit")}</DialogTitle>
        <DialogContent>
          <TextField
            type="number"
            label={t("bookings.ticketCount")}
            value={editQuantity}
            onChange={(e) =>
              setEditQuantity(Math.max(1, parseInt(e.target.value) || 1))
            }
            fullWidth
            margin="normal"
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={editLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleEditSave}
            color="primary"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={editLoading}
          >
            {editLoading ? <CircularProgress size={20} /> : t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showSuccessDialog}
        onClose={handleCloseSuccessDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            {successMessage?.title}
          </Typography>
          <Typography variant="body1" paragraph>
            {successMessage?.message}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {successMessage?.details}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCloseSuccessDialog}
          >
            {t("common.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyBookings;
