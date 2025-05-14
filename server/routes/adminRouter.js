const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const eventController = require('../controllers/eventController');
const userController = require('../controllers/userController');
const adminController = require('../controllers/adminController');
const eventValidator = require('../utils/validators/eventValidators');
const userValidator = require('../utils/validators/userValidators');
const bookingValidator = require('../utils/validators/bookingValidators');

const router = express.Router();

// Protect all routes and restrict to admin only
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard Statistics
router.get('/dashboard/stats', adminController.getDashboardStats);
// Recent Activity
router.get('/activity', adminController.getRecentActivity);

// Event Management
router.get(
  '/events',
  eventValidator.getAllEventsValidator,
  eventController.getAllEvents,
);
router.post(
  '/events',
  eventController.uploadEventImage,
  eventController.resizeEventImage,
  eventController.assaignCreator,
  eventValidator.createEventValidator,
  eventController.createEvent,
);
router.patch(
  '/events/:id',
  eventController.uploadEventImage,
  eventController.resizeEventImage,
  eventValidator.updateEventValidator,
  eventController.updateEvent,
);
router.delete(
  '/events/:id',
  eventValidator.deleteEventValidator,
  eventController.deleteEvent,
);

// User Management
router.get('/users', userController.getUsers);
router.get(
  '/users/:id',
  userValidator.getUserValidator,
  userController.getUser,
);
router.post(
  '/users',
  userController.uploadProfileImage,
  userController.resizeProfileImage,
  userValidator.createUserValidator,
  userController.creatUser,
);
router.patch(
  '/users/:id',
  userController.uploadProfileImage,
  userController.resizeProfileImage,
  userValidator.updateUserValidator,

  userController.updateUser,
);
router.delete(
  '/users/:id',
  userValidator.deletetUserValidator,
  userController.deleteUser,
);
router.patch(
  '/users/changePassword/:id',
  userValidator.changePasswordValidator,
  userController.changeUserPassword,
);

// Booking Management
router.get('/bookings', bookingController.getAllBookings);
router.get(
  '/bookings/statistics',
  bookingValidator.getBookingStatisticsValidator,
  bookingController.getBookingStatistics,
);
router.get(
  '/bookings/user/:userId',
  bookingValidator.getUserBookingsValidator,
  bookingController.getUserBookings,
);
router.get('/bookings/trends', adminController.getBookingTrends);
router.get(
  '/bookings/:id',
  bookingValidator.getBookingValidator,
  bookingController.getBooking,
);
router.patch(
  '/bookings/:id',
  bookingValidator.updateBookingValidator,
  bookingController.updateBooking,
);
router.delete(
  '/bookings/:id',
  bookingValidator.deleteBookingValidator,
  bookingController.deleteBooking,
);

module.exports = router;
