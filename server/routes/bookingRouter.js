const express = require('express');
const {
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getUserBookings,
  getMyBookings,
  bookEvent,
  updateMyBooking,
  cancelBooking,
  getBookingStatistics,
} = require('../controllers/bookingController');

const {
  bookEventValidator,
  updateBookingValidator,
  updateMyBookingValidator,
  cancelBookingValidator,
  getBookingValidator,
  getUserBookingsValidator,
  getBookingStatisticsValidator,
  deleteBookingValidator,
} = require('../utils/validators/bookingValidators');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// User routes
router.get('/my-bookings', getMyBookings);
router.patch('/my-bookings/:id', updateMyBookingValidator, updateMyBooking);
router.post('/book-event/:eventId', bookEventValidator, bookEvent);
router.patch('/:bookingId/cancel', cancelBookingValidator, cancelBooking);

// Admin routes
router.use(restrictTo('admin'));
router.get('/', getAllBookings);
router.get('/statistics', getBookingStatisticsValidator, getBookingStatistics);
router.get('/user/:userId', getUserBookingsValidator, getUserBookings);
router
  .route('/:id')
  .get(getBookingValidator, getBooking)
  .patch(updateBookingValidator, updateBooking)
  .delete(deleteBookingValidator, deleteBooking);

module.exports = router;
