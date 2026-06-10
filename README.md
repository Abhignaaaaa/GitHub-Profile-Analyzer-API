# GitHub Profile Analyzer API

A production-ready Node.js, Express, and MySQL backend service that fetches profile data from the GitHub Public API, extracts custom insights, stores them in a MySQL database, and exposes REST APIs for querying and ranking the stored profiles.

## Table of Contents
1. [Key Features](#key-features)
2. [Tech Stack](#tech-stack)
3. [Calculated Insights](#calculated-insights)
4. [Database Schema](#database-schema)
5. [Local Setup & Installation](#local-setup--installation)
6. [Environment Variables](#environment-variables)
7. [API Documentation](#api-documentation)
8. [Postman Collection](#postman-collection)
9. [Deployment Guide](#deployment-guide)

---

## Key Features

- **GitHub Profile Import**: Fetch data dynamically from the GitHub users API.
- **Computed Analytics**: Calculate follower ratios, account age repository density, and custom popularity scores.
- **Database Persistence**: Store results in MySQL using Sequelize ORM with automatic table creation/synchronization.
- **Advanced Rankings**: Ready-made endpoints to query the top-followed, top-repository-owning, and most "popular" profiles.
- **Robust Security & Operations**:
  - Request rate-limiting using `express-rate-limit`.
  - Input validation sanitizing GitHub username requirements via `express-validator`.
  - HTTP logging via `morgan`.
  - Graceful GitHub rate-limit status checking and JSON error handling.
  - Endpoint health checks verifying DB status.

---

## Tech Stack

- **Runtime**: Node.js (Latest LTS)
- **Framework**: Express.js
- **Database ORM**: Sequelize
- **Database Driver**: `mysql2`
- **HTTP Client**: Axios
- **Logging**: Morgan
- **Security**: Cors, Express Rate Limit
- **Environment**: Dotenv

---

## Calculated Insights

For every analyzed profile, the application computes these additional analytical attributes:

1. **Follower/Following Ratio** (`follower_following_ratio`):
   $$\text{Ratio} = \frac{\text{Followers}}{\text{Following (or 1 if 0)}}$$
   *Prevents division-by-zero errors. Rounded to 2 decimal places.*

2. **Repository per Year Estimate** (`repo_per_year_estimate`):
   $$\text{Estimate} = \frac{\text{Public Repositories}}{\max(\text{Account Age in Years}, 0.08)}$$
   *Uses a floor value of 0.08 years (approx. 1 month) for new profiles to avoid statistical outliers or division-by-zero.*

3. **Popularity Score** (`popularity_score`):
   $$\text{Score} = (\text{Followers} \times 3) + \text{Public Repositories}$$
   *A weighted score prioritizing community size (followers) alongside contribution volume (repositories).*

---

## Database Schema

Table name: `github_profiles`

| Column | Data Type | Constraints / Details |
| :--- | :--- | :--- |
| `id` | `INT` | Primary Key, Auto Increment |
| `username` | `VARCHAR(191)` | Unique, Not Null, Indexed |
| `name` | `VARCHAR(255)` | Nullable |
| `bio` | `TEXT` | Nullable |
| `public_repos` | `INT` | Not Null, Default: 0 |
| `followers` | `INT` | Not Null, Default: 0 |
| `following` | `INT` | Not Null, Default: 0 |
| `location` | `VARCHAR(255)` | Nullable |
| `avatar_url` | `VARCHAR(255)` | Nullable |
| `company` | `VARCHAR(255)` | Nullable |
| `blog` | `VARCHAR(255)` | Nullable |
| `account_created_at`| `DATETIME` | GitHub creation date |
| `last_updated_at` | `DATETIME` | GitHub last updated date |
| `follower_following_ratio` | `FLOAT` | Computed ratio |
| `repo_per_year_estimate` | `FLOAT` | Computed repo/year density |
| `popularity_score` | `INT` | Computed popularity score |
| `raw_json` | `LONGTEXT` | Full GitHub API JSON response payload |
| `created_at` | `DATETIME` | Audit timestamp (Record created) |
| `updated_at` | `DATETIME` | Audit timestamp (Record updated) |

---

## Local Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MySQL Server (v8.0+ recommended)

### 1. Clone the project and install dependencies
```bash
npm install
```

### 2. Configure Database & Environment
- Start your local MySQL service.
- Create a database (e.g. `github_analyzer`):
  ```sql
  CREATE DATABASE github_analyzer;
  ```
- Copy the environment variables template and configure it:
  ```bash
  cp .env.example .env
  ```
- Open `.env` and fill out your local credentials:
  ```ini
  PORT=5000
  NODE_ENV=development

  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_USER=your_mysql_username
  DB_PASSWORD=your_mysql_password
  DB_NAME=github_analyzer

  # Highly recommended to prevent GitHub API rate limit blocks (60/hr limit vs 5000/hr)
  GITHUB_TOKEN=your_personal_github_token
  ```

### 3. Build & Run Application
- Run the server in development mode (with Hot Reloading):
  ```bash
  npm run dev
  ```
- Run the server in production mode:
  ```bash
  npm start
  ```

Upon startup, the database connection is tested, and Sequelize automatically creates the `github_profiles` table if it does not already exist.

---

## Environment Variables

| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port Express server listens on. |
| `NODE_ENV` | `development` | Environment mode (`development` or `production`). |
| `DATABASE_URL` | *None* | Full database URI string. **If supplied, individual DB fields are ignored** (preferred on Railway/Render). |
| `DB_HOST` | `127.0.0.1` | Hostname of the MySQL database. |
| `DB_PORT` | `3306` | MySQL port. |
| `DB_USER` | `root` | MySQL user. |
| `DB_PASSWORD` | *Empty* | MySQL password. |
| `DB_NAME` | `github_analyzer`| Database name. |
| `GITHUB_TOKEN` | *None* | GitHub Personal Access Token (classic or fine-grained). |

---

## API Documentation

### Base URL
All API requests are prefixed with:
`http://localhost:5000/api`

---

### 1. Health Status
#### `GET /health`
Verifies database connectivity and server status.

**Example Response (200 OK):**
```json
{
  "success": true,
  "status": "UP",
  "timestamp": "2026-06-09T13:25:00.000Z",
  "database": "CONNECTED"
}
```

---

### 2. Analyze & Save Profile
#### `POST /profile/analyze/:username`
Fetches a user profile from the GitHub API, computes metrics, inserts/updates the local DB, and returns the result.

- **URL Parameters**:
  - `username` (string, required): GitHub username to query.

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile for \"octocat\" analyzed and saved successfully.",
  "data": {
    "id": 1,
    "username": "octocat",
    "name": "The Octocat",
    "bio": "GitHub's mascot!",
    "public_repos": 8,
    "followers": 15000,
    "following": 9,
    "location": "San Francisco",
    "avatar_url": "https://avatars.githubusercontent.com/u/5832347?v=4",
    "company": "@github",
    "blog": "https://github.blog",
    "account_created_at": "2011-01-25T18:44:36.000Z",
    "last_updated_at": "2026-05-20T10:14:02.000Z",
    "follower_following_ratio": 1666.67,
    "repo_per_year_estimate": 0.52,
    "popularity_score": 45008,
    "raw_json": { ... },
    "created_at": "2026-06-09T13:28:00.000Z",
    "updated_at": "2026-06-09T13:28:00.000Z"
  },
  "rateLimit": {
    "limit": "5000",
    "remaining": "4998",
    "reset": "1472918392"
  }
}
```

---

### 3. Get Single Stored Profile
#### `GET /profile/:username`
Retrieves a previously computed analysis from the database.

- **URL Parameters**:
  - `username` (string, required): GitHub username.

**Example Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "octocat",
    "name": "The Octocat",
    "bio": "GitHub's mascot!",
    "public_repos": 8,
    "followers": 15000,
    "following": 9,
    "location": "San Francisco",
    "avatar_url": "https://avatars.githubusercontent.com/u/5832347?v=4",
    "company": "@github",
    "blog": "https://github.blog",
    "account_created_at": "2011-01-25T18:44:36.000Z",
    "last_updated_at": "2026-05-20T10:14:02.000Z",
    "follower_following_ratio": 1666.67,
    "repo_per_year_estimate": 0.52,
    "popularity_score": 45008,
    "raw_json": { ... },
    "created_at": "2026-06-09T13:28:00.000Z",
    "updated_at": "2026-06-09T13:28:00.000Z"
  }
}
```

---

### 4. Get All Stored Profiles
#### `GET /profile/all`
Fetches a list of all profiles analyzed and saved, sorted by insertion audit time.

**Example Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "username": "octocat",
      ...
    }
  ]
}
```

---

### 5. Get Top Followed Profiles
#### `GET /profile/stats/top-followed`
Lists analyzed profiles sorted by followers count descending.

- **Query Parameters**:
  - `limit` (integer, optional): Maximum records to retrieve. Default is `10`.

**Example Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "username": "octocat",
      "followers": 15000,
      ...
    }
  ]
}
```

---

### 6. Get Top Repositories Profiles
#### `GET /profile/stats/top-repos`
Lists analyzed profiles sorted by repository count descending.

- **Query Parameters**:
  - `limit` (integer, optional): Maximum records to retrieve. Default is `10`.

**Example Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "username": "octocat",
      "public_repos": 8,
      ...
    }
  ]
}
```

---

### 7. Get Most Popular Profiles
#### `GET /profile/stats/popular`
Lists analyzed profiles sorted by calculated popularity score descending.

- **Query Parameters**:
  - `limit` (integer, optional): Maximum records to retrieve. Default is `10`.

**Example Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "username": "octocat",
      "popularity_score": 45008,
      ...
    }
  ]
}
```

---

## Postman Collection

A Postman collection schema is included directly in the repository at [postman_collection.json](postman_collection.json).
Import this file into Postman to instantly test all requests. It defines a dynamic environment variable `{{baseUrl}}` (defaults to `http://localhost:5000/api`).

---

## Deployment Guide

### Option A: Railway or Render Deployment (Preferred)
These hosting platforms automatically build and deploy Node.js applications and spin up managed databases.

#### Setup Database
1. Provision a **MySQL Database** service on Railway or Render.
2. Retrieve the database credentials or the combined **Connection URI** (usually named `MYSQL_URL` or `DATABASE_URL`).

#### Deploy API Web Service
1. Connect your GitHub repository to Railway or Render.
2. Set up a Web Service linked to the main branch.
3. Configure the following environment variables in the dashboard:
   - `PORT`: `5000` (Render/Railway will bind this automatically)
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: *Paste the database Connection URI provided by your database service*
   - `GITHUB_TOKEN`: *Your GitHub Personal Access Token (vital for high traffic)*
4. Set the Build Command: `npm install`
5. Set the Start Command: `npm start`
6. Deploy the application. Sequelize will run migrations/synchronization automatically when the service spins up.

---

### Option B: Local Setup Instructions (With Docker-Compose)
If you wish to test a multi-container local stack mimicking production:

1. Create a `docker-compose.yml` file:
   ```yaml
   version: '3.8'
   services:
     db:
       image: mysql:8.0
       restart: always
       environment:
         MYSQL_DATABASE: github_analyzer
         MYSQL_ROOT_PASSWORD: rootpassword
       ports:
         - "3306:3306"
       volumes:
         - db_data:/var/lib/mysql

     api:
       build: .
       ports:
         - "5000:5000"
       environment:
         - PORT=5000
         - NODE_ENV=production
         - DB_HOST=db
         - DB_USER=root
         - DB_PASSWORD=rootpassword
         - DB_NAME=github_analyzer
       depends_on:
         - db

   volumes:
     db_data:
   ```
2. Build and run:
   ```bash
   docker-compose up --build
   ```
