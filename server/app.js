const path = require('path');

const express = require('express');
const morgen = require('morgan');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const csrf = require('csurf');

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');
const mountRoutes = require('./routes');

const app = express();

// Enable other domains to access API
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_UR]
      : ['http://localhost:5173', 'http://192.168.56.1:3001'],
  methods: 'GET,POST,PUT,DELETE,PATCH',
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Serving static files from the /uploads directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve user images statically
app.use('/users', express.static(path.join(__dirname, 'public/img/users')));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  }),
);

// Parse cookies
app.use(cookieParser());

// Compress all response
app.use(compression());

// Trust proxy for Railway deployment - only trust Railway's proxy
app.set('trust proxy', 'loopback, linklocal, uniquelocal');

// General rate limiter for API routes
const limiter = rateLimit({
  validate: {
    trustProxy: false, // Disable the trust proxy validation since we configured it at app level
    xForwardedForHeader: false, // Disable X-Forwarded-For validation since we're behind Railway's proxy
  },
  window: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again in an 15 minutes!',
});

app.use('/api', limiter);

// Authentication-based rate limiter (login attempts)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req, res) => (req.user ? req.user.id : req.ip),
  message: 'Too many login attempts. Please try again later.',
});

app.use('/api/v1/auth/login', authLimiter);

// Apply data senitization
app.use(mongoSanitize());
app.use(xss());

if (process.env.NODE_ENV === 'development') {
  app.use(morgen('dev'));
}

// Mount Routes
mountRoutes(app);

// Handle unhandlled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find this route ${req.originalUrl}`, 400));
});

// Global error handling middleware
app.use(globalErrorHandler);
module.exports = app;
