const sharp = require('sharp');
const uuid = require('uuid');
const catchAsync = require('express-async-handler');
const fs = require('fs');
const path = require('path');

const handlerFactory = require('./handlerFactory');
const Event = require('../models/eventModel');
const uploadimageController = require('./uploadImageController');
const AppError = require('../utils/AppError');

// @desc Get all events
// @route GET /api/v1/events
// @access Public
exports.getAllEvents = handlerFactory.getAll(Event, '');

// @desc Get event by id
// @route GET /api/v1/events/:id
// @access Public
exports.getEvent = handlerFactory.getOne(Event);

// @desc Upload event image
exports.uploadEventImage = uploadimageController.uploadSingleImage('image');

// @desc Resize event image
exports.resizeEventImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // Create events directory if it doesn't exist
  const eventsDir = path.join(__dirname, '../public/img/events');
  if (!fs.existsSync(eventsDir)) {
    fs.mkdirSync(eventsDir, { recursive: true });
  }

  req.file.filename = `event-${uuid.v4()}-${Date.now()}.jpeg`;
  const filePath = path.join(eventsDir, req.file.filename);

  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(filePath);

  // Add image path to request body
  req.body.image = `img/events/${req.file.filename}`;
  next();
});

// @desc Create event
// @route POST /api/v1/events
// @access Private
exports.createEvent = handlerFactory.createOne(Event);

// @desc Assign creator to event
exports.assaignCreator = catchAsync(async (req, res, next) => {
  if (!req.body.createdBy) {
    req.body.createdBy = req.user.id;
  }
  next();
});

// @desc Update event
// @route PUT /api/v1/events/:id
// @access Private
exports.updateEvent = handlerFactory.updateOne(Event);

// @desc Delete event
// @route DELETE /api/v1/events/:id
// @access Private
exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }

  // Delete event image if exists
  if (event.image) {
    const imagePath = path.join(__dirname, '../public', event.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }

  await event.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
