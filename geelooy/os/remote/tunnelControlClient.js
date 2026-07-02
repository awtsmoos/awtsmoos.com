// B"H
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function b64(value) {
  return btoa(unescape(encodeURIComponent(String(value ?? ''))));
}

async function jsonFetch(url) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: { Accept: 'application/json' }
  });
  const data = await response.json().catch(() => ({}));
  return { ...data, httpStatus: response.status, httpOk: response.ok };
}

export async function devices() {
  return await jsonFetch('/api/tunnel/control/devices');
}

export async function myDevice() {
  return await jsonFetch('/api/tunnel/control/my-device');
}

/**
 * B"H
 * A request enters the tunnel like a spark entering a wire of thunder.
 * If the wire trembles with event-loop fire, the spark does not curse the
 * chamber; it waits, returns, and tells the Explorer what truly happened.
 */
export async function fsAction(tunnelName, payload = {}) {
  const shaped = shapePayload(tunnelName, payload);
  return await retryingJsonFetch(() => fsUrl(tunnelName, shaped), shaped.retries ?? 2);
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

async function retryingJsonFetch(urlFactory, retries) {
  let last;
  for (let attempt = 0; attempt <= retries; attempt++) {
    last = await jsonFetch(urlFactory());
    if (!isRetryableTunnelPressure(last) || attempt === retries) return last;
    await sleep(retryDelay(last, attempt));
  }
  return last;
}

function fsUrl(tunnelName, shaped) {
  const u = new URL(`/api/tunnel/control/fs/${encodeURIComponent(tunnelName || 'auto')}`, location.origin);
  for (const [key, value] of Object.entries(shaped)) {
    if (value !== undefined && value !== null && value !== '') u.searchParams.set(key, String(value));
  }
  if (shaped.content) u.searchParams.set('content64', b64(shaped.content));
  return u.toString();
}

function shapePayload(tunnelName, payload = {}) {
  const shaped = { ...payload };
  if (shaped.path && !shaped.p) shaped.p = shaped.path;
  if (shaped.p && !shaped.path) shaped.path = shaped.p;
  if (!shaped.targetVessel && !isVirtualTunnel(tunnelName)) shaped.targetVessel = 'native-tunnel';
  return shaped;
}

function isRetryableTunnelPressure(result = {}) {
  return result.retryable || result.status === 429 || result.httpStatus === 429 || result.error === 'event_loop_lag_circuit_open';
}

function retryDelay(result = {}, attempt = 0) {
  const base = Number(result.retryAfterMs || result.recovery?.retryAfterMs || 700);
  return Math.min(Math.max(base, 350) * (attempt + 1), 4500);
}

function isVirtualTunnel(name = '') {
  return /awtsmoos-(virtual-)?os/.test(String(name));
}
