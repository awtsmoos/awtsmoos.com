// B"H
const crypto = require('crypto');
const { config } = require('./config.js');
function authUrl(state = '') {
  const c = config(); const u = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  u.searchParams.set('client_id', c.clientId); u.searchParams.set('redirect_uri', c.redirectUri);
  u.searchParams.set('response_type', 'code'); u.searchParams.set('scope', c.scopes.join(' '));
  u.searchParams.set('access_type', 'offline'); u.searchParams.set('prompt', 'consent');
  u.searchParams.set('include_granted_scopes', 'true'); u.searchParams.set('state', state || nonce());
  return u.toString();
}
async function exchangeCode(code) {
  const c = config(); const body = new URLSearchParams({ code, client_id:c.clientId, client_secret:c.clientSecret, redirect_uri:c.redirectUri, grant_type:'authorization_code' });
  return googleToken(body);
}
async function refreshAccess(refreshToken) {
  const c = config(); const body = new URLSearchParams({ client_id:c.clientId, client_secret:c.clientSecret, refresh_token:refreshToken, grant_type:'refresh_token' });
  return googleToken(body);
}
async function googleToken(body) {
  const res = await fetch('https://oauth2.googleapis.com/token', { method:'POST', headers:{ 'content-type':'application/x-www-form-urlencoded' }, body });
  const data = await res.json(); if (!res.ok) throw new Error(data.error_description || data.error || 'google_token_failed');
  return data;
}
function nonce() { return crypto.randomBytes(16).toString('hex'); }
module.exports = { authUrl, exchangeCode, refreshAccess };
