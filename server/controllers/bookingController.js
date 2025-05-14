const catchAsync = require('express-async-handler');
const mongoose = require('mongoose');

const handlerFactory = require('./handlerFactory');
const Booking = require('../models/bookingModel');
const AppError = require('../utils/AppError');
const Event = require('../models/eventModel');
const User = require('../models/userModel');

// @desc   Get all bookings
// @route  GET /api/v1/bookings
// @access Private
// @role   Admin
exports.getAllBookings = handlerFactory.getAll(Booking, [
  { path: 'user', select: 'name email' },
  { path: 'event', select: 'title' },
]);

// @desc   Get booking by ID
// @route  GET /api/v1/bookings/:id
// @access Private
// @role   Admin
exports.getBooking = handlerFactory.getOne(Booking);

// @desc   Create a new booking
// @route  POST /api/v1/bookings
// @access Private
// @role   Admin
exports.createBooking = handlerFactory.createOne(Booking);

// @desc   Update a booking
// @route  PATCH /api/v1/bookings/:id
// @access Private
// @role   Admin
exports.updateBooking = catchAsync(async (req, res, next) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find booking and check if it exists
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      await session.abortTransaction();
      return next(new AppError('No booking found with that ID', 404));
    }

    // Get the associated event
    const event = await Event.findById(booking.event).session(session);
    if (!event) {
      await session.abortTransaction();
      return next(new AppError('Associated event not found', 404));
    }

    // Check if the event is in the future
    const isFutureEvent = new Date(event.date) > new Date();

    // Handle quantity changes
    if (req.body.quantity && req.body.quantity !== booking.quantity) {
      if (!isFutureEvent) {
        await session.abortTransaction();
        return next(
          new AppError('Cannot modify quantity for past events', 400),
        );
      }

      const quantityDifference = req.body.quantity - booking.quantity;

      // Check if we have enough tickets available
      if (
        quantityDifference > 0 &&
        event.availableTickets < quantityDifference
      ) {
        await session.abortTransaction();
        return next(new AppError('Not enough tickets available', 400));
      }

      // Update available tickets
      event.availableTickets -= quantityDifference;
      await event.save({ session });

      // Update total price
      req.body.totalPrice = event.price * req.body.quantity;
    }

    // Handle status changes
    if (req.body.status && req.body.status !== booking.status) {
      if (!isFutureEvent) {
        await session.abortTransaction();
        return next(new AppError('Cannot modify status for past events', 400));
      }

      // If changing from confirmed to cancelled, return tickets
      if (booking.status === 'confirmed' && req.body.status === 'cancelled') {
        event.availableTickets += booking.quantity;
        await event.save({ session });
      }
      // If changing from cancelled to confirmed, check availability
      else if (
        booking.status === 'cancelled' &&
        req.body.status === 'confirmed'
      ) {
        if (event.availableTickets < booking.quantity) {
          await session.abortTransaction();
          return next(new AppError('Not enough tickets available', 400));
        }
        event.availableTickets -= booking.quantity;
        await event.save({ session });
      }
    }

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
        session,
      },
    );

    // Commit transaction
    await session.commitTransaction();

    res.status(200).json({
      status: 'success',
      data: {
        booking: updatedBooking,
      },
    });
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    return next(new AppError(error.message, 500));
  } finally {
    // End the session
    session.endSession();
  }
});

// @desc   Delete a booking
// @route  DELETE /api/v1/bookings/:id
// @access Private
// @role   Admin
exports.deleteBooking = catchAsync(async (req, res, next) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find booking and check if it exists
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      await session.abortTransaction();
      return next(new AppError('No booking found with that ID', 404));
    }

    // Get the associated event
    const event = await Event.findById(booking.event).session(session);
    if (!event) {
      await session.abortTransaction();
      return next(new AppError('Associated event not found', 404));
    }

    // Check if the event is in the future
    const isFutureEvent = new Date(event.date) > new Date();

    // Only return tickets to available pool if the event is in the future
    if (isFutureEvent) {
      event.availableTickets += booking.quantity;
      await event.save({ session });
    }

    // Delete the booking
    await booking.deleteOne({ session });

    // Commit transaction
    await session.commitTransaction();

    res.status(204).json({
      status: 'success',
      data: null,
      message: isFutureEvent
        ? `Booking deleted successfully. ${booking.quantity} tickets returned to available pool.`
        : 'Booking deleted successfully.',
    });
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    return next(new AppError(error.message, 500));
  } finally {
    // End the session
    session.endSession();
  }
});

