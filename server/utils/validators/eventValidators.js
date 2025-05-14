const { check } = require('express-validator');
const catchAsync = require('express-async-handler');

const validatorController = require('../../controllers/validatorController');

exports.createEventValidator = [
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long'),
  check('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  check('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  check('location')
    .notEmpty()
    .withMessage('Location is required')
    .isString()
    .withMessage('Location must be a string'),
  check('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  check('image').optional().isString().withMessage('Invalid image URL'),
  check('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'Music',
      'Sports',
      'Arts',
      'Food',
      'Business',
      'Technology',
      'Other',
    ])
    .withMessage('Invalid category'),
  check('capacity')
    .notEmpty()
    .withMessage('Capacity is required')
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  check('availableTickets')
    .notEmpty()
    .withMessage('Available tickets count is required')
    .isInt({ min: 0 })
    .withMessage('Available tickets count must be a non-negative integer'),
  check('isActive')
    .notEmpty()
    .withMessage('Is active is required')
    .isBoolean()
    .withMessage('Is active must be a boolean'),
  validatorController.catchError,
];

exports.updateEventValidator = [
  check('id').isMongoId().withMessage('Invalid event ID'),
  check('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long'),
  check('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  check('date').optional().isISO8601().withMessage('Invalid date format'),
  check('location')
    .optional()
    .isString()
    .withMessage('Location must be a string'),
  check('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  check('image').optional().isString().withMessage('Invalid image URL'),
  check('category')
    .optional()
    .isIn([
      'Music',
      'Sports',
      'Arts',
      'Food',
      'Business',
      'Technology',
      'Other',
    ])
    .withMessage('Invalid category'),
  check('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  check('availableTickets')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Available tickets count must be a non-negative integer'),
  check('isActive')
    .optional()
    .isBoolean()
    .withMessage('Is active must be a boolean'),
  validatorController.catchError,
];

exports.deleteEventValidator = [
  check('id').isMongoId().withMessage('Invalid event ID'),
  validatorController.catchError,
];

exports.getEventValidator = [
  check('id').isMongoId().withMessage('Invalid event ID'),
  validatorController.catchError,
];

exports.getAllEventsValidator = [
  check('page').optional().isInt({ min: 1 }).withMessage('Invalid page number'),
  check('limit').optional().isInt({ min: 1 }).withMessage('Invalid limit'),
  check('sort').optional().isString().withMessage('Invalid sort'),
  check('fields').optional().isString().withMessage('Invalid fields'),
  validatorController.catchError,
];
