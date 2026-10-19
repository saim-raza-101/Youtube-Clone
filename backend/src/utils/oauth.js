import crypto from 'crypto';

const GITHUB_OAUTH_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_OAUTH_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_API_USER_URL = 'https://api.github.com/user';
const GITHUB_API_EMAILS_URL = 'https://api.github.com/user/emails';

/**
 * Generate a secure random state string for CSRF protection
 * @returns {string} Random state string
 */
export const generateState = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Get GitHub OAuth authorization URL
 * @param {string} state - CSRF state token
 * @returns {string} Authorization URL
 */
export const getGithubAuthUrl = (state) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_CALLBACK_URL,
    scope: 'read:user user:email',
    state: state,
    allow_signup: 'true',
  });

  return `${GITHUB_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
};

/**
 * Exchange GitHub authorization code for access token
 * @param {string} code - Authorization code from GitHub
 * @returns {Promise<string>} Access token
 */
export const exchangeGithubCode = async (code) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    throw new Error('GitHub OAuth credentials are not configured');
  }

  const response = await fetch(GITHUB_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code: code,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to exchange code: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  return data.access_token;
};

/**
 * Fetch GitHub user profile and emails
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<{id: string, email: string, name: string, login: string, avatar_url: string}>} User profile
 */
export const fetchGithubProfile = async (accessToken) => {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'User-Agent': 'Vidora',
  };

  // Fetch user profile and emails in parallel
  const [userResponse, emailsResponse] = await Promise.all([
    fetch(GITHUB_API_USER_URL, { headers }),
    fetch(GITHUB_API_EMAILS_URL, { headers }),
  ]);

  if (!userResponse.ok) {
    throw new Error(`Failed to fetch user profile: ${userResponse.status}`);
  }

  if (!emailsResponse.ok) {
    throw new Error(`Failed to fetch user emails: ${emailsResponse.status}`);
  }

  const userData = await userResponse.json();
  const emailsData = await emailsResponse.json();

  // Find primary verified email
  let email = userData.email;
  if (!email || !userData.email_verified) {
    // Look for a primary verified email in the emails list
    const verifiedEmails = emailsData.filter((e) => e.verified && e.primary);
    if (verifiedEmails.length > 0) {
      email = verifiedEmails[0].email;
    } else {
      // Fallback to first verified email
      const anyVerified = emailsData.filter((e) => e.verified);
      if (anyVerified.length > 0) {
        email = anyVerified[0].email;
      }
    }
  }

  // If still no email, use a placeholder
  if (!email) {
    email = `${userData.login}@users.noreply.github.com`;
  }

  return {
    id: userData.id.toString(),
    email: email.toLowerCase(),
    name: userData.name || userData.login,
    login: userData.login,
    avatar_url: userData.avatar_url,
  };
};
