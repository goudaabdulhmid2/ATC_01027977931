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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const CATEGORY_OPTIONS = [
    t("events.categories.Music"),
    t("events.categories.Sports"),
    t("events.categories.Arts"),
    t("events.categories.Food"),
    t("events.categories.Business"),
    t("events.categories.Technology"),
    t("events.categories.Other"),
  ];

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<Event | null>(null);
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
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value, type, checked, files } = e.target as any;

    if (name === "image" && files) {
      const file = files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          setCreateError("Please upload an image file");
          return;
        }
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setCreateError("Image size should be less than 5MB");
          return;
        }
        // Update form state with the file
        setForm((prev) => ({ ...prev, image: file }));
        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        // Clear any previous errors
        setCreateError(null);
        setEditError(null);
      }
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

  const validateForm = (isEdit: boolean = false) => {
    const errors: string[] = [];

    // Required fields validation
    if (!form.title.trim()) errors.push(t("events.validation.titleRequired"));
    if (!form.description.trim())
      errors.push(t("events.validation.descriptionRequired"));
    if (!form.date) errors.push(t("events.validation.dateRequired"));
    if (!form.location.trim())
      errors.push(t("events.validation.locationRequired"));
    if (!form.price) errors.push(t("events.validation.priceRequired"));
    if (!form.category) errors.push(t("events.validation.categoryRequired"));
    if (!form.capacity) errors.push(t("events.validation.capacityRequired"));
    if (!form.availableTickets)
      errors.push(t("events.validation.ticketsRequired"));

    // Format and type validation
    if (form.title.trim().length < 3)
      errors.push(t("events.validation.titleLength"));
    if (form.description.trim().length < 10)
      errors.push(t("events.validation.descriptionLength"));
    if (Number(form.price) <= 0)
      errors.push(t("events.validation.pricePositive"));
    if (!CATEGORY_OPTIONS.includes(form.category))
      errors.push(t("events.validation.invalidCategory"));
    if (Math.floor(Number(form.capacity)) < 1)
      errors.push(t("events.validation.capacityPositive"));
    if (Math.floor(Number(form.availableTickets)) < 0)
      errors.push(t("events.validation.ticketsNonNegative"));
    if (
      Math.floor(Number(form.availableTickets)) >
      Math.floor(Number(form.capacity))
    ) {
      errors.push(t("events.validation.ticketsExceedCapacity"));
    }

    return errors;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      setCreateError(errors[0]);
      return;
    }
    setCreateLoading(true);
    setCreateError(null);

    try {
      // Create FormData object
      const formData = new FormData();

      // Debug log the form state
      console.log("Form state before submission:", form);

      // Add all form fields with proper type conversion
      Object.entries(form).forEach(([key, value]) => {
        if (key === "image" && value instanceof File) {
          console.log("Adding image file:", value.name, value.type, value.size);
          formData.append("image", value);
        } else if (key === "date" && typeof value === "string") {
          const dateValue = new Date(value).toISOString();
          console.log("Adding date:", dateValue);
          formData.append("date", dateValue);
        } else if (
          key === "price" ||
          key === "capacity" ||
          key === "availableTickets"
        ) {
          const numValue = Math.floor(Number(value));
          if (!isNaN(numValue)) {
            console.log(`Adding ${key}:`, numValue);
            formData.append(key, numValue.toString());
          }
        } else if (key !== "image" && value !== null) {
          console.log(`Adding ${key}:`, value);
          formData.append(key, String(value));
        }
      });

      // Debug log the FormData contents
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Create event
      const res = await api.post("/admin/events", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response from server:", res.data);

      // Update state and show success message
      setEvents((prev) => [res.data.data.newDoc, ...prev]);
      setOpenCreate(false);
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
      setSnackbar({
        open: true,
        message: t("admin.success.eventCreated"),
        severity: "success",
      });
    } catch (err: any) {
      console.error("Error response:", err.response?.data);
      console.error("Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        headers: err.response?.headers,
        data: err.response?.data,
      });
      const errorMessage =
        err.response?.data?.message || t("admin.error.createEvent");
      setCreateError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
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
    // Set image preview from imgUrl
    setImagePreview(event.imgUrl || null);
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

    try {
      // Create FormData object
      const formData = new FormData();

      // Debug log the form state
      console.log("Form state before update:", form);

      // Add all form fields with proper type conversion
      Object.entries(form).forEach(([key, value]) => {
        if (key === "image" && value instanceof File) {
          console.log("Adding image file:", value.name, value.type, value.size);
          formData.append("image", value);
        } else if (key === "date" && typeof value === "string") {
          const dateValue = new Date(value).toISOString();
          console.log("Adding date:", dateValue);
          formData.append("date", dateValue);
        } else if (
          key === "price" ||
          key === "capacity" ||
          key === "availableTickets"
        ) {
          const numValue = Math.floor(Number(value));
          if (!isNaN(numValue)) {
            console.log(`Adding ${key}:`, numValue);
            formData.append(key, numValue.toString());
          }
        } else if (key !== "image" && value !== null) {
          console.log(`Adding ${key}:`, value);
          formData.append(key, String(value));
        }
      });

      // Debug log the FormData contents
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Update event
      const res = await api.patch(
        `/admin/events/${selectedEvent._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Response from server:", res.data);

      // Update state and show success message
      setEvents((prev) =>
        prev.map((event) =>
          event._id === selectedEvent._id ? res.data.data.doc : event
        )
      );
      setOpenEdit(false);
      setSelectedEvent(null);
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
      setSnackbar({
        open: true,
        message: t("admin.success.eventUpdated"),
        severity: "success",
      });
    } catch (err: any) {
      console.error("Error response:", err.response?.data);
      console.error("Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        headers: err.response?.headers,
        data: err.response?.data,
      });
      const errorMessage =
        err.response?.data?.message || t("admin.error.updateEvent");
      setEditError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    const eventToDelete = events.find((e) => e._id === eventId);
    if (eventToDelete) {
      setDeleteDialog(eventToDelete);
    }
  };

  const handleConfirmDelete = async (eventId: string) => {
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/events/${eventId}`);
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
      setSnackbar({
        open: true,
        message: t("admin.success.eventDeleted"),
        severity: "success",
      });
    } catch (err: any) {
      console.error("Error response:", err.response?.data);
      setError(err.response?.data?.message || "Failed to delete event");
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t("admin.error.deleteEvent"),
        severity: "error",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialog(null);
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

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setStatusFilter("");
    setDateRange({ start: null, end: null });
    setRowsPerPage(10);
    setPage(1);
  };

  const handleCloseDialog = () => {
    setOpenCreate(false);
    setOpenEdit(false);
    setSelectedEvent(null);
    setImagePreview(null);
    setCreateError(null);
    setEditError(null);
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
          {t("admin.manageEvents")}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenCreate}
        >
          {t("admin.createEvent")}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters Section */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        flexWrap="wrap"
        mb={3}
      >
        <TextField
          label={t("admin.search")}
          value={searchQuery}
          onChange={handleSearchChange}
          size="small"
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
          }}
          sx={{ minWidth: 180, maxWidth: 220, flex: "1 1 180px" }}
        />
        <FormControl
          sx={{ minWidth: 140, maxWidth: 180, flex: "1 1 140px" }}
          size="small"
        >
          <InputLabel>{t("events.category")}</InputLabel>
          <Select
            value={categoryFilter}
            label={t("events.category")}
            onChange={handleCategoryFilterChange}
          >
            <MenuItem value="">{t("admin.all")}</MenuItem>
            {CATEGORY_OPTIONS.map((category) => (
              <MenuItem key={category} value={category}>
                {t(`events.categories.${category}`) !==
                `events.categories.${category}`
                  ? t(`events.categories.${category}`)
                  : category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl
          sx={{ minWidth: 120, maxWidth: 150, flex: "1 1 120px" }}
          size="small"
        >
          <InputLabel>{t("admin.status")}</InputLabel>
          <Select
            value={statusFilter}
            label={t("admin.status")}
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="">{t("admin.all")}</MenuItem>
            <MenuItem value="active">{t("admin.active")}</MenuItem>
            <MenuItem value="inactive">{t("admin.inactive")}</MenuItem>
          </Select>
        </FormControl>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label={t("events.startDate")}
            value={dateRange.start}
            onChange={(date) => handleDateRangeChange("start", date)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                sx: { minWidth: 120, maxWidth: 160, flex: "1 1 120px" },
              },
            }}
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label={t("events.endDate")}
            value={dateRange.end}
            onChange={(date) => handleDateRangeChange("end", date)}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                sx: { minWidth: 120, maxWidth: 160, flex: "1 1 120px" },
              },
            }}
          />
        </LocalizationProvider>
        <FormControl
          sx={{ minWidth: 90, maxWidth: 120, flex: "1 1 90px" }}
          size="small"
        >
          <InputLabel>{t("admin.rows")}</InputLabel>
          <Select
            value={rowsPerPage.toString()}
            label={t("admin.rows")}
            onChange={handleRowsPerPageChange}
          >
            {[5, 10, 25, 50].map((n) => (
              <MenuItem key={n} value={n.toString()}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleResetFilters}
          sx={{ height: 40, minWidth: 120 }}
        >
          {t("admin.resetFilters", "Reset Filters")}
        </Button>
      </Stack>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", verticalAlign: "middle" }}
              >
                <Tooltip title={t("events.image")}>
                  <ImageIcon fontSize="small" />
                </Tooltip>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", verticalAlign: "middle" }}>
                {t("events.title")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", verticalAlign: "middle" }}>
                {t("events.date")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", verticalAlign: "middle" }}>
                {t("events.location")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", verticalAlign: "middle" }}>
                {t("events.price")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", verticalAlign: "middle" }}>
                {t("events.category")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", verticalAlign: "middle" }}>
                {t("events.capacity")}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", verticalAlign: "middle" }}
              >
                {t("events.available")}
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", verticalAlign: "middle" }}>
                {t("events.status")}
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: "bold", verticalAlign: "middle" }}
              >
                {t("events.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : paginatedEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">
                    {t("admin.noData")}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedEvents.map((event) => {
                // Use the imgUrl virtual field from the backend if available
                const imageUrl = event.imgUrl || event.image || "";
                return (
                  <TableRow key={event._id} hover>
                    <TableCell align="center">
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
                            mx: "auto",
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
                            mx: "auto",
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
                        label={t(`events.categories.${event.category}`)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{event.capacity}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`left ${event.availableTickets}`}
                        size="small"
                        color={
                          event.availableTickets === 0
                            ? "error"
                            : event.availableTickets < event.capacity / 2
                            ? "warning"
                            : "success"
                        }
                        sx={{ fontWeight: "bold", px: 1.5 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          event.isActive
                            ? t("admin.active")
                            : t("admin.inactive")
                        }
                        color={event.isActive ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <Tooltip title={t("admin.edit")}>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => handleOpenEdit(event)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("admin.delete")}>
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
              })
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
          <Typography color="inherit">{t("admin.loading")}</Typography>
        </Stack>
      </Backdrop>

      {/* Create Event Dialog */}
      <Dialog
        open={openCreate || openEdit}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        keepMounted={false}
        disablePortal={false}
        aria-labelledby="event-dialog-title"
      >
        <DialogTitle id="event-dialog-title">
          {openCreate ? t("admin.createEvent") : t("admin.editEvent")}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label={t("events.title")}
              name="title"
              value={form.title}
              onChange={handleFormChange}
              error={Boolean(
                validateForm().find((err) => err.includes("title"))
              )}
              helperText={validateForm().find((err) => err.includes("title"))}
            />
            <TextField
              fullWidth
              label={t("events.description")}
              name="description"
              value={form.description}
              onChange={handleFormChange}
              error={Boolean(
                validateForm().find((err) => err.includes("description"))
              )}
              helperText={validateForm().find((err) =>
                err.includes("description")
              )}
              multiline
              rows={4}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label={t("events.date")}
                    value={form.date ? new Date(form.date) : null}
                    onChange={(date) =>
                      handleFormChange({
                        target: {
                          name: "date",
                          value: date?.toISOString() || "",
                        },
                      } as any)
                    }
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("events.location")}
                  name="location"
                  value={form.location}
                  error={Boolean(
                    validateForm().find((err) => err.includes("location"))
                  )}
                  helperText={validateForm().find((err) =>
                    err.includes("location")
                  )}
                  onChange={handleFormChange}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("events.price")}
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleFormChange}
                  error={Boolean(
                    validateForm().find((err) => err.includes("price"))
                  )}
                  helperText={validateForm().find((err) =>
                    err.includes("price")
                  )}
                  InputProps={{
                    startAdornment: "$",
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  error={Boolean(
                    validateForm().find((err) => err.includes("category"))
                  )}
                >
                  <InputLabel>{t("events.category")}</InputLabel>
                  <Select
                    name="category"
                    value={form.category}
                    label={t("events.category")}
                    onChange={handleFormChange}
                  >
                    {CATEGORY_OPTIONS.map((category) => (
                      <MenuItem key={category} value={category}>
                        {t(`events.categories.${category}`) !==
                        `events.categories.${category}`
                          ? t(`events.categories.${category}`)
                          : category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("events.capacity")}
                  name="capacity"
                  type="number"
                  value={form.capacity}
                  onChange={handleFormChange}
                  error={Boolean(
                    validateForm().find((err) => err.includes("capacity"))
                  )}
                  helperText={validateForm().find((err) =>
                    err.includes("capacity")
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("events.availableTickets")}
                  name="availableTickets"
                  type="number"
                  value={form.availableTickets}
                  onChange={handleFormChange}
                  error={Boolean(
                    validateForm().find((err) => err.includes("tickets"))
                  )}
                  helperText={validateForm().find((err) =>
                    err.includes("tickets")
                  )}
                />
              </Grid>
            </Grid>
            <Box>
              <input
                accept="image/*"
                type="file"
                id="event-image"
                name="image"
                hidden
                onChange={handleFormChange}
              />
              <label htmlFor="event-image">
                <Button variant="outlined" component="span" startIcon={<Add />}>
                  {t("admin.uploadImage")}
                </Button>
              </label>
              {imagePreview && (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{
                    mt: 2,
                    maxWidth: "100%",
                    maxHeight: 200,
                    objectFit: "contain",
                  }}
                />
              )}
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isActive}
                  onChange={handleFormChange}
                  name="isActive"
                />
              }
              label={t("admin.active")}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            {t("admin.cancel")}
          </Button>
          <Button
            onClick={openCreate ? handleCreate : handleEdit}
            variant="contained"
            disabled={createLoading || editLoading}
            color="primary"
          >
            {createLoading || editLoading ? (
              <CircularProgress size={24} />
            ) : openCreate ? (
              t("admin.create")
            ) : (
              t("admin.save")
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteDialog)}
        onClose={() => setDeleteDialog(null)}
        aria-labelledby="delete-dialog-title"
        keepMounted={false}
        disablePortal={false}
      >
        <DialogTitle id="delete-dialog-title">
          {t("admin.confirmDelete")}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t("admin.deleteEventConfirm", { title: deleteDialog?.title })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)} color="inherit">
            {t("admin.cancel")}
          </Button>
          <Button
            onClick={() => handleConfirmDelete(deleteDialog?._id || "")}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : t("admin.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
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
