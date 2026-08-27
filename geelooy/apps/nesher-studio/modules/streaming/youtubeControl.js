/* B"H */
export async function youtubeStatus() { return api('/api/youtube/auth/status'); }
export async function youtubeAuthStart() { return api('/api/youtube/auth/start'); }
export async function createLive(title) { return api('/api/youtube/live/create', { title, ingestionType:'hls', privacyStatus:'unlisted' }); }
export async function transitionLive(broadcastId, status) { return api('/api/youtube/live/transition', { broadcastId, status }); }
async function api(url, body) {
  const options = body ? { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify(body) } : {};
  const res = await fetch(url, options); const data = await res.json(); if (!data.ok) throw new Error(data.error || 'youtube_api_failed'); return data;
}
