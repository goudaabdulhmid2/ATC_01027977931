import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { login, clearError } from "../../store/slices/authSlice";
import { RootState, AppDispatch } from "../../store";
import api from "../../utils/axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password should be of minimum 6 characters length")
    .required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, user } = useSelector(
    (state: RootState) => state.auth
  );
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setpasswordConfirm] = useState("");
  const [hasNavigated, setHasNavigated] = useState(false);
  const { t } = useTranslation();

  const from = (location.state as any)?.from?.pathname || "/";

  useEffect(() => {
    if (user && !hasNavigated) {
      setHasNavigated(true);
      if (user.role === "admin") {
        navigate("/admin/", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
    return () => {
      dispatch(clearError());
    };
  }, [user, navigate, from, dispatch, hasNavigated]);

  useEffect(() => {
    if (error) {
      let message = error;
      if (
        message.toLowerCase().includes("invalid") ||
        message.toLowerCase().includes("unauthorized") ||
        message.toLowerCase().includes("401")
      ) {
        message = "Invalid email or password. Please try again.";
      }
      toast.error(message);
    }
  }, [error]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(login(values));
    },
  });

  const handleForgotPassword = async () => {
    try {
      setForgotPasswordLoading(true);
      await api.post("/auth/forgotPassword", {
        email: forgotPasswordEmail,
      });
      toast.success("Reset code sent to your email");
      setResetStep(2);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to send reset instructions"
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setForgotPasswordLoading(true);
      await api.post("/auth/verifyResetCode", {
        code: resetCode,
      });
      toast.success("Code verified successfully");
      setResetStep(3);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to verify reset code"
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setForgotPasswordLoading(true);
      await api.post("/auth/resetPassword", {
        email: forgotPasswordEmail,
        password: newPassword,
        passwordConfirm: passwordConfirm,
      });
      toast.success("Password reset successfully");
      setForgotPasswordOpen(false);
      resetForgotPasswordState();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const resetForgotPasswordState = () => {
    setForgotPasswordEmail("");
    setResetCode("");
    setNewPassword("");
    setpasswordConfirm("");
    setResetStep(1);
  };

  const handleCloseDialog = () => {
    setForgotPasswordOpen(false);
    resetForgotPasswordState();
  };

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
            {t("auth.signIn")}
          </Typography>
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              fullWidth
              id="email"
              name="email"
              label={t("auth.email")}
              autoComplete="email"
              autoFocus
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
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
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
              {loading ? t("common.loading") : t("auth.signIn")}
            </Button>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Link
                component="button"
                variant="body2"
                onClick={() => setForgotPasswordOpen(true)}
                sx={{ textAlign: "left" }}
              >
                {t("auth.forgotPassword")}
              </Link>
              <Link component={RouterLink} to="/register" variant="body2">
                {t("auth.dontHaveAccount")}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog
        open={forgotPasswordOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t("auth.resetPassword")}</DialogTitle>
        <DialogContent>
          <Stepper activeStep={resetStep - 1} sx={{ mb: 3, mt: 2 }}>
            <Step>
              <StepLabel>{t("auth.requestReset")}</StepLabel>
            </Step>
            <Step>
              <StepLabel>{t("auth.verifyCode")}</StepLabel>
            </Step>
            <Step>
              <StepLabel>{t("auth.newPassword")}</StepLabel>
            </Step>
          </Stepper>

          {resetStep === 1 && (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {t("auth.enterEmail")}
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                id="forgot-email"
                label={t("auth.email")}
                type="email"
                fullWidth
                variant="outlined"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
              />
            </>
          )}

          {resetStep === 2 && (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {t("auth.enterResetCode")}
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                id="reset-code"
                label={t("auth.resetCode")}
                fullWidth
                variant="outlined"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
              />
            </>
          )}

          {resetStep === 3 && (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {t("auth.enterNewPassword")}
              </Typography>
              <TextField
                margin="dense"
                id="new-password"
                label={t("auth.newPassword")}
                type="password"
                fullWidth
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                id="confirm-password"
                label={t("auth.confirmPassword")}
                type="password"
                fullWidth
                variant="outlined"
                value={passwordConfirm}
                onChange={(e) => setpasswordConfirm(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t("common.cancel")}</Button>
          {resetStep === 1 && (
            <Button
              onClick={handleForgotPassword}
              disabled={!forgotPasswordEmail || forgotPasswordLoading}
            >
              {forgotPasswordLoading ? (
                <CircularProgress size={24} />
              ) : (
                t("auth.sendResetCode")
              )}
            </Button>
          )}
          {resetStep === 2 && (
            <Button
              onClick={handleVerifyCode}
              disabled={!resetCode || forgotPasswordLoading}
            >
              {forgotPasswordLoading ? (
                <CircularProgress size={24} />
              ) : (
                t("auth.verifyCode")
              )}
            </Button>
          )}
          {resetStep === 3 && (
            <Button
              onClick={handleResetPassword}
              disabled={
                !newPassword || !passwordConfirm || forgotPasswordLoading
              }
            >
              {forgotPasswordLoading ? (
                <CircularProgress size={24} />
              ) : (
                t("auth.resetPassword")
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;
