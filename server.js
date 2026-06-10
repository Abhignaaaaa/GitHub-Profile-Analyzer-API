const app = require('./app');
const { sequelize } = require('./src/models');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

/**
 * Bootstrap application server
 */
async function startServer() {
  try {
    console.log('[Database] Connecting to database...');
    // Authenticate database credentials
    await sequelize.authenticate();
    console.log('[Database] Database connection established successfully.');

    // Synchronize models with the database
    // Automatically creates tables if they do not exist
    console.log('[Database] Syncing models...');
    await sequelize.sync();
    console.log('[Database] Models synchronized.');

    // Start Express server listening
    app.listen(PORT, () => {
      console.log(`[Server] GitHub Profile Analyzer API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('[Fatal Error] Failed to bootstrap application server:', error);
    process.exit(1);
  }
}

// Start execution
startServer();
