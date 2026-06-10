const { GithubProfile } = require('../models');
const GithubService = require('../services/github.service');
const { calculateInsights } = require('../utils/insights');

class ProfileController {
  /**
   * POST /api/profile/analyze/:username
   * Fetches profile from GitHub, calculates insights, saves to DB, and returns the record
   */
  static async analyzeProfile(req, res, next) {
    try {
      const username = req.params.username.toLowerCase();

      // 1. Fetch data from GitHub API
      const { data: githubData, rateLimit } = await GithubService.fetchUserProfile(username);

      // 2. Compute custom insights
      const insights = calculateInsights(githubData);

      // 3. Prepare db payload
      const profileData = {
        username: githubData.login.toLowerCase(),
        name: githubData.name,
        bio: githubData.bio,
        public_repos: githubData.public_repos,
        followers: githubData.followers,
        following: githubData.following,
        location: githubData.location,
        avatar_url: githubData.avatar_url,
        company: githubData.company,
        blog: githubData.blog,
        account_created_at: new Date(githubData.created_at),
        last_updated_at: new Date(githubData.updated_at),
        follower_following_ratio: insights.follower_following_ratio,
        repo_per_year_estimate: insights.repo_per_year_estimate,
        popularity_score: insights.popularity_score,
        raw_json: JSON.stringify(githubData)
      };

      // 4. Store/Upsert in Database
      let profile = await GithubProfile.findOne({ where: { username: profileData.username } });

      if (profile) {
        profile = await profile.update(profileData);
      } else {
        profile = await GithubProfile.create(profileData);
      }

      // Parse raw_json back to object for response cleanliness if requested, or keep as string.
      // Let's parse raw_json to send clean JSON in response.
      const responseData = profile.toJSON();
      responseData.raw_json = githubData;

      return res.status(200).json({
        success: true,
        message: `Profile for "${username}" analyzed and saved successfully.`,
        data: responseData,
        rateLimit
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/profile/all
   * Returns a list of all analyzed profiles
   */
  static async getAllProfiles(req, res, next) {
    try {
      const profiles = await GithubProfile.findAll({
        order: [['updated_at', 'DESC']]
      });

      // Parse raw_json back to objects for responses
      const parsedProfiles = profiles.map(profile => {
        const p = profile.toJSON();
        if (p.raw_json) {
          try {
            p.raw_json = JSON.parse(p.raw_json);
          } catch (e) {
            // keep as string if parse fails
          }
        }
        return p;
      });

      return res.status(200).json({
        success: true,
        count: parsedProfiles.length,
        data: parsedProfiles
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/profile/:username
   * Returns a single analyzed profile from the local database
   */
  static async getProfile(req, res, next) {
    try {
      const username = req.params.username.toLowerCase();
      const profile = await GithubProfile.findOne({ where: { username } });

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Profile for user "${username}" was not found in the analyzer database. Please trigger the analyze endpoint (POST /api/profile/analyze/${username}) first.`,
            status: 404
          }
        });
      }

      const responseData = profile.toJSON();
      if (responseData.raw_json) {
        try {
          responseData.raw_json = JSON.parse(responseData.raw_json);
        } catch (e) {
          // ignore
        }
      }

      return res.status(200).json({
        success: true,
        data: responseData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/profile/stats/top-followed
   * Returns top profiles sorted by followers count
   */
  static async getTopFollowed(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const profiles = await GithubProfile.findAll({
        order: [['followers', 'DESC']],
        limit
      });

      return res.status(200).json({
        success: true,
        count: profiles.length,
        data: profiles
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/profile/stats/top-repos
   * Returns top profiles sorted by public repositories count
   */
  static async getTopRepos(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const profiles = await GithubProfile.findAll({
        order: [['public_repos', 'DESC']],
        limit
      });

      return res.status(200).json({
        success: true,
        count: profiles.length,
        data: profiles
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/profile/stats/popular
   * Returns top profiles sorted by computed popularity score
   */
  static async getPopular(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const profiles = await GithubProfile.findAll({
        order: [['popularity_score', 'DESC']],
        limit
      });

      return res.status(200).json({
        success: true,
        count: profiles.length,
        data: profiles
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProfileController;
