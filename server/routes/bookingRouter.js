const express = require('express');
const {
  getMyBookings,
  bookEvent,
  updateMyBooking,
  cancelBooking,
} = require('../controllers/bookingController');

const {
  bookEventValidator,
  updateMyBookingValidator,
  cancelBookingValidator,
} = require('../utils/validators/bookingValidators');

const { protect } = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// User routes
router.get('/my-bookings', getMyBookings);
router.patch('/my-bookings/:id', updateMyBookingValidator, updateMyBooking);
router.post('/book-event/:eventId', bookEventValidator, bookEvent);
router.patch('/:bookingId/cancel', cancelBookingValidator, cancelBooking);

module.exports = router;
