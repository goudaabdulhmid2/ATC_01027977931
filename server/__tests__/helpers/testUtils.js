const jwt = require('jsonwebtoken');
const User = require('../../models/userModel');

const generateTestUser = async (role = 'user') => {
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role,
  });
  return user;
};

const generateTestToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createTestEvent = async (Event, userId) => {
  return await Event.create({
    title: 'Test Event',
    description: 'Test Description',
    date: new Date(),
    location: 'Test Location',
    capacity: 100,
    price: 50,
    createdBy: userId,
  });
};

const createTestBooking = async (Booking, userId, eventId) => {
  return await Booking.create({
    user: userId,
    event: eventId,
    status: 'pending',
    numberOfTickets: 2,
  });
};

module.exports = {
  generateTestUser,
  generateTestToken,
  createTestEvent,
  createTestBooking,
};
