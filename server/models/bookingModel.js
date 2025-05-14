const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user'],
    },
    event: {
      type: mongoose.Schema.ObjectId,
      ref: 'Event',
      required: [true, 'Booking must belong to an event'],
    },
    quantity: {
      type: Number,
      required: [true, 'Booking must have a quantity'],
      min: [1, 'Quantity must be at least 1'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Booking must have a total price'],
      min: [0, 'Total price must be a positive number'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Index for preventing duplicate bookings
bookingSchema.index({ event: 1, user: 1 }, { unique: true });

// Pre-save middleware to ensure booking date is not in the past
bookingSchema.pre('save', async function (next) {
  const event = await this.model('Event').findById(this.event);
  if (new Date(event.date) < new Date()) {
    next(new Error('Cannot book past events'));
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
