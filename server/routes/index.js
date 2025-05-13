const userRouter = require('./userRouter');
const authRouter = require('./authRouter');
const eventRouter = require('./eventRouter');
const bookingRouter = require('./bookingRouter');

const mountRoutes = (app) => {
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/events', eventRouter);
  app.use('/api/v1/bookings', bookingRouter);
};

module.exports = mountRoutes;
