-- Create database if not exists
CREATE DATABASE IF NOT EXISTS `github_analyzer` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `github_analyzer`;

-- Create github_profiles table
CREATE TABLE IF NOT EXISTS `github_profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(191) NOT NULL UNIQUE,
  `name` VARCHAR(255) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `public_repos` INT NOT NULL DEFAULT 0,
  `followers` INT NOT NULL DEFAULT 0,
  `following` INT NOT NULL DEFAULT 0,
  `location` VARCHAR(255) DEFAULT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `company` VARCHAR(255) DEFAULT NULL,
  `blog` VARCHAR(255) DEFAULT NULL,
  `account_created_at` DATETIME DEFAULT NULL,
  `last_updated_at` DATETIME DEFAULT NULL,
  `follower_following_ratio` FLOAT DEFAULT 0,
  `repo_per_year_estimate` FLOAT DEFAULT 0,
  `popularity_score` INT DEFAULT 0,
  `raw_json` LONGTEXT DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
