import React from "react";
import { Container, Typography, Box } from "@mui/material";

const Home = () => {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Event Management System
        </Typography>
        <Typography variant="body1">
          Browse events, make bookings, and manage your account.
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;
