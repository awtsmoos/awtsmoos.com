// B"H
const KEY = 'BH_YOUTUBE_TOKEN';
let memoryToken = null;
function getToken() { return memoryToken || readEnvToken(); }
function setToken(token) { memoryToken = { ...token, savedAt: Date.now() }; return memoryToken; }
function clearToken() { memoryToken = null; }
function readEnvToken() {
  const refreshToken = process.env.YOUTUBE_GOOGLE_REFRESH_TOKEN || '';
  if (!refreshToken) return null;
  return { refresh_token: refreshToken, savedAt: 0, source: 'env', key: KEY };
}
module.exports = { getToken, setToken, clearToken };
