import { User } from '../models/user.model.js';
import { ApiError } from '../utils/Api_Error.js';
import { ApiResponse } from '../utils/Api_Response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateState, getGithubAuthUrl, exchangeGithubCode, fetchGithubProfile } from '../utils/oauth.js';
import { GenerateAccessAndRefreshToken } from './user.controllers.js';

/** Absolute frontend origin for OAuth redirects (never allow relative "undefined/...") */
const getFrontendUrl = () => {
  const raw =
    process.env.FRONTEND_URL ||
    (process.env.CORS_ORIGIN || '').split(",")[0] ||
    "http://localhost:5173";
  return raw.trim().replace(/\/$/, "");
};

/**
 * Generate a unique username from GitHub login
 * If username exists, append a suffix
 * @param {string} githubLogin - GitHub username
 * @returns {Promise<string>} Unique username
 */
const generateUniqueUsername = async (githubLogin) => {
  let username = githubLogin.toLowerCase();
  let suffix = 0;
  
  // Check if username exists
  const existingUser = await User.findOne({ username });
  if (!existingUser) {
    return username;
  }
  
  // If username exists, try appending a suffix
  while (true) {
    suffix++;
    const newUsername = `${username}${suffix}`;
    const userExists = await User.findOne({ username: newUsername });
    if (!userExists) {
      return newUsername;
    }
    
    // Safety check to prevent infinite loop
    if (suffix > 100) {
      // Generate a random suffix
      const randomSuffix = Math.floor(Math.random() * 10000);
      return `${username}${randomSuffix}`;
    }
  }
};

/**
 * Find or create user from OAuth profile
 * @param {object} profile - OAuth profile data
 * @returns {Promise<object>} User object
 */
const findOrCreateOAuthUser = async (profile) => {
  // Try to find existing user by (authProvider, providerId)
  let user = await User.findOne({
    authProvider: 'github',
    providerId: profile.id,
  });
  
  if (user) {
    return user;
  }
  
  // Try to find existing user by email
  user = await User.findOne({ email: profile.email });
  
  if (user) {
    // Link the OAuth account to existing user
    user.authProvider = 'github';
    user.providerId = profile.id;
    await user.save({ validateBeforeSave: false });
    return user;
  }
  
  // Create new user
  const uniqueUsername = await generateUniqueUsername(profile.login);
  
  user = await User.create({
    username: uniqueUsername,
    email: profile.email,
    fullName: profile.name,
    avatar: {
      url: profile.avatar_url,
      public_id: '',
    },
    authProvider: 'github',
    providerId: profile.id,
  });
  
  return user;
};

/**
 * Initiate GitHub OAuth flow
 * Redirects user to GitHub authorization page
 */
export const githubAuth = asyncHandler(async (req, res) => {
  const state = generateState();
  
  // Store state in cookie for CSRF protection
  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60 * 1000, // 10 minutes
    sameSite: 'lax',
  });
  
  const authUrl = getGithubAuthUrl(state);
  
  return res.redirect(authUrl);
});

/**
 * Handle GitHub OAuth callback
 * Exchanges code for token, fetches profile, creates/updates user, and redirects to frontend
 */
export const githubCallback = asyncHandler(async (req, res) => {
  const { code, state, error, error_description } = req.query;

  const frontendUrl = getFrontendUrl();

  // Handle GitHub OAuth errors (user cancelled, etc.)
  if (error) {
    console.error('GitHub OAuth error:', error, error_description);
    return res.redirect(
      `${frontendUrl}/auth/callback?error=${encodeURIComponent(
        error_description || 'GitHub authorization was denied'
      )}`
    );
  }
  
  // Validate required parameters
  if (!code) {
    throw new ApiError(400, 'Authorization code is required');
  }
  
  // Validate state for CSRF protection
  const storedState = req.cookies.oauth_state;
  if (!storedState || storedState !== state) {
    // Clear cookie and redirect with error
    res.clearCookie('oauth_state');
    return res.redirect(
      `${frontendUrl}/auth/callback?error=${encodeURIComponent(
        'Invalid state parameter. Please try again.'
      )}`
    );
  }
  
  // Clear the state cookie
  res.clearCookie('oauth_state');
  
  try {
    // Exchange code for access token
    const accessToken = await exchangeGithubCode(code);
    
    // Fetch GitHub profile
    const profile = await fetchGithubProfile(accessToken);
    
    // Find or create user
    const user = await findOrCreateOAuthUser(profile);
    
    // Generate JWT tokens
    const { accessToken: jwtToken, refreshToken } = await GenerateAccessAndRefreshToken(user._id);

    // Redirect to frontend with JWT token
    return res.redirect(
      `${frontendUrl}/auth/callback?token=${jwtToken}&refreshToken=${refreshToken}`
    );
  } catch (error) {
    console.error('GitHub OAuth callback error:', error.message);
    return res.redirect(
      `${frontendUrl}/auth/callback?error=${encodeURIComponent(
        error.message || 'Failed to authenticate with GitHub'
      )}`
    );
  }
});
