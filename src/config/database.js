const { Sequelize } = require('sequelize');

const nodeEnv = process.env.NODE_ENV || 'development';

console.log('DB_HOST=', process.env.DB_HOST);
console.log('DB_PORT=', process.env.DB_PORT);
console.log('DB_USER=', process.env.DB_USER);
console.log('DB_NAME=', process.env.DB_NAME);

let sequelize;

if (process.env.DATABASE_URL) {
  // Production (Render/Railway recommended way)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: nodeEnv === 'development' ? console.log : false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true'
        ? { require: true, rejectUnauthorized: false }
        : undefined
    },
    define: {
      underscored: true,
      timestamps: true
    }
  });
} else {
  // Local development fallback
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: (process.env.DB_HOST || '127.0.0.1').replace(/\s+/g, ''),
      port: Number(process.env.DB_PORT || 3306),
      dialect: 'mysql',
      logging: nodeEnv === 'development' ? console.log : false,
      define: {
        underscored: true,
        timestamps: true
      }
    }
  );
}

module.exports = sequelize;
