const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const routes = require('./src/routes');
const { apiLimiter } = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// 1. Enable Cross-Origin Resource Sharing
app.use(cors());

// 2. Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. HTTP Request Logging (Morgan)
const nodeEnv = process.env.NODE_ENV || 'development';
if (nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined')); // detailed logs for production
}

// 4. Rate Limiting for all endpoints
app.use('/api', apiLimiter);

// 5. Mount API Routes
app.use('/api', routes);

// 6. Root status endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the GitHub Profile Analyzer API',
    documentation: 'See README.md for endpoint and configuration details.'
  });
});

// 7. Route Not Found (404) Handler
app.use((req, res, next) => {
  const error = new Error(`Resource not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// 8. Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
