const axios = require('axios');

class GithubService {
  /**
   * Fetches the user profile from GitHub API
   * @param {string} username GitHub username
   * @returns {Promise<{data: object, rateLimit: object}>} Raw response data and rate limit details
   */
  static async fetchUserProfile(username) {
    const token = process.env.GITHUB_TOKEN;
    const headers = {
      'User-Agent': 'GitHub-Profile-Analyzer-API/1.0.0',
      'Accept': 'application/vnd.github.v3+json'
    };

    if (token && token.trim() !== '') {
      headers['Authorization'] = `token ${token.trim()}`;
    }

    try {
      const response = await axios.get(`https://api.github.com/users/${username}`, { 
        headers,
        timeout: 10000 // 10s timeout
      });
      
      const rateLimit = {
        limit: response.headers['x-ratelimit-limit'],
        remaining: response.headers['x-ratelimit-remaining'],
        reset: response.headers['x-ratelimit-reset']
      };
      
      console.log(`[GitHub API] Username: ${username} | Rate Limit remaining: ${rateLimit.remaining}/${rateLimit.limit} | Resets: ${new Date(rateLimit.reset * 1000).toISOString()}`);

      return {
        data: response.data,
        rateLimit
      };
    } catch (error) {
      if (error.response) {
        const { status, headers: resHeaders, data } = error.response;
        const rateLimit = {
          limit: resHeaders['x-ratelimit-limit'],
          remaining: resHeaders['x-ratelimit-remaining'],
          reset: resHeaders['x-ratelimit-reset']
        };

        if (status === 404) {
          const customError = new Error(`GitHub profile for user "${username}" was not found.`);
          customError.status = 404;
          throw customError;
        }

        // Check if rate limited
        if (status === 403 && resHeaders['x-ratelimit-remaining'] === '0') {
          const resetTime = new Date(rateLimit.reset * 1000).toLocaleTimeString();
          const customError = new Error(`GitHub API rate limit exceeded. Please try again after ${resetTime}.`);
          customError.status = 429;
          customError.rateLimit = rateLimit;
          throw customError;
        }

        const customError = new Error(data.message || `GitHub API error: ${status}`);
        customError.status = status;
        throw customError;
      }
      
      if (error.request) {
        const customError = new Error('No response received from GitHub API. Please check your internet connection.');
        customError.status = 503;
        throw customError;
      }

      throw error;
    }
  }
}

module.exports = GithubService;
