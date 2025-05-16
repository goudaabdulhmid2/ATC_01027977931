# Eventify Frontend

## Overview

Eventify is a modern event booking platform built with React and TypeScript, leveraging AI assistance for development. The frontend application provides a seamless experience for event management, booking, and administration.

## AI-Assisted Development

This project was developed with the assistance of:

- **ChatGPT**: Used for:
  - Code architecture decisions
  - Component structure planning
  - TypeScript type definitions
  - Debugging assistance
- **Cursor**: AI-powered IDE providing:
  - Intelligent code completion
  - Real-time code suggestions
  - TypeScript type inference
  - Code optimization tips

## Tech Stack

### Core Technologies

- **React 18**: Modern UI development with functional components and hooks
- **TypeScript**: Type-safe development with strict configuration
- **Vite**: Next-generation frontend tooling with fast HMR
- **Redux Toolkit**: State management with modern Redux patterns

### UI Framework

- **Material-UI (MUI) v5**: Complete design system with:
  - Responsive components
  - Custom theme support
  - RTL support via `stylis-plugin-rtl`
  - Emotion for styled components

### Form Management

- **Formik**: Form handling with validation
- **Yup**: Schema-based form validation

### Data Visualization

- **Recharts**: Responsive charting library for analytics

### Internationalization

- **i18next**: Complete internationalization solution
- **react-i18next**: React bindings for i18next

### Testing

- **Vitest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Jest DOM**: DOM testing utilities

## Project Structure

```
src/
  ├── assets/          # Static assets and images
  ├── components/      # Reusable UI components
  ├── pages/           # Page components and routes
  │   ├── admin/       # Admin dashboard pages
  │   ├── auth/        # Authentication pages
  │   └── user/        # User dashboard pages
  ├── store/           # Redux store configuration
  │   └── slices/      # Redux toolkit slices
  ├── utils/           # Utility functions and helpers
  ├── locales/         # i18n translation files
  └── theme.ts         # MUI theme configuration
```

## Features

### Authentication

- JWT-based authentication
- Protected routes
- Role-based access control (User/Admin)
- Profile management

### Event Management

- Event listing with filters
- Event details with booking
- Category-based organization
- Search functionality

### Admin Dashboard

- Event creation and management
- User management
- Booking statistics
- Analytics visualization

### User Features

- Event booking
- Booking history
- Profile customization
- Notifications

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```
3. Create `.env` file with:
   ```env
   VITE_REACT_APP_BACKEND_URL=<your-backend-url>
   ```

### Development

```bash
# Start development server
npm run dev
# or
yarn dev
```

### Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Building

```bash
# Production build
npm run build
# or
yarn build
```

## Development Guidelines

### Code Style

- Strict TypeScript configuration
- ESLint for code quality
- Consistent component structure
- Proper error handling

### State Management

- Redux Toolkit for global state
- Local state with hooks
- Async operations with createAsyncThunk
- Type-safe store with TypeScript

### Component Guidelines

- Functional components with hooks
- Proper prop typing
- Error boundaries implementation
- Responsive design patterns

### Testing Standards

- Unit tests for utilities
- Component testing with RTL
- Integration tests for features
- High test coverage goal

## Performance Optimization

- Code splitting with React.lazy
- Route-based chunking
- Image optimization
- Caching strategies

## Deployment

- Deployment to Netlify

## Authors

goudaabdulhmid2
