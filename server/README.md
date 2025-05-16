# Eventify Backend

A robust Node.js/Express backend for the Eventify event management system, featuring comprehensive security measures, caching, and RESTful APIs.

## Project Overview

Eventify is a full-stack event booking system that enables users to browse and book events, manage their bookings, and provides an integrated web-based admin panel for event management. The project is developed with AI tools integration to demonstrate effective AI usage in the development workflow.

## Core Features

### Authentication & Authorization

- User registration and login system
- Role-based access control (Admin, User)
- JWT-based authentication
- Password reset functionality
- Rate limiting for login attempts

### Event Management

- CRUD operations for events
- Event categorization and tagging
- Image upload and processing
- Event filtering and search capabilities
- Pagination support

### Booking System

- Ticket booking functionality
- Booking status tracking
- User booking history
- Booking validation and capacity management

### Admin Features

- Comprehensive admin panel
- Event management dashboard
- User management
- Booking overview and management

### Additional Features

- Multi-language support (English - Arabic)
- Dark mode support
- Unit testing implementation
- Production deployment ready

## Technical Features

## Deployment

- Deployment to Railway

### Security Measures

- CORS protection with configurable origins
- XSS protection using xss-clean
- NoSQL injection prevention
- Request rate limiting
- Cookie parsing and security
- CSRF protection
- HTTP Parameter Pollution protection
- Request size limiting

### Database & Caching

- MongoDB with Mongoose ODM
- Redis caching for improved performance
- Database connection error handling

### API Architecture

- RESTful API design
- Express validator for request validation
- Global error handling
- Async/await error handling
- File upload with Multer
- Image processing with Sharp

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `config.env` file in the root directory with the following variables:

   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE=your_mongodb_connection_string
   DATABASE_PASSWORD=your_database_password

   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90

   REDIS_HOST=your_redis_host
   REDIS_PORT=your_redis_port
   REDIS_PASSWORD=your_redis_password

   EMAIL_USERNAME=your_email_username
   EMAIL_PASSWORD=your_email_password
   EMAIL_HOST=your_email_host
   EMAIL_PORT=your_email_port

   FRONTEND_URL=http://localhost:5173
   ```

## API Documentation

The API is organized around REST principles. All requests should be made to endpoints beginning with `/api/v1/`.

### Authentication Endpoints

| Method | Endpoint                       | Description            | Authentication |
| ------ | ------------------------------ | ---------------------- | -------------- |
| POST   | `/api/v1/auth/signup`          | Register new user      | No             |
| POST   | `/api/v1/auth/login`           | User login             | No             |
| POST   | `/api/v1/auth/forgotPassword`  | Request password reset | No             |
| POST   | `/api/v1/auth/verifyResetCode` | Verify reset code      | No             |
| POST   | `/api/v1/auth/resetPassword`   | Reset password         | No             |
| GET    | `/api/v1/auth/logout`          | Logout user            | Yes            |

### User Endpoints

| Method | Endpoint                         | Description      | Authentication |
| ------ | -------------------------------- | ---------------- | -------------- |
| GET    | `/api/v1/users/me`               | Get user profile | Yes            |
| PATCH  | `/api/v1/users/updateMyPassword` | Update password  | Yes            |
| PATCH  | `/api/v1/users/updateMe`         | Update profile   | Yes            |
| PATCH  | `/api/v1/users/activeMe`         | Activate account | Yes            |
| DELETE | `/api/v1/users/deleteMe`         | Delete account   | Yes            |

### Event Endpoints

| Method | Endpoint             | Description       | Authentication |
| ------ | -------------------- | ----------------- | -------------- |
| GET    | `/api/v1/events`     | List all events   | No             |
| GET    | `/api/v1/events/:id` | Get event details | No             |

### Booking Endpoints

| Method | Endpoint                               | Description         | Authentication |
| ------ | -------------------------------------- | ------------------- | -------------- |
| GET    | `/api/v1/bookings/my-bookings`         | Get user's bookings | Yes            |
| POST   | `/api/v1/bookings/book-event/:eventId` | Book an event       | Yes            |
| PATCH  | `/api/v1/bookings/my-bookings/:id`     | Update booking      | Yes            |
| PATCH  | `/api/v1/bookings/:bookingId/cancel`   | Cancel booking      | Yes            |

### Admin Endpoints

| Method | Endpoint                        | Description              | Authentication |
| ------ | ------------------------------- | ------------------------ | -------------- |
| GET    | `/api/v1/admin/dashboard/stats` | Get dashboard statistics | Admin          |
| GET    | `/api/v1/admin/activity`        | Get recent activity      | Admin          |

#### Admin Event Management

| Method | Endpoint                   | Description     | Authentication |
| ------ | -------------------------- | --------------- | -------------- |
| GET    | `/api/v1/admin/events`     | List all events | Admin          |
| POST   | `/api/v1/admin/events`     | Create event    | Admin          |
| PATCH  | `/api/v1/admin/events/:id` | Update event    | Admin          |
| DELETE | `/api/v1/admin/events/:id` | Delete event    | Admin          |

#### Admin User Management

| Method | Endpoint                                 | Description          | Authentication |
| ------ | ---------------------------------------- | -------------------- | -------------- |
| GET    | `/api/v1/admin/users`                    | List all users       | Admin          |
| GET    | `/api/v1/admin/users/:id`                | Get user details     | Admin          |
| POST   | `/api/v1/admin/users`                    | Create user          | Admin          |
| PATCH  | `/api/v1/admin/users/:id`                | Update user          | Admin          |
| DELETE | `/api/v1/admin/users/:id`                | Delete user          | Admin          |
| PATCH  | `/api/v1/admin/users/changePassword/:id` | Change user password | Admin          |

#### Admin Booking Management

| Method | Endpoint                              | Description            | Authentication |
| ------ | ------------------------------------- | ---------------------- | -------------- |
| GET    | `/api/v1/admin/bookings`              | List all bookings      | Admin          |
| GET    | `/api/v1/admin/bookings/statistics`   | Get booking statistics | Admin          |
| GET    | `/api/v1/admin/bookings/user/:userId` | Get user's bookings    | Admin          |
| GET    | `/api/v1/admin/bookings/trends`       | Get booking trends     | Admin          |
| GET    | `/api/v1/admin/bookings/:id`          | Get booking details    | Admin          |
| PATCH  | `/api/v1/admin/bookings/:id`          | Update booking         | Admin          |
| DELETE | `/api/v1/admin/bookings/:id`          | Delete booking         | Admin          |

## Scripts

- **Development**: `npm run dev` - Starts the server with nodemon
- **Production**: `npm start` - Starts the server in production mode
- **Testing**:
  - `npm test` - Runs tests
  - `npm run test:watch` - Runs tests in watch mode
  - `npm run test:coverage` - Runs tests with coverage report

## Testing

The application includes comprehensive tests using Jest and Supertest. Tests cover:

- API endpoints
- Authentication flows
- Database operations
- Validation logic

## Author

goudaabdulhmid2
