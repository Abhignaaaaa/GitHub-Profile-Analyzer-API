const { param, validationResult } = require('express-validator');

/**
 * Middleware to validate GitHub username parameter
 */
const validateUsername = [
  param('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .matches(/^[a-zA-Z0-9-]{1,39}$/)
    .withMessage('Username must be alphanumeric or contain hyphens, and be 1 to 39 characters long')
    .custom((value) => {
      if (value.startsWith('-') || value.endsWith('-')) {
        throw new Error('Username cannot start or end with a hyphen');
      }
      if (value.includes('--')) {
        throw new Error('Username cannot contain consecutive hyphens');
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg
          }))
        }
      });
    }
    next();
  }
];

module.exports = {
  validateUsername
};
