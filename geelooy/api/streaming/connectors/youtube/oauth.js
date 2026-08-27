// B"H
const crypto = require('crypto');
const { config } = require('./config.js');
function authUrl() { const c = config(); const u = new URL('https://accounts.google.com/o/oauth2/v2/auth'); u.searchParams.set('client_id', c.clientId); u.searchParams.set('redirect_uri', c.redirectUri); u.searchParams.set('response_type', 'code'); u.searchParams.set('scope', c.scopes.join(' ')); u.searchParams.set('access_type', 'offline'); u.searchParams.set('prompt', 'consent'); u.searchParams.set('include_granted_scopes', 'true'); u.searchParams.set('state', crypto.randomBytes(16).toString('hex')); return u.toString(); }
async function tokenRequest(params) { const res = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params) }); const data = await res.json(); if (!res.ok) throw new Error(data.error_description || data.error || 'google_oauth_failed'); return data; }
async function exchange(code) { const c = config(); return tokenRequest({ code, client_id: c.clientId, client_secret: c.clientSecret, redirect_uri: c.redirectUri, grant_type: 'authorization_code' }); }
async function refresh(refreshToken) { const c = config(); return tokenRequest({ client_id: c.clientId, client_secret: c.clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' }); }
module.exports = { authUrl, exchange, refresh };