// @desc   Get all bookings for a specific user
// @route  GET /api/v1/bookings/user/:userId
// @access Private
// @role   Admin, User
exports.getUserBookings = catchAsync(async (req, res, next) => {
  const userId = req.params.userId;
  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  const bookings = await Booking.find({ user: req.params.userId });
  res.status(200).json({
    status: 'success',
    data: {
      bookings,
    },
  });

  if (!bookings) {
    return next(new AppError('No bookings found for this user', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      bookings,
    },
  });
});

// @desc Get user's bookings
// @route GET /api/v1/bookings/my-bookings
// @access Private
exports.getMyBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate({
      path: 'event',
      select: 'title date location image',
    })
    .sort('-bookingDate');

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings,
    },
  });
});

// @desc Book an Event
// @route POST /api/v1/bookings/book-event/:eventId
// @access Private
// @role User
exports.bookEvent = catchAsync(async (req, res, next) => {
  const { eventId } = req.params;
  const { quantity = 1 } = req.body; // Default to 1 ticket if not specified

  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the event exists
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return next(new AppError('No event found with that ID', 404));
    }

    // Check if event is active
    if (!event.isActive) {
      await session.abortTransaction();
      return next(new AppError('This event is not active', 400));
    }

    // Check if event is in the future
    if (new Date(event.date) < new Date()) {
      await session.abortTransaction();
      return next(new AppError('Cannot book past events', 400));
    }

    // Check if the user has already booked this event
    const hasBooked = await Booking.findOne({
      event: eventId,
      user: req.user.id,
    });
    if (hasBooked && hasBooked.status !== 'cancelled') {
      await session.abortTransaction();
      return next(new AppError('You have already booked this event', 400));
    }

    // Validate quantity
    if (quantity < 1) {
      await session.abortTransaction();
      return next(new AppError('Quantity must be at least 1', 400));
    }

    // Check ticket availability
    let quantityDiff = quantity;
    if (hasBooked && hasBooked.status === 'cancelled') {
      quantityDiff = quantity - hasBooked.quantity;
      if (quantityDiff > 0 && event.availableTickets < quantityDiff) {
        await session.abortTransaction();
        return next(
          new AppError(
            'Not enough tickets available for the new quantity',
            400,
          ),
        );
      }
    } else if (event.availableTickets < quantity) {
      await session.abortTransaction();
      return next(
        new AppError(
          `Only ${event.availableTickets} tickets available for this event`,
          400,
        ),
      );
    }

    // Calculate total price
    const totalPrice = event.price * quantity;

    let booking;
    if (!hasBooked) {
      // Create booking
      booking = await Booking.create(
        [
          {
            user: req.user.id,
            event: eventId,
            quantity,
            totalPrice,
            status: 'confirmed',
            bookingDate: new Date(),
          },
        ],
        { session },
      );
      booking = booking[0];
      event.availableTickets -= quantity;
    } else {
      // Re-confirm a cancelled booking, possibly with a new quantity
      hasBooked.status = 'confirmed';
      hasBooked.quantity = quantity;
      hasBooked.totalPrice = totalPrice;
      await hasBooked.save({ session });
      booking = hasBooked;
      event.availableTickets -= quantityDiff;
    }
    await event.save({ session });

    // Commit transaction
    await session.commitTransaction();

    res.status(201).json({
      status: 'success',
      data: {
        booking,
        message: `Successfully booked ${quantity} ticket(s) for ${event.title}`,
      },
    });
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    return next(new AppError(error.message, 500));
  } finally {
    // End the session
    session.endSession();
  }
});

