/* B"H
Pipeline coordinator: plan encoders, accept muxed segments, and push them through the local tunnel.
*/
import { makeWebCodecsPlan } from './webCodecsPlan.js';
import { makeHlsTunnelSession } from './hlsTunnelSession.js';
export function makeStreamPipeline(state, options = {}) {
  const plan = makeWebCodecsPlan(state, options);
  const hls = makeHlsTunnelSession({ base: options.base, maxQueued: options.maxQueued || 12 });
  let started = false;
  return { plan, start, pushMuxedSegment, flush, stop, status, isStarted: () => started };
  async function start(payload = {}) {
    const out = await hls.start({ connector: payload.connector || options.connector || 'custom', targetDuration: plan.segment.targetDuration, maxSegments: payload.maxSegments || 6, ingest: payload.ingest || options.ingest || {} });
    started = true;
    return { ...out, plan };
  }
  function pushMuxedSegment(bytes, meta = {}) {
    if (!started) throw new Error('stream_pipeline_not_started');
    hls.enqueueSegment({ bytes, index: meta.index, name: meta.name, duration: meta.duration || plan.segment.targetDuration });
  }
  async function flush() { return hls.flush(); }
  async function stop() { const out = await hls.stop(); started = false; return out; }
  async function status() { return hls.status(); }
}
