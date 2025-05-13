const validatorController = require('../../controllers/validatorController');
const { check } = require('express-validator');

// Validation middleware for booking an event
exports.bookEventValidator = [
  check('eventId').isMongoId().withMessage('Invalid event ID format'),

  check('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  validatorController.catchError,
];

// Validation middleware for updating a booking (Admin)
exports.updateBookingValidator = [
  check('id').isMongoId().withMessage('Invalid booking ID format'),

  check('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  check('status')
    .optional()
    .isIn(['confirmed', 'cancelled', 'pending'])
    .withMessage('Status must be either confirmed, cancelled, or pending'),

  check('totalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total price must be a positive number'),

  validatorController.catchError,
];

// Validation middleware for updating user's own booking
exports.updateMyBookingValidator = [
  check('id').isMongoId().withMessage('Invalid booking ID format'),

  check('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  check('status')
    .optional()
    .isIn(['cancelled'])
    .withMessage('You can only cancel your booking'),

  validatorController.catchError,
];

// Validation middleware for cancelling a booking
exports.cancelBookingValidator = [
  check('bookingId').isMongoId().withMessage('Invalid booking ID format'),

  validatorController.catchError,
];

// Validation middleware for getting booking by ID
exports.getBookingValidator = [
  check('id').isMongoId().withMessage('Invalid booking ID format'),

  validatorController.catchError,
];

// Validation middleware for getting user's bookings
exports.getUserBookingsValidator = [
  check('userId').isMongoId().withMessage('Invalid user ID format'),

  validatorController.catchError,
];

// Validation middleware for getting booking statistics
exports.getBookingStatisticsValidator = [
  check('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  check('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((endDate, { req }) => {
      if (
        req.body.startDate &&
        new Date(endDate) < new Date(req.body.startDate)
      ) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  validatorController.catchError,
];

// Validation middleware for deleting a booking
exports.deleteBookingValidator = [
  check('id').isMongoId().withMessage('Invalid booking ID format'),

  validatorController.catchError,
];
