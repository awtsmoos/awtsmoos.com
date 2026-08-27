// B"H
const { getToken, setToken } = require('./tokenStore.js');
const { refresh } = require('./oauth.js');
async function accessToken() { const saved = getToken(); if (!saved?.refresh_token) throw new Error('youtube_not_authorized'); if (saved.access_token && saved.expiresAt > Date.now() + 60000) return saved.access_token; const fresh = await refresh(saved.refresh_token); setToken({ ...saved, ...fresh, expiresAt: Date.now() + (fresh.expires_in || 3600) * 1000 }); return fresh.access_token; }
async function youtube(path, options = {}) { const token = await accessToken(); const res = await fetch('https://www.googleapis.com/youtube/v3/' + path, { ...options, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(options.headers || {}) } }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error?.message || data.error || 'youtube_api_failed'); return data; }
module.exports = { youtube };
