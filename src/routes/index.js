const express = require('express');
const profileRoutes = require('./profile.routes');
const { sequelize } = require('../models');

const router = express.Router();

/**
 * GET /api/health
 * Production-ready health check verifying both API server and MySQL connectivity
 */
router.get('/health', async (req, res) => {
  try {
    // Attempt database ping
    await sequelize.authenticate();
    return res.status(200).json({
      success: true,
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: 'CONNECTED'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      database: 'DISCONNECTED',
      error: error.message
    });
  }
});

// Mount profile routes
router.use('/profile', profileRoutes);

module.exports = router;
