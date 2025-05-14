import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAppSelector } from "../store/hooks";

const GlobalLoader: React.FC = () => {
  const { loading, message } = useAppSelector((state) => state.loader);

  if (!loading) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "rgba(255,255,255,0.8)",
        zIndex: 2000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
    >
      <CircularProgress size={64} color="primary" />
      {message && (
        <Typography
          variant="h6"
          sx={{
            mt: 2,
            color: "text.secondary",
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default GlobalLoader;
