/* B"H */
const DEFAULT_BASE = 'http://127.0.0.1:3977';
export function makeLocalTunnelStreaming(base = DEFAULT_BASE) {
  return {
    status: sessionId => callJson(base, '/streaming/status', sessionId ? { sessionId } : undefined),
    start: payload => callJson(base, '/streaming/start', payload),
    pushChunk: payload => callJson(base, '/streaming/chunk', payload),
    pushHlsSegment: payload => callJson(base, '/streaming', { action: 'streamingHlsSegmentPush', ...payload }),
    pushHlsSegmentRaw: payload => pushRaw(base, payload),
    playlist: payload => callJson(base, '/streaming', { action: 'streamingHlsPlaylist', ...payload }),
    stop: payload => callJson(base, '/streaming/stop', payload),
    tool: payload => callJson(base, '/tool', { kind: 'streaming', ...payload })
  };
}
export async function chunkToBase64(chunk) {
  const bytes = chunk instanceof Uint8Array ? chunk : new Uint8Array(await chunk.arrayBuffer?.() || chunk);
  let binary = ''; const size = 0x8000;
  for (let i = 0; i < bytes.length; i += size) binary += String.fromCharCode(...bytes.subarray(i, i + size));
  return btoa(binary);
}
export async function pushMuxedHlsSegment(tunnel, sessionId, segment) {
  if (segment.raw !== false && tunnel.pushHlsSegmentRaw) return tunnel.pushHlsSegmentRaw({ sessionId, ...segment });
  return tunnel.pushHlsSegment({ sessionId, index: segment.index, duration: segment.duration, name: segment.name, chunk64: await chunkToBase64(segment.bytes) });
}
async function pushRaw(base, payload) {
  if (!payload.sessionId) throw new Error('sessionId_required');
  const name = encodeURIComponent(payload.name || `seg-${String(payload.index || 0).padStart(6, '0')}.ts`);
  const bytes = payload.bytes instanceof Uint8Array ? payload.bytes : new Uint8Array(await payload.bytes.arrayBuffer?.() || payload.bytes);
  const res = await fetch(`${base}/streaming/hls-segment/${encodeURIComponent(payload.sessionId)}/${name}`, { method:'POST', headers:{ 'content-type':payload.contentType || 'video/mp2t', 'x-awtsmoos-duration':String(payload.duration || 2), 'x-awtsmoos-index':String(payload.index || 0) }, body:bytes });
  const data = await res.json(); if (!data.ok) throw new Error(data.error || 'raw_hls_segment_failed'); return data;
}
async function callJson(base, path, body) {
  const options = body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {};
  const res = await fetch(base + path, options); const data = await res.json(); if (!data.ok) throw new Error(data.error || 'local_tunnel_streaming_failed'); return data;
}
