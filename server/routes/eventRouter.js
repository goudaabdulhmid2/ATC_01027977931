const express = require('express');
const eventController = require('../controllers/eventController');
const authController = require('../controllers/authController');
const eventValidator = require('../utils/validators/eventValidators');

const router = express.Router();

router
  .route('/')
  .get(eventValidator.getAllEventsValidator, eventController.getAllEvents)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    eventValidator.createEventValidator,
    eventController.assaignCreator,
    eventController.uploadEventImage,
    eventController.resizeEventImage,
    eventController.createEvent,
  );

router
  .route('/:id')
  .get(eventValidator.getEventValidator, eventController.getEvent)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    eventValidator.updateEventValidator,
    eventController.uploadEventImage,
    eventController.resizeEventImage,
    eventController.updateEvent,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    eventValidator.deleteEventValidator,
    eventController.deleteEvent,
  );

module.exports = router;
