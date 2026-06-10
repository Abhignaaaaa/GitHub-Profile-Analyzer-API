const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('DB_HOST=', process.env.DB_HOST);
console.log('DB_PORT=', process.env.DB_PORT);
console.log('DB_USER=', process.env.DB_USER);
console.log('DB_NAME=', process.env.DB_NAME);

const dbHost = (process.env.DB_HOST || '127.0.0.1').trim();
const dbPort = (process.env.DB_PORT || '3306').trim();
const dbUser = (process.env.DB_USER || 'root').trim();
const dbPassword = (process.env.DB_PASSWORD || '').trim();
const dbName = (process.env.DB_NAME || 'github_analyzer').trim();

let sequelize;

if (process.env.DATABASE_URL) {
  // Production environments (Render, Railway, Heroku, etc.) often provide a single connection string
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: nodeEnv === 'development' ? console.log : false,
    dialectOptions: {
      ssl: process.env.DATABASE_URL.includes('sslmode=') || process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : undefined
    },
    define: {
      underscored: true, // Use snake_case for fields in database
      timestamps: true // Enable createdAt and updatedAt
    }
  });
} else {
  // Fallback to individual credentials
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: parseInt(dbPort, 10),
    dialect: 'mysql',
    logging: nodeEnv === 'development' ? console.log : false,
    define: {
      underscored: true,
      timestamps: true
    }
  });
}

module.exports = sequelize;
