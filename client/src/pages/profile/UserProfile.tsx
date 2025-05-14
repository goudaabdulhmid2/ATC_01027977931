import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  Stack,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../../utils/axios";
import { getCurrentUser } from "../../store/slices/authSlice";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
});

const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(6, "Password should be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm your new password"),
});

const UserProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.profileImage || null
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        if (selectedImage) {
          const formData = new FormData();
          formData.append("name", values.name);
          formData.append("email", values.email);
          formData.append("profileImage", selectedImage);
          await api.patch("/users/updateMe", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await api.patch("/users/updateMe", {
            name: values.name,
            email: values.email,
          });
        }
        setSuccess("Profile updated successfully!");
        dispatch(getCurrentUser());
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to update profile");
      } finally {
        setLoading(false);
      }
    },
  });

  const pwFormik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setPwLoading(true);
      setPwError(null);
      setPwSuccess(null);
      try {
        await api.patch("/users/updateMyPassword", {
          password: values.newPassword,
          currentPassword: values.currentPassword,
          passwordConfirm: values.confirmPassword,
        });
        setPwSuccess("Password updated successfully!");
        resetForm();
      } catch (err: any) {
        setPwError(err.response?.data?.message || "Failed to update password");
      } finally {
        setPwLoading(false);
      }
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  if (!user) return null;

  return (
    <Box maxWidth={500} mx="auto" mt={4}>
      <Paper sx={{ p: 4 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5">My Profile</Typography>
          <Avatar
            src={imagePreview || user.imgUrl || user.profileImage || undefined}
            sx={{ width: 80, height: 80, mb: 1 }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </Avatar>
          <Button variant="outlined" component="label">
            Change Avatar
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </Button>
          <form onSubmit={formik.handleSubmit} style={{ width: "100%" }}>
            <Stack spacing={2}>
              <TextField
                label="Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                fullWidth
              />
              <TextField
                label="Role"
                value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Save Changes"}
              </Button>
            </Stack>
          </form>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" align="center">
            Change Password
          </Typography>
          <form onSubmit={pwFormik.handleSubmit} style={{ width: "100%" }}>
            <Stack spacing={2}>
              <TextField
                label="Current Password"
                name="currentPassword"
                type="password"
                value={pwFormik.values.currentPassword}
                onChange={pwFormik.handleChange}
                error={
                  pwFormik.touched.currentPassword &&
                  Boolean(pwFormik.errors.currentPassword)
                }
                helperText={
                  pwFormik.touched.currentPassword &&
                  pwFormik.errors.currentPassword
                }
                fullWidth
              />
              <TextField
                label="New Password"
                name="newPassword"
                type="password"
                value={pwFormik.values.newPassword}
                onChange={pwFormik.handleChange}
                error={
                  pwFormik.touched.newPassword &&
                  Boolean(pwFormik.errors.newPassword)
                }
                helperText={
                  pwFormik.touched.newPassword && pwFormik.errors.newPassword
                }
                fullWidth
              />
              <TextField
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={pwFormik.values.confirmPassword}
                onChange={pwFormik.handleChange}
                error={
                  pwFormik.touched.confirmPassword &&
                  Boolean(pwFormik.errors.confirmPassword)
                }
                helperText={
                  pwFormik.touched.confirmPassword &&
                  pwFormik.errors.confirmPassword
                }
                fullWidth
              />
              {pwError && <Alert severity="error">{pwError}</Alert>}
              {pwSuccess && <Alert severity="success">{pwSuccess}</Alert>}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={pwLoading}
              >
                {pwLoading ? <CircularProgress size={24} /> : "Change Password"}
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Box>
  );
};

export default UserProfile;
