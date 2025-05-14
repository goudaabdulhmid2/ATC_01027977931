import React, { useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  CircularProgress,
  Grid,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError } from "../../store/slices/authSlice";
import { RootState, AppDispatch } from "../../store";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name should be of minimum 2 characters length")
    .required("Name is required"),
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password should be of minimum 6 characters length")
    .required("Password is required"),
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, user } = useSelector(
    (state: RootState) => state.auth
  );
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
    return () => {
      dispatch(clearError());
    };
  }, [user, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      let message = error;
      if (
        message.toLowerCase().includes("email") &&
        message.toLowerCase().includes("exist")
      ) {
        message =
          "This email is already registered. Please use another email or log in.";
      }
      toast.error(message);
    }
  }, [error]);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(register(values));
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography component="h1" variant="h5">
            {t("auth.signUp")}
          </Typography>
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              fullWidth
              id="name"
              name="name"
              label={t("auth.name")}
              autoComplete="name"
              autoFocus
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              margin="normal"
              fullWidth
              id="email"
              name="email"
              label={t("auth.email")}
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label={t("auth.password")}
              type="password"
              id="password"
              autoComplete="new-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <TextField
              margin="normal"
              fullWidth
              name="passwordConfirm"
              label={t("auth.confirmPassword")}
              type="password"
              id="passwordConfirm"
              value={formik.values.passwordConfirm}
              onChange={formik.handleChange}
              error={
                formik.touched.passwordConfirm &&
                Boolean(formik.errors.passwordConfirm)
              }
              helperText={
                formik.touched.passwordConfirm && formik.errors.passwordConfirm
              }
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? t("common.loading") : t("auth.signUp")}
            </Button>
            <Box sx={{ textAlign: "center" }}>
              <Link component={RouterLink} to="/login" variant="body2">
                {t("auth.alreadyHaveAccount")}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
