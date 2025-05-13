const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Event price is required'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String,
    },
    category: {
      type: String,
      enum: [
        'Music',
        'Sports',
        'Arts',
        'Food',
        'Business',
        'Technology',
        'Other',
      ],
      default: 'Other',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    capacity: {
      type: Number,
      required: [true, 'Event capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    availableTickets: {
      type: Number,
      required: [true, 'Available tickets count is required'],
      min: [0, 'Available tickets cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

// Index for text search
eventSchema.index({
  title: 'text',
  description: 'text',
  location: 'text',
  category: 'text',
  tags: 'text',
});

// Populate createdBy field
eventSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'createdBy',
    select: 'name',
  });
  next();
});

// Prevent duplicate events with same title and date
eventSchema.index({ title: 1, date: 1 }, { unique: true });

// Virtual for checking if event is sold out
eventSchema.virtual('isSoldOut').get(function () {
  return this.availableTickets === 0;
});

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function () {
  return this.date > new Date();
});

eventSchema.virtual('imgUrl').get(function () {
  return this.image ? `${process.env.BASE_URL}/${this.image}` : '';
});

// Pre-save middleware to ensure availableTickets doesn't exceed capacity
eventSchema.pre('save', function (next) {
  if (this.availableTickets > this.capacity) {
    this.availableTickets = this.capacity;
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
