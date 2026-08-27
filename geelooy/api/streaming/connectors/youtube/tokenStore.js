// B"H
let memoryToken = null;
function getToken() { return memoryToken || envToken(); }
function setToken(token) { memoryToken = { ...token, savedAt: Date.now() }; return memoryToken; }
function clearToken() { memoryToken = null; }
function envToken() { const refresh = process.env.YOUTUBE_GOOGLE_REFRESH_TOKEN || ''; return refresh ? { refresh_token: refresh, source: 'env' } : null; }
module.exports = { getToken, setToken, clearToken };
