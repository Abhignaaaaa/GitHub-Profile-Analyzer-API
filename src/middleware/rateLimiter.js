const rateLimit = require('express-rate-limit');

/**
 * Standard API rate limiter middleware
 * Limits client IPs to 100 requests per 15-minute window
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again after 15 minutes.',
      status: 429
    }
  },
  statusCode: 429
});

module.exports = {
  apiLimiter
};
