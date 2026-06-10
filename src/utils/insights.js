/**
 * Calculates computed insights from raw GitHub profile data
 * @param {object} profileData Cleaned or raw GitHub profile properties
 * @returns {object} Calculated insight fields
 */
function calculateInsights(profileData) {
  const { followers, following, public_repos, created_at } = profileData;

  // 1. Follower to Following Ratio (rounded to 2 decimal places)
  // If following is 0, divide by 1 to prevent Division by Zero
  const followerRatio = followers / (following || 1);
  const follower_following_ratio = parseFloat(followerRatio.toFixed(2));

  // 2. Repositories Per Year Estimate
  // Calculate account age in years
  const createdDate = new Date(created_at);
  const currentDate = new Date();
  
  // Calculate difference in milliseconds
  const diffInMs = currentDate - createdDate;
  // Convert milliseconds to years (1 year = 365.25 days to account for leap years)
  const msInYear = 365.25 * 24 * 60 * 60 * 1000;
  const ageInYears = diffInMs / msInYear;

  // Set a minimum age floor of 0.08 years (about 1 month) to prevent division-by-zero 
  // or extremely inflated rates for brand new accounts.
  const safeAgeInYears = Math.max(ageInYears, 0.08);
  const repoPerYear = public_repos / safeAgeInYears;
  const repo_per_year_estimate = parseFloat(repoPerYear.toFixed(2));

  // 3. Popularity Score
  // Custom formula: We weigh followers more heavily (factor of 3) and add the public repositories count
  const popularity_score = (followers * 3) + public_repos;

  return {
    follower_following_ratio,
    repo_per_year_estimate,
    popularity_score
  };
}

module.exports = {
  calculateInsights
};
