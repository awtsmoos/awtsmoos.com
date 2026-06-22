// B"H
const { ok, fail } = require('../core/json.js');
const { missingConfig } = require('../core/config.js');
const { authUrl, exchangeCode } = require('../core/googleOAuth.js');
const { getToken, setToken, clearToken } = require('../core/tokenStore.js');
async function start() { const missing = missingConfig(); if (missing.length) return fail('missing_google_oauth_env', 500, { missing }); return ok({ url: authUrl() }); }
async function callback($i) { const code = $i.$_GET?.code; if (!code) return fail('missing_code'); const token = await exchangeCode(code); setToken(token); return ok({ message:'YouTube OAuth connected.', hasRefresh:!!token.refresh_token }); }
async function status() { const t = getToken(); return ok({ authorized: !!t?.refresh_token, source:t?.source || 'memory' }); }
async function logout() { clearToken(); return ok({ message:'YouTube OAuth memory token cleared.' }); }
module.exports = { start, callback, status, logout };
