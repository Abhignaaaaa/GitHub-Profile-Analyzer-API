/**
 * Global error handling middleware for Express
 */
const errorHandler = (err, req, res, next) => {
  // Log error stack trace internally
  console.error('[Global Error Handler]:', err.stack || err);

  const statusCode = err.status || 500;
  const message = err.message || 'An unexpected server error occurred';

  const response = {
    success: false,
    error: {
      message,
      status: statusCode
    }
  };

  // Include stack trace only in development environment
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }

  // Include rateLimit metadata if it was added to the error (e.g. from GitHub API)
  if (err.rateLimit) {
    response.error.rateLimit = err.rateLimit;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