// @desc Cancel a booking
// @route PATCH /api/v1/bookings/:bookingId/cancel
// @access Private
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.bookingId).session(
      session,
    );

    if (!booking) {
      await session.abortTransaction();
      return next(new AppError('No booking found with that ID', 404));
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.id) {
      await session.abortTransaction();
      return next(
        new AppError('You are not authorized to cancel this booking', 403),
      );
    }

    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      await session.abortTransaction();
      return next(new AppError('This booking is already cancelled', 400));
    }

    // Get event and check if it's in the future
    const event = await Event.findById(booking.event).session(session);
    if (new Date(event.date) < new Date()) {
      await session.abortTransaction();
      return next(new AppError('Cannot cancel booking for past events', 400));
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save({ session });

    // Return tickets to available pool
    event.availableTickets += booking.quantity;
    await event.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      status: 'success',
      data: {
        booking,
        message: 'Booking cancelled successfully',
      },
    });
  } catch (error) {
    await session.abortTransaction();
    return next(new AppError(error.message, 500));
  } finally {
    session.endSession();
  }
});

// @desc Get booking statistics
// @route GET /api/v1/bookings/statistics
// @access Private
// @role Admin
exports.getBookingStatistics = catchAsync(async (req, res, next) => {
  const stats = await Booking.aggregate([
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// @desc   Update user's own booking
// @route  PATCH /api/v1/bookings/my-bookings/:id
// @access Private
// @role   User
exports.updateMyBooking = catchAsync(async (req, res, next) => {
  // Start a session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find booking and check if it exists
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      await session.abortTransaction();
      return next(new AppError('No booking found with that ID', 404));
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.id) {
      await session.abortTransaction();
      return next(
        new AppError('You are not authorized to update this booking', 403),
      );
    }

    // Get the associated event
    const event = await Event.findById(booking.event).session(session);
    if (!event) {
      await session.abortTransaction();
      return next(new AppError('Associated event not found', 404));
    }

    // Check if the event is in the future
    const isFutureEvent = new Date(event.date) > new Date();
    if (!isFutureEvent) {
      await session.abortTransaction();
      return next(new AppError('Cannot modify booking for past events', 400));
    }

    // Users can only update quantity or cancel the booking
    const allowedUpdates = ['quantity', 'status'];
    const updates = Object.keys(req.body);

    // Check if user is trying to update unauthorized fields
    const isAllowed = updates.every((update) =>
      allowedUpdates.includes(update),
    );
    if (!isAllowed) {
      await session.abortTransaction();
      return next(
        new AppError('You can only update quantity or cancel the booking', 400),
      );
    }

    // Handle quantity changes
    if (req.body.quantity && req.body.quantity !== booking.quantity) {
      const quantityDifference = req.body.quantity - booking.quantity;

      // Check if we have enough tickets available
      if (
        quantityDifference > 0 &&
        event.availableTickets < quantityDifference
      ) {
        await session.abortTransaction();
        return next(new AppError('Not enough tickets available', 400));
      }

      // Update available tickets
      event.availableTickets -= quantityDifference;
      await event.save({ session });

      // Update total price
      req.body.totalPrice = event.price * req.body.quantity;
    }

    // Handle status changes - users can only cancel their bookings
    if (req.body.status && req.body.status !== booking.status) {
      if (req.body.status !== 'cancelled') {
        await session.abortTransaction();
        return next(new AppError('You can only cancel your booking', 400));
      }

      // If changing from confirmed to cancelled, return tickets
      if (booking.status === 'confirmed') {
        event.availableTickets += booking.quantity;
        await event.save({ session });
      }
    }

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
        session,
      },
    );

    // Commit transaction
    await session.commitTransaction();

    res.status(200).json({
      status: 'success',
      data: {
        booking: updatedBooking,
        message:
          req.body.status === 'cancelled'
            ? 'Booking cancelled successfully'
            : 'Booking updated successfully',
      },
    });
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    return next(new AppError(error.message, 500));
  } finally {
    // End the session
    session.endSession();
  }
});
