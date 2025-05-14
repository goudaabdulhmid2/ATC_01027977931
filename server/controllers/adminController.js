const catchAsync = require('express-async-handler');
const Booking = require('../models/bookingModel');
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');

// @desc Get dashboard statistics
// @route GET /api/v1/admin/dashboard/stats
// @access Private/Admin
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  // Get booking statistics
  const bookingStats = await Booking.aggregate([
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
        },
      },
    },
  ]);

  // Get event statistics
  const eventStats = await Event.aggregate([
    {
      $group: {
        _id: null,
        totalEvents: { $sum: 1 },
        upcomingEvents: {
          $sum: { $cond: [{ $gt: ['$date', new Date()] }, 1, 0] },
        },
        totalTickets: { $sum: '$totalTickets' },
        availableTickets: { $sum: '$availableTickets' },
      },
    },
  ]);

  // Get user statistics
  const userStats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$active', true] }, 1, 0] },
        },
        adminUsers: {
          $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] },
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      bookings: bookingStats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
      },
      events: eventStats[0] || {
        totalEvents: 0,
        upcomingEvents: 0,
        totalTickets: 0,
        availableTickets: 0,
      },
      users: userStats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
      },
    },
  });
});

// @desc Get booking and revenue trends for the last 6 months
// @route GET /api/v1/admin/bookings/trends
// @access Private/Admin
exports.getBookingTrends = catchAsync(async (req, res, next) => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // Aggregate bookings by month
  const trends = await Booking.aggregate([
    {
      $match: {
        bookingDate: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$bookingDate' },
          month: { $month: '$bookingDate' },
        },
        bookings: { $sum: 1 },
        revenue: { $sum: '$totalPrice' },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  // Format for frontend (fill missing months)
  const result = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const label = date.toLocaleString('default', { month: 'short' });
    const found = trends.find(
      (t) => t._id.year === year && t._id.month === month,
    );
    result.push({
      month: label,
      bookings: found ? found.bookings : 0,
      revenue: found ? found.revenue : 0,
    });
  }

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// @desc Get recent activity for admin dashboard
// @route GET /api/v1/admin/activity
// @access Private/Admin
exports.getRecentActivity = catchAsync(async (req, res, next) => {
  // Get recent events
  const recentEvents = await Event.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title createdAt');
  // Get recent users
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(3)
    .select('name createdAt');
  // Get recent bookings
  const recentBookings = await Booking.find()
    .sort({ bookingDate: -1 })
    .limit(3)
    .populate('event', 'title')
    .populate('user', 'name')
    .select('event user bookingDate');

  // Format activity
  const activity = [
    ...recentEvents.map((e) => ({
      type: 'event',
      text: `New event: ${e.title} created`,
      date: e.createdAt.toISOString().split('T')[0],
      createdAt: e.createdAt,
    })),
    ...recentUsers.map((u) => ({
      type: 'user',
      text: `User ${u.name} registered`,
      date: u.createdAt.toISOString().split('T')[0],
      createdAt: u.createdAt,
    })),
    ...recentBookings.map((b) => ({
      type: 'booking',
      text: `Booking for ${(b.event && b.event.title) || 'Event'} by ${(b.user && b.user.name) || 'User'}`,
      date: b.bookingDate.toISOString().split('T')[0],
      createdAt: b.bookingDate,
    })),
  ];

  // Sort by createdAt descending and take the 10 most recent
  activity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const recent = activity.slice(0, 10);

  res.status(200).json({
    status: 'success',
    data: recent,
  });
});
