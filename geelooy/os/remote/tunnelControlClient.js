// B"H
function jsonFetch(url) { return fetch(url, { credentials:'include', headers:{ Accept:'application/json' } }).then(r => r.json()); }
function b64(value) { return btoa(unescape(encodeURIComponent(String(value ?? '')))); }
export async function devices() { return await jsonFetch('/api/tunnel/control/devices'); }
export async function myDevice() { return await jsonFetch('/api/tunnel/control/my-device'); }
export async function fsAction(tunnelName, payload = {}) {
  const u = new URL(`/api/tunnel/control/fs/${encodeURIComponent(tunnelName || 'auto')}`, location.origin);
  for (const [k, v] of Object.entries(payload)) if (v !== undefined && v !== null && v !== '') u.searchParams.set(k, String(v));
  if (payload.content) u.searchParams.set('content64', b64(payload.content));
  return await jsonFetch(u.toString());
}
export async function previewCreate(preview = {}) {
  const u = new URL('/api/tunnel/control/preview/create', location.origin);
  u.searchParams.set('preview64', b64(JSON.stringify(preview)));
  return await jsonFetch(u.toString());
}
export async function previewList() { return await jsonFetch('/api/tunnel/control/preview/list'); }
export async function previewRevoke(id) { return await jsonFetch(`/api/tunnel/control/preview/revoke?previewId=${encodeURIComponent(id)}`); }
/** B"H: browser Geelooy OS speaks to the hosted tunnel-control gate, not raw root. */
