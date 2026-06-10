const sequelize = require('../config/database');
const GithubProfile = require('./GithubProfile');

const db = {
  sequelize,
  Sequelize: sequelize.constructor,
  GithubProfile
};

module.exports = db;
