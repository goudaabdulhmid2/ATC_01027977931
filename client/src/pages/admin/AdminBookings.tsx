import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  TextField,
  Tooltip,
  Chip,
  Button,
  Snackbar,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from "@mui/material";
import { Cancel, Visibility, Edit, Delete } from "@mui/icons-material";
import api from "../../utils/axios";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useTranslation } from "react-i18next";

interface Booking {
  _id: string;
  user: { name: string; email?: string };
  event: { _id: string; title: string };
  quantity: number;
  totalPrice: number;
  status: string;
  bookingDate: string;
}

interface EventOption {
  _id: string;
  title: string;
}

const STATUS_OPTIONS = ["pending", "confirmed", "cancelled"];

const AdminBookings: React.FC = () => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [cancelDialog, setCancelDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [eventOptions, setEventOptions] = useState<EventOption[]>([]);
  const [eventFilter, setEventFilter] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [editForm, setEditForm] = useState({ quantity: 1, status: "pending" });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/bookings");
        setBookings(res.data.data.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    const fetchEvents = async () => {
      try {
        const res = await api.get("/admin/events");
        setEventOptions(res.data.data.data || []);
      } catch {}
    };
    fetchBookings();
    fetchEvents();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(e.target.value);
  };
  const handleEventFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEventFilter(e.target.value);
    setPage(1);
  };
  const handleDateFromChange = (date: Date | null) => {
    setDateFrom(date);
    setPage(1);
  };
  const handleDateToChange = (date: Date | null) => {
    setDateTo(date);
    setPage(1);
  };
  const handlePageChange = (_: any, value: number) => {
    setPage(value);
  };
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(1);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.event?.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? b.status === statusFilter : true;
    const matchesEvent = eventFilter ? b.event?._id === eventFilter : true;
    const matchesDateFrom = dateFrom
      ? new Date(b.bookingDate) >= dateFrom
      : true;
    const matchesDateTo = dateTo ? new Date(b.bookingDate) <= dateTo : true;
    return (
      matchesSearch &&
      matchesStatus &&
      matchesEvent &&
      matchesDateFrom &&
      matchesDateTo
    );
  });
  const paginatedBookings = filteredBookings.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleOpenCancel = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialog(true);
  };
  const handleCloseCancel = () => {
    setCancelDialog(false);
    setSelectedBooking(null);
  };

  const handleOpenDetails = (booking: Booking) => {
    setDetailsBooking(booking);
    setDetailsDialog(true);
  };
  const handleCloseDetails = () => {
    setDetailsDialog(false);
    setDetailsBooking(null);
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    setCancelLoading(true);
    try {
      await api.patch(`/admin/bookings/${selectedBooking._id}`, {
        status: "cancelled",
      });
      setBookings((prev) =>
        prev.map((b) =>
          b._id === selectedBooking._id ? { ...b, status: "cancelled" } : b
        )
      );
      setSnackbar({
        open: true,
        message: t("bookings.bookingCancelled"),
        severity: "success",
      });
      setCancelDialog(false);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t("bookings.failedCancel"),
        severity: "error",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleOpenEdit = (booking: Booking) => {
    setEditBooking(booking);
    setEditForm({ quantity: booking.quantity, status: booking.status });
    setEditDialog(true);
  };
  const handleCloseEdit = () => {
    setEditDialog(false);
    setEditBooking(null);
  };
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };
  const handleEditBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBooking) return;
    if (editForm.quantity < 1) {
      setSnackbar({
        open: true,
        message: t("bookings.quantityMin"),
        severity: "error",
      });
      return;
    }
    setEditLoading(true);
    try {
      const res = await api.patch(`/admin/bookings/${editBooking._id}`, {
        quantity: editForm.quantity,
        status: editForm.status,
      });
      setBookings((prev) =>
        prev.map((b) =>
          b._id === editBooking._id ? { ...b, ...res.data.data.booking } : b
        )
      );
      setSnackbar({
        open: true,
        message: t("bookings.bookingUpdated"),
        severity: "success",
      });
      setEditDialog(false);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t("bookings.failedUpdate"),
        severity: "error",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenDelete = (booking: Booking) => {
    setDeleteBookingId(booking._id);
    setDeleteDialog(true);
  };
  const handleCloseDelete = () => {
    setDeleteDialog(false);
    setDeleteBookingId(null);
  };
  const handleDeleteBooking = async () => {
    if (!deleteBookingId) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/bookings/${deleteBookingId}`);
      setBookings((prev) => prev.filter((b) => b._id !== deleteBookingId));
      setSnackbar({
        open: true,
        message: t("bookings.bookingDeleted"),
        severity: "success",
      });
      setDeleteDialog(false);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t("bookings.failedDelete"),
        severity: "error",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setEventFilter("");
    setDateFrom(null);
    setDateTo(null);
    setRowsPerPage(10);
    setPage(1);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" component="h1" gutterBottom>
          {t("admin.bookingManagement")}
        </Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            label={t("common.search")}
            value={search}
            onChange={handleSearchChange}
            size="small"
          />
          <TextField
            select
            label={t("admin.status")}
            value={statusFilter}
            onChange={handleStatusFilterChange}
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">{t("admin.all")}</MenuItem>
            {STATUS_OPTIONS.map((status) => (
              <MenuItem key={status} value={status}>
                {t(`bookings.${status}`)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label={t("admin.event")}
            value={eventFilter}
            onChange={handleEventFilterChange}
            size="small"
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">{t("admin.allEvents")}</MenuItem>
            {eventOptions.map((event) => (
              <MenuItem key={event._id} value={event._id}>
                {event.title}
              </MenuItem>
            ))}
          </TextField>
          <DatePicker
            label={t("admin.from")}
            value={dateFrom}
            onChange={handleDateFromChange}
            slotProps={{ textField: { size: "small" } }}
          />
          <DatePicker
            label={t("admin.to")}
            value={dateTo}
            onChange={handleDateToChange}
            slotProps={{ textField: { size: "small" } }}
          />
          <TextField
            select
            label={t("admin.rows")}
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            size="small"
            sx={{ minWidth: 80 }}
          >
            {[5, 10, 20, 50].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleResetFilters}
          >
            {t("admin.resetFilters")}
          </Button>
        </Stack>
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", verticalAlign: "middle" }}>
                {t("admin.user")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", verticalAlign: "middle" }}>
                {t("admin.event")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", verticalAlign: "middle" }}>
                {t("admin.quantity")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", verticalAlign: "middle" }}>
                {t("admin.totalPrice")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", verticalAlign: "middle" }}>
                {t("admin.status")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", verticalAlign: "middle" }}>
                {t("admin.date")}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", verticalAlign: "middle" }}
              >
                {t("admin.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : paginatedBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary">
                    {t("bookings.noBookingsFound")}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedBookings.map((booking) => (
                <TableRow key={booking._id} hover>
                  <TableCell>{booking.user?.name || "-"}</TableCell>
                  <TableCell>{booking.event?.title || "-"}</TableCell>
                  <TableCell>{booking.quantity}</TableCell>
                  <TableCell>${booking.totalPrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        t(`bookings.statuses.${booking.status}`) ||
                        booking.status
                      }
                      color={
                        booking.status === "confirmed"
                          ? "success"
                          : booking.status === "cancelled"
                          ? "error"
                          : "default"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title={t("bookings.bookingDetails")}>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenDetails(booking)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("bookings.editBooking")}>
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => handleOpenEdit(booking)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      {booking.status !== "cancelled" && (
                        <Tooltip title={t("bookings.cancelBooking")}>
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleOpenCancel(booking)}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={t("bookings.deleteBooking")}>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleOpenDelete(booking)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={Math.ceil(filteredBookings.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
      {/* Cancel Booking Dialog */}
      <Dialog
        open={cancelDialog}
        onClose={handleCloseCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("bookings.deleteBooking")}</DialogTitle>
        <DialogContent>
          <Typography>{t("bookings.confirmCancel")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancel} disabled={cancelLoading}>
            {t("common.no")}
          </Button>
          <Button
            onClick={handleCancelBooking}
            color="error"
            variant="contained"
            disabled={cancelLoading}
          >
            {cancelLoading ? <CircularProgress size={24} /> : t("common.yes")}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Booking Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("bookings.bookingDetails")}</DialogTitle>
        <DialogContent dividers>
          {detailsBooking && (
            <Stack spacing={2}>
              <Typography>
                <b>{t("admin.user")}:</b> {detailsBooking.user?.name || "-"}
                {detailsBooking.user?.email
                  ? ` (${detailsBooking.user.email})`
                  : ""}
              </Typography>
              <Typography>
                <b>{t("admin.event")}:</b> {detailsBooking.event?.title || "-"}
              </Typography>
              <Typography>
                <b>{t("bookings.quantity")}:</b> {detailsBooking.quantity}
              </Typography>
              <Typography>
                <b>{t("bookings.totalPrice")}:</b> $
                {detailsBooking.totalPrice.toLocaleString()}
              </Typography>
              <Typography>
                <b>{t("bookings.status")}:</b>{" "}
                {t(`bookings.statuses.${detailsBooking.status}`)}
              </Typography>
              <Typography>
                <b>{t("bookings.bookingDate")}:</b>{" "}
                {new Date(detailsBooking.bookingDate).toLocaleString()}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Edit Booking Dialog */}
      <Dialog
        open={editDialog}
        onClose={handleCloseEdit}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("bookings.editBooking")}</DialogTitle>
        <form onSubmit={handleEditBooking}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                label={t("bookings.quantity")}
                name="quantity"
                type="number"
                value={editForm.quantity}
                onChange={handleEditFormChange}
                inputProps={{ min: 1 }}
                required
                fullWidth
              />
              <TextField
                select
                label={t("bookings.status")}
                name="status"
                value={editForm.status}
                onChange={handleEditFormChange}
                required
                fullWidth
              >
                {STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status} value={status}>
                    {t(`bookings.statuses.${status}`)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEdit} disabled={editLoading}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={editLoading}
            >
              {editLoading ? <CircularProgress size={24} /> : t("common.save")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Delete Booking Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={handleCloseDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("bookings.deleteBooking")}</DialogTitle>
        <DialogContent>
          <Typography>{t("bookings.confirmCancel")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} disabled={deleteLoading}>
            {t("common.no")}
          </Button>
          <Button
            onClick={handleDeleteBooking}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : t("common.yes")}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminBookings;
