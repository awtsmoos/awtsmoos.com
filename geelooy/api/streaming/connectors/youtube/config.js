// B"H
const SCOPES = ['https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.force-ssl'];
function config() { return { clientId: process.env.YOUTUBE_GOOGLE_CLIENT_ID || '', clientSecret: process.env.YOUTUBE_GOOGLE_CLIENT_SECRET || '', redirectUri: process.env.YOUTUBE_OAUTH_REDIRECT_URI || 'https://awtsmoos.com/api/streaming/youtube/auth-callback', scopes: SCOPES }; }
function missingConfig() { const c = config(); const missing = []; if (!c.clientId) missing.push('YOUTUBE_GOOGLE_CLIENT_ID'); if (!c.clientSecret) missing.push('YOUTUBE_GOOGLE_CLIENT_SECRET'); return missing; }
module.exports = { config, missingConfig, SCOPES };
