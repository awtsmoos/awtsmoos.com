// B"H
function jsonFetch(url) {
  return fetch(url, { credentials: 'include', headers: { Accept: 'application/json' } }).then(r => r.json());
}

function b64(value) {
  return btoa(unescape(encodeURIComponent(String(value ?? ''))));
}

export async function devices() {
  return await jsonFetch('/api/tunnel/control/devices');
}

export async function myDevice() {
  return await jsonFetch('/api/tunnel/control/my-device');
}

/**
 * B"H
 * The hosted route documents `p`, while old OS code sent only `path`.
 * Now both names travel together, so the native vessel receives the real root
 * instead of falling into a shadow default.
 */
export async function fsAction(tunnelName, payload = {}) {
  const u = new URL(`/api/tunnel/control/fs/${encodeURIComponent(tunnelName || 'auto')}`, location.origin);
  const shaped = shapePayload(tunnelName, payload);
  for (const [key, value] of Object.entries(shaped)) {
    if (value !== undefined && value !== null && value !== '') u.searchParams.set(key, String(value));
  }
  if (payload.content) u.searchParams.set('content64', b64(payload.content));
  return await jsonFetch(u.toString());
}

export async function previewCreate(preview = {}) {
  const u = new URL('/api/tunnel/control/preview/create', location.origin);
  u.searchParams.set('preview64', b64(JSON.stringify(preview)));
  return await jsonFetch(u.toString());
}

export async function previewList() {
  return await jsonFetch('/api/tunnel/control/preview/list');
}

export async function previewRevoke(id) {
  return await jsonFetch(`/api/tunnel/control/preview/revoke?previewId=${encodeURIComponent(id)}`);
}

function shapePayload(tunnelName, payload = {}) {
  const shaped = { ...payload };
  if (shaped.path && !shaped.p) shaped.p = shaped.path;
  if (shaped.p && !shaped.path) shaped.path = shaped.p;
  if (!shaped.targetVessel && !isVirtualTunnel(tunnelName)) shaped.targetVessel = 'native-tunnel';
  return shaped;
}

function isVirtualTunnel(name = '') {
  return /awtsmoos-(virtual-)?os/.test(String(name));
}
