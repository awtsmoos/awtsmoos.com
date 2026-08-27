// B"H
const { ok, fail } = require('../../core/json.js');
const { body } = require('../../core/body.js');
const { missingConfig } = require('./config.js');
const { authUrl, exchange } = require('./oauth.js');
const { getToken, setToken, clearToken } = require('./tokenStore.js');
const { youtube } = require('./client.js');
async function status() { const t = getToken(); return ok({ connector: 'youtube', auth: 'oauth-or-custom', authorized: !!t?.refresh_token, source: t?.source || 'memory', ingest: ['hls', 'rtmps'] }); }
async function authStart() { const missing = missingConfig(); if (missing.length) return fail('missing_youtube_oauth_env', 500, { missing }); return ok({ url: authUrl() }); }
async function authCallback($i) { const code = $i.$_GET?.code; if (!code) return fail('missing_code'); const token = await exchange(code); setToken(token); return ok({ connector: 'youtube', connected: true, hasRefresh: !!token.refresh_token }); }
async function logout() { clearToken(); return ok({ connector: 'youtube', connected: false }); }
async function create($i) { const input = await body($i); const title = input.title || `BH Stream ${new Date().toISOString()}`; const stream = await youtube('liveStreams?part=snippet,cdn', { method: 'POST', body: JSON.stringify({ snippet: { title: `${title} Stream` }, cdn: { ingestionType: input.ingestionType || 'hls', frameRate: input.frameRate || 'variable', resolution: input.resolution || 'variable' } }) }); const broadcast = await youtube('liveBroadcasts?part=snippet,status,contentDetails', { method: 'POST', body: JSON.stringify({ snippet: { title, scheduledStartTime: input.scheduledStartTime || new Date(Date.now() + 60000).toISOString() }, status: { privacyStatus: input.privacyStatus || 'unlisted', selfDeclaredMadeForKids: false }, contentDetails: { enableAutoStart: true, enableAutoStop: true } }) }); const bound = await youtube(`liveBroadcasts/bind?id=${broadcast.id}&streamId=${stream.id}&part=id,snippet,contentDetails,status`, { method: 'POST', body: '{}' }); return ok({ connector: 'youtube', stream, broadcast, bound, ingest: stream.cdn?.ingestionInfo || null }); }
async function transition($i) { const input = await body($i); if (!input.broadcastId || !input.status) return fail('broadcastId_and_status_required'); const broadcast = await youtube(`liveBroadcasts/transition?broadcastStatus=${input.status}&id=${input.broadcastId}&part=id,status`, { method: 'POST', body: '{}' }); return ok({ connector: 'youtube', broadcast }); }
module.exports = { id: 'youtube', actions: { status, 'auth-start': authStart, 'auth-callback': authCallback, logout, create, transition } };
