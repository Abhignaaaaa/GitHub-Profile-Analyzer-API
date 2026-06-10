const express = require('express');
const ProfileController = require('../controllers/profile.controller');
const { validateUsername } = require('../middleware/validator');

const router = express.Router();

// 1. Analyze and save a profile (POST)
router.post('/analyze/:username', validateUsername, ProfileController.analyzeProfile);

// 2. Get all analyzed profiles (GET)
router.get('/all', ProfileController.getAllProfiles);

// 3. Stats Endpoints (GET) - Must be defined BEFORE dynamic /:username param
router.get('/stats/top-followed', ProfileController.getTopFollowed);
router.get('/stats/top-repos', ProfileController.getTopRepos);
router.get('/stats/popular', ProfileController.getPopular);

// 4. Get a single analyzed profile from DB (GET)
router.get('/:username', validateUsername, ProfileController.getProfile);

module.exports = router;
