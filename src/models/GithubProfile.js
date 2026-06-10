const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GithubProfile = sequelize.define('GithubProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(191),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  public_repos: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  followers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  following: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true
  },
  blog: {
    type: DataTypes.STRING,
    allowNull: true
  },
  account_created_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  follower_following_ratio: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0
  },
  repo_per_year_estimate: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.0
  },
  popularity_score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  raw_json: {
    type: DataTypes.TEXT('long'),
    allowNull: true
  }
}, {
  tableName: 'github_profiles',
  indexes: [
    {
      unique: true,
      fields: ['username']
    }
  ]
});

module.exports = GithubProfile;
