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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Pagination,
} from "@mui/material";
import { Edit, Delete, CheckCircle, Cancel } from "@mui/icons-material";
import api from "../../utils/axios";
import { useTranslation } from "react-i18next";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

const ROLE_OPTIONS = ["admin", "user"];

const AdminUsers: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "user",
    active: true,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    userId: "",
    userName: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get("/admin/users");
        setUsers(res.data.data.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (_: any, value: number) => {
    setPage(value);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setRowsPerPage(10);
    setPage(1);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter ? u.role === roleFilter : true;
    const matchesStatus =
      statusFilter === "active"
        ? u.active
        : statusFilter === "inactive"
        ? !u.active
        : true;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    });
    setEditDialog(true);
  };
  const handleCloseEdit = () => {
    setEditDialog(false);
    setSelectedUser(null);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setEditLoading(true);
    try {
      await api.patch(`/admin/users/${selectedUser._id}`, editForm);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id ? { ...u, ...editForm } : u
        )
      );
      setSnackbar({
        open: true,
        message: t("admin.userUpdated", { name: editForm.name }),
        severity: "success",
      });
      setEditDialog(false);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t("admin.errorUpdatingUser"),
        severity: "error",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    setEditLoading(true);
    try {
      await api.patch(`/admin/users/${user._id}`, { active: !user.active });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, active: !user.active } : u
        )
      );
      setSnackbar({
        open: true,
        message: !user.active
          ? t("admin.userActivated", { name: user.name })
          : t("admin.userDeactivated", { name: user.name }),
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t("admin.errorUpdatingUser"),
        severity: "error",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    setConfirmDialog({ open: true, userId, userName });
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/users/${confirmDialog.userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== confirmDialog.userId));
      setSnackbar({
        open: true,
        message: t("admin.userDeleted", { name: confirmDialog.userName }),
        severity: "success",
      });
      setConfirmDialog({ open: false, userId: "", userName: "" });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || t("admin.errorDeletingUser"),
        severity: "error",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ open: false, userId: "", userName: "" });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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
          {t("admin.manageUsers")}
        </Typography>
        <Stack direction="row" spacing={2}>
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
              value={search}
              onChange={handleSearchChange}
              size="small"
              sx={{ minWidth: 180, maxWidth: 220, flex: "1 1 180px" }}
            />
            <TextField
              select
              label={t("admin.role", "Role")}
              value={roleFilter}
              onChange={handleRoleFilterChange}
              size="small"
              sx={{ minWidth: 120, maxWidth: 150, flex: "1 1 120px" }}
            >
              <MenuItem value="">{t("admin.all")}</MenuItem>
              {ROLE_OPTIONS.map((role) => (
                <MenuItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={t("admin.status")}
              value={statusFilter}
              onChange={handleStatusFilterChange}
              size="small"
              sx={{ minWidth: 120, maxWidth: 150, flex: "1 1 120px" }}
            >
              <MenuItem value="">{t("admin.all")}</MenuItem>
              <MenuItem value="active">{t("admin.active")}</MenuItem>
              <MenuItem value="inactive">{t("admin.inactive")}</MenuItem>
            </TextField>
            <TextField
              select
              label={t("admin.rows")}
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              size="small"
              sx={{ minWidth: 90, maxWidth: 120, flex: "1 1 90px" }}
            >
              {[5, 10, 25, 50].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleResetFilters}
              sx={{ height: 40, minWidth: 120 }}
            >
              {t("admin.resetFilters", "Reset Filters")}
            </Button>
          </Stack>
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
              <TableCell>{t("auth.name")}</TableCell>
              <TableCell>{t("auth.email")}</TableCell>
              <TableCell>{t("admin.role", "Role")}</TableCell>
              <TableCell>{t("admin.status")}</TableCell>
              <TableCell align="right">{t("admin.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">
                    {t("admin.noData")}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user._id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`admin.roles.${user.role}`)}
                      color={user.role === "admin" ? "primary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        user.active ? t("admin.active") : t("admin.inactive")
                      }
                      color={user.active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Tooltip title={t("admin.edit")}>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenEdit(user)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={
                          user.active
                            ? t("admin.deactivate")
                            : t("admin.activate")
                        }
                      >
                        <IconButton
                          color={user.active ? "success" : "default"}
                          size="small"
                          onClick={() => handleToggleActive(user)}
                          disabled={editLoading}
                        >
                          {user.active ? <Cancel /> : <CheckCircle />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("admin.delete")}>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(user._id, user.name)}
                          disabled={deleteLoading}
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
          count={Math.ceil(filteredUsers.length / rowsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
      {/* Edit User Dialog */}
      <Dialog
        open={editDialog}
        onClose={handleCloseEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("admin.editUser")}</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={t("auth.name")}
                name="name"
                value={editForm.name}
                onChange={handleEditFormChange}
              />
              <TextField
                fullWidth
                label={t("auth.email")}
                name="email"
                value={editForm.email}
                onChange={handleEditFormChange}
              />
              <TextField
                select
                fullWidth
                label={t("admin.role")}
                name="role"
                value={editForm.role}
                onChange={handleEditFormChange}
              >
                {ROLE_OPTIONS.map((role) => (
                  <MenuItem key={role} value={role}>
                    {t(`admin.roles.${role}`)}
                  </MenuItem>
                ))}
              </TextField>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editForm.active}
                    onChange={handleEditFormChange}
                    name="active"
                  />
                }
                label={t("admin.active")}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEdit}>{t("admin.cancel")}</Button>
            <Button type="submit" variant="contained" disabled={editLoading}>
              {editLoading ? <CircularProgress size={24} /> : t("admin.save")}
            </Button>
          </DialogActions>
        </form>
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
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("admin.confirmDelete")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("admin.deleteUserConfirm", { name: confirmDialog.userName })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleteLoading}>
            {t("admin.cancel")}
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : t("admin.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
