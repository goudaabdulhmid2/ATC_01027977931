const express = require('express');
const eventController = require('../controllers/eventController');
const eventValidator = require('../utils/validators/eventValidators');

const router = express.Router();

router
  .route('/')
  .get(eventValidator.getAllEventsValidator, eventController.getAllEvents);

router
  .route('/:id')
  .get(eventValidator.getEventValidator, eventController.getEvent);

module.exports = router;
