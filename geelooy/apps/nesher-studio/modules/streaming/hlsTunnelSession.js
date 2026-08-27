/* B"H
Session helper: start once, push many muxed HLS segments, then close with final playlist.
*/
import { makeLocalTunnelStreaming, pushMuxedHlsSegment } from './localTunnelStreaming.js';
import { makeSegmentQueue } from './segmentQueue.js';
export function makeHlsTunnelSession(options = {}) {
  const tunnel = makeLocalTunnelStreaming(options.base);
  const queue = makeSegmentQueue({ maxQueued: options.maxQueued || 12 });
  let sessionId = null;
  return { start, enqueueSegment, flush, stop, status, sessionId: () => sessionId };
  async function start(payload = {}) {
    const out = await tunnel.start({ connector: payload.connector || 'custom', mode: 'hls', targetDuration: payload.targetDuration || 2, maxSegments: payload.maxSegments || 6, ingest: payload.ingest || {} });
    sessionId = out.session.id;
    return out;
  }
  function enqueueSegment(segment) { queue.push(segment); }
  async function flush() { if (!sessionId) throw new Error('hls_tunnel_session_not_started'); return queue.flush(segment => pushMuxedHlsSegment(tunnel, sessionId, segment)); }
  async function stop() { if (!sessionId) return null; const out = await tunnel.stop({ sessionId }); sessionId = null; return out; }
  async function status() { return tunnel.status(sessionId); }
}
