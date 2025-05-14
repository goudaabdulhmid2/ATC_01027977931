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
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Card,
  CardMedia,
  Backdrop,
  Tooltip,
  Chip,
  Pagination,
  Select,
  FormControl,
  InputLabel,
  Grid,
  SelectChangeEvent,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Image as ImageIcon,
  Search,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import api from "../../utils/axios";

const CATEGORY_OPTIONS = [
  "Music",
  "Sports",
  "Arts",
  "Food",
  "Business",
  "Technology",
  "Other",
];

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  category: string;
  capacity: number;
  availableTickets: number;
  isActive: boolean;
  image?: string;
  imgUrl?: string;
}

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    price: "",
    category: CATEGORY_OPTIONS[0],
    capacity: "",
    availableTickets: "",
    isActive: true,
    image: null as File | null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/events");
        setEvents(res.data.data.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleOpenCreate = () => {
    setForm({
      title: "",
      description: "",
      date: "",
      location: "",
      price: "",
      category: CATEGORY_OPTIONS[0],
      capacity: "",
      availableTickets: "",
      isActive: true,
      image: null,
    });
    setImagePreview(null);
    setCreateError(null);
    setOpenCreate(true);
  };

  const handleCloseCreate = () => {
    setOpenCreate(false);
    setImagePreview(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked, files } = e.target as any;
    if (name === "image" && files) {
      const file = files[0];
      setForm((prev) => ({ ...prev, image: file }));
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      // If capacity changes, adjust availableTickets if needed
      if (
        name === "capacity" &&
        Number(form.availableTickets) > Number(value)
      ) {
        setForm((prev) => ({ ...prev, availableTickets: value }));
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    // Validate required fields
    if (!form.title.trim()) {
      setCreateError("Title is required");
      setCreateLoading(false);
      return;
    }
    if (!form.description.trim()) {
      setCreateError("Description is required");
      setCreateLoading(false);
      return;
    }
    if (!form.date) {
      setCreateError("Date is required");
      setCreateLoading(false);
      return;
    }
    if (!form.location.trim()) {
      setCreateError("Location is required");
      setCreateLoading(false);
      return;
    }
    if (!form.price) {
      setCreateError("Price is required");
      setCreateLoading(false);
      return;
    }
    if (!form.category) {
      setCreateError("Category is required");
      setCreateLoading(false);
      return;
    }
    if (!form.capacity) {
      setCreateError("Capacity is required");
      setCreateLoading(false);
      return;
    }
    if (!form.availableTickets) {
      setCreateError("Available tickets count is required");
      setCreateLoading(false);
      return;
    }

    // Validate types and formats
    if (form.title.trim().length < 3) {
      setCreateError("Title must be at least 3 characters long");
      setCreateLoading(false);
      return;
    }
    if (form.description.trim().length < 10) {
      setCreateError("Description must be at least 10 characters long");
      setCreateLoading(false);
      return;
    }
    if (Number(form.price) <= 0) {
      setCreateError("Price must be a positive number");
      setCreateLoading(false);
      return;
    }
    if (!CATEGORY_OPTIONS.includes(form.category)) {
      setCreateError("Invalid category");
      setCreateLoading(false);
      return;
    }
    if (Math.floor(Number(form.capacity)) < 1) {
      setCreateError("Capacity must be a positive integer");
      setCreateLoading(false);
      return;
    }
    if (Math.floor(Number(form.availableTickets)) < 0) {
      setCreateError("Available tickets count must be a non-negative integer");
      setCreateLoading(false);
      return;
    }
    if (
      Math.floor(Number(form.availableTickets)) >
      Math.floor(Number(form.capacity))
    ) {
      setCreateError("Available tickets cannot exceed capacity");
      setCreateLoading(false);
      return;
    }

    try {
      // Prepare the event data
      const eventData = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        location: form.location.trim(),
        price: Math.floor(Number(form.price)),
        category: form.category,
        capacity: Math.floor(Number(form.capacity)),
        availableTickets: Math.floor(Number(form.availableTickets)),
        isActive: Boolean(form.isActive),
      };

      // Log the data being sent
      console.log("Event data being sent:", eventData);

      // First create the event
      const res = await api.post("/admin/events", eventData);

      // If there's an image, upload it separately
      if (form.image) {
        const imageFormData = new FormData();
        imageFormData.append("image", form.image);
        await api.patch(
          `/admin/events/${res.data.data.newDoc._id}`,
          imageFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      setEvents((prev) => [res.data.data.newDoc, ...prev]);
      setOpenCreate(false);
      setSnackbar({
        open: true,
        message: "Event created successfully!",
        severity: "success",
      });
    } catch (err: any) {
      console.error("Error response:", err.response?.data);
      setCreateError(err.response?.data?.message || "Failed to create event");
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to create event",
        severity: "error",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpenEdit = (event: Event) => {
    setSelectedEvent(event);
    setForm({
      title: event.title,
      description: event.description,
      date: new Date(event.date).toISOString().split("T")[0],
      location: event.location,
      price: String(event.price),
      category: event.category,
      capacity: String(event.capacity),
      availableTickets: String(event.availableTickets),
      isActive: event.isActive,
      image: null,
    });
    setImagePreview(event.imgUrl || event.image || null);
    setEditError(null);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedEvent(null);
    setImagePreview(null);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setEditLoading(true);
    setEditError(null);

    // Validate required fields
    if (!form.title.trim()) {
      setEditError("Title is required");
      setEditLoading(false);
      return;
    }
    if (!form.description.trim()) {
      setEditError("Description is required");
      setEditLoading(false);
      return;
    }
    if (!form.date) {
      setEditError("Date is required");
      setEditLoading(false);
      return;
    }
    if (!form.location.trim()) {
      setEditError("Location is required");
      setEditLoading(false);
      return;
    }
    if (!form.price) {
      setEditError("Price is required");
      setEditLoading(false);
      return;
    }
    if (!form.category) {
      setEditError("Category is required");
      setEditLoading(false);
      return;
    }
    if (!form.capacity) {
      setEditError("Capacity is required");
      setEditLoading(false);
      return;
    }
    if (!form.availableTickets) {
      setEditError("Available tickets count is required");
      setEditLoading(false);
      return;
    }

    // Validate types and formats
    if (form.title.trim().length < 3) {
      setEditError("Title must be at least 3 characters long");
      setEditLoading(false);
      return;
    }
    if (form.description.trim().length < 10) {
      setEditError("Description must be at least 10 characters long");
      setEditLoading(false);
      return;
    }
    if (Number(form.price) <= 0) {
      setEditError("Price must be a positive number");
      setEditLoading(false);
      return;
    }
    if (!CATEGORY_OPTIONS.includes(form.category)) {
      setEditError("Invalid category");
      setEditLoading(false);
      return;
    }
    if (Math.floor(Number(form.capacity)) < 1) {
      setEditError("Capacity must be a positive integer");
      setEditLoading(false);
      return;
    }
    if (Math.floor(Number(form.availableTickets)) < 0) {
      setEditError("Available tickets count must be a non-negative integer");
      setEditLoading(false);
      return;
    }
    if (
      Math.floor(Number(form.availableTickets)) >
      Math.floor(Number(form.capacity))
    ) {
      setEditError("Available tickets cannot exceed capacity");
      setEditLoading(false);
      return;
    }

    try {
      // Prepare the event data
      const eventData = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        location: form.location.trim(),
        price: Math.floor(Number(form.price)),
        category: form.category,
        capacity: Math.floor(Number(form.capacity)),
        availableTickets: Math.floor(Number(form.availableTickets)),
        isActive: Boolean(form.isActive),
      };

      // First update the event
      const res = await api.patch(
        `/admin/events/${selectedEvent._id}`,
        eventData
      );

      // If there's a new image, upload it
      if (form.image) {
        const imageFormData = new FormData();
        imageFormData.append("image", form.image);
        await api.patch(`/admin/events/${selectedEvent._id}`, imageFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // Update the events list
      setEvents((prev) =>
        prev.map((event) =>
          event._id === selectedEvent._id ? res.data.data.doc : event
        )
      );
      setOpenEdit(false);
      setSnackbar({
        open: true,
        message: "Event updated successfully!",
        severity: "success",
      });
    } catch (err: any) {
      console.error("Error response:", err.response?.data);
      setEditError(err.response?.data?.message || "Failed to update event");
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update event",
        severity: "error",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/admin/events/${eventId}`);
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
      setSnackbar({
        open: true,
        message: "Event deleted successfully!",
        severity: "success",
      });
    } catch (err: any) {
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || "Failed to delete event");
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to delete event",
        severity: "error",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Filter events based on search, category, status, and date range
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "" || event.category === categoryFilter;

    const matchesStatus =
      statusFilter === "" ||
      (statusFilter === "active" && event.isActive) ||
      (statusFilter === "inactive" && !event.isActive);

    const matchesDateRange =
      !dateRange.start ||
      !dateRange.end ||
      (new Date(event.date) >= dateRange.start &&
        new Date(event.date) <= dateRange.end);

    return (
      matchesSearch && matchesCategory && matchesStatus && matchesDateRange
    );
  });

  // Paginate the filtered events
  const paginatedEvents = filteredEvents.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (event: SelectChangeEvent) => {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleCategoryFilterChange = (event: SelectChangeEvent) => {
    setCategoryFilter(event.target.value as string);
    setPage(1);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value as string);
    setPage(1);
  };

  const handleDateRangeChange = (
    field: "start" | "end",
    value: Date | null
  ) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
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
          Event Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenCreate}
        >
          Create Event
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <Search sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={handleCategoryFilterChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                {CATEGORY_OPTIONS.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={dateRange.start}
                onChange={(date) => handleDateRangeChange("start", date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={dateRange.end}
                onChange={(date) => handleDateRangeChange("end", date)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <FormControl fullWidth>
              <InputLabel>Rows</InputLabel>
              <Select
                value={rowsPerPage.toString()}
                label="Rows"
                onChange={handleRowsPerPageChange}
              >
                <MenuItem value={"5"}>5</MenuItem>
                <MenuItem value={"10"}>10</MenuItem>
                <MenuItem value={"25"}>25</MenuItem>
                <MenuItem value={"50"}>50</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Capacity</TableCell>
              <TableCell>Available</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEvents.map((event) => {
              // Use the imgUrl virtual field from the backend if available
              const imageUrl = event.imgUrl || event.image || "";
              return (
                <TableRow key={event._id} hover>
                  <TableCell>
                    {imageUrl ? (
                      <Box
                        component="img"
                        src={imageUrl}
                        alt={event.title}
                        sx={{
                          width: 50,
                          height: 50,
                          objectFit: "cover",
                          borderRadius: 1,
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "grey.100",
                          borderRadius: 1,
                        }}
                      >
                        <ImageIcon color="disabled" />
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {event.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(event.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>${event.price}</TableCell>
                  <TableCell>
                    <Chip
                      label={event.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{event.capacity}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${event.availableTickets} left`}
                      size="small"
                      color={
                        event.availableTickets === 0
                          ? "error"
                          : event.availableTickets < event.capacity / 2
                          ? "warning"
                          : "success"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={event.isActive ? "Active" : "Inactive"}
                      size="small"
                      color={event.isActive ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Tooltip title="Edit Event">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenEdit(event)}
                          disabled={editLoading}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Event">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(event._id)}
                          disabled={deleteLoading}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginatedEvents.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    No events found matching your filters.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Pagination
          count={Math.ceil(filteredEvents.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        }}
        open={loading}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="inherit" />
          <Typography color="inherit">Loading events...</Typography>
        </Stack>
      </Backdrop>

      {/* Create Event Dialog */}
      <Dialog
        open={openCreate}
        onClose={handleCloseCreate}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Event</DialogTitle>
        <form onSubmit={handleCreate} encType="multipart/form-data">
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                label="Title"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                required
                fullWidth
              />
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                required
                fullWidth
                multiline
                minRows={2}
              />
              <TextField
                label="Date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleFormChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Location"
                name="location"
                value={form.location}
                onChange={handleFormChange}
                required
                fullWidth
              />
              <TextField
                label="Price"
                name="price"
                type="number"
                value={form.price}
                onChange={handleFormChange}
                required
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                select
                label="Category"
                name="category"
                value={form.category}
                onChange={handleFormChange}
                required
                fullWidth
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Capacity"
                name="capacity"
                type="number"
                value={form.capacity}
                onChange={handleFormChange}
                required
                fullWidth
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Available Tickets"
                name="availableTickets"
                type="number"
                value={form.availableTickets}
                onChange={handleFormChange}
                required
                fullWidth
                inputProps={{ min: 0, max: form.capacity || undefined }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isActive}
                    onChange={handleFormChange}
                    name="isActive"
                  />
                }
                label="Active"
              />
              <Box>
                <Button variant="outlined" component="label" fullWidth>
                  Upload Image
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    hidden
                    onChange={handleFormChange}
                  />
                </Button>
                {imagePreview && (
                  <Card sx={{ mt: 2 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={imagePreview}
                      alt="Event preview"
                      sx={{ objectFit: "contain" }}
                    />
                  </Card>
                )}
              </Box>
              {createError && <Alert severity="error">{createError}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCreate} disabled={createLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={createLoading}
            >
              {createLoading ? <CircularProgress size={24} /> : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Edit Event Dialog */}
      <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Event</DialogTitle>
        <form onSubmit={handleEdit} encType="multipart/form-data">
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                label="Title"
                name="title"
                value={form.title}
                onChange={handleFormChange}
                required
                fullWidth
              />
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                required
                fullWidth
                multiline
                minRows={2}
              />
              <TextField
                label="Date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleFormChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Location"
                name="location"
                value={form.location}
                onChange={handleFormChange}
                required
                fullWidth
              />
              <TextField
                label="Price"
                name="price"
                type="number"
                value={form.price}
                onChange={handleFormChange}
                required
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                select
                label="Category"
                name="category"
                value={form.category}
                onChange={handleFormChange}
                required
                fullWidth
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Capacity"
                name="capacity"
                type="number"
                value={form.capacity}
                onChange={handleFormChange}
                required
                fullWidth
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Available Tickets"
                name="availableTickets"
                type="number"
                value={form.availableTickets}
                onChange={handleFormChange}
                required
                fullWidth
                inputProps={{ min: 0, max: form.capacity || undefined }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isActive}
                    onChange={handleFormChange}
                    name="isActive"
                  />
                }
                label="Active"
              />
              <Box>
                <Button variant="outlined" component="label" fullWidth>
                  Upload Image
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    hidden
                    onChange={handleFormChange}
                  />
                </Button>
                {imagePreview && (
                  <Card sx={{ mt: 2 }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={imagePreview}
                      alt="Event preview"
                      sx={{ objectFit: "contain" }}
                    />
                  </Card>
                )}
              </Box>
              {editError && <Alert severity="error">{editError}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEdit} disabled={editLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={editLoading}
            >
              {editLoading ? <CircularProgress size={24} /> : "Update"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Add Snackbar at the end of the component */}
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

export default AdminEvents;
