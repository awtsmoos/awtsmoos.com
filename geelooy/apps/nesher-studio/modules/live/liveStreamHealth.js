/* B"H
Live stream health: HLS runtime facts become one stable model for UI and tests.
Every packet is a footprint; the Awtsmoos renews the whole river each instant.
*/
import { formatBytes, formatFps, formatRate, streamVerdict } from './streamStatsFormat.js';

export function createLiveStreamHealth(clock = () => Date.now()) {
  return { clock, startedAt:0, lastUploaded:0, lastCheckedAt:0, session:'', last:null };
}
export function beginLiveHealth(model, session = '') {
  const now = model.clock();
  Object.assign(model, { startedAt:now, lastCheckedAt:now, lastUploaded:0, session, last:null });
  return snapshot(model, { state:'Starting', session });
}
export function readLiveHealth(model, stream, state = 'Running') {
  const s = stream?.state || {}, now = model.clock(), uploaded = Number(s.uploaded || 0);
  const elapsedMs = Math.max(1, now - (model.startedAt || now));
  const deltaMs = Math.max(1, now - (model.lastCheckedAt || now));
  const rate = (uploaded - (model.lastUploaded || 0)) * 1000 / deltaMs;
  model.lastUploaded = uploaded; model.lastCheckedAt = now;
  return snapshot(model, { state, session:stream?.sessionId || model.session, frames:s.frameIndex || 0, segments:s.segments?.length || 0, uploaded, errors:s.errors?.length || 0, elapsedMs, bytesPerSecond:rate });
}
export function finishLiveHealth(model, stopped = {}, state = 'Stopped') {
  return snapshot(model, { state, session:stopped.sessionId || model.session, frames:stopped.frames || 0, segments:stopped.segments || 0, uploaded:stopped.uploaded || 0, errors:stopped.errors?.length || 0, elapsedMs:Math.max(1, model.clock() - (model.startedAt || model.clock())) });
}
function snapshot(model, data) {
  const full = { frames:0, segments:0, uploaded:0, errors:0, elapsedMs:1, bytesPerSecond:0, ...data };
  full.verdict = streamVerdict(full);
  full.summary = `${full.state} · ${full.verdict} · ${formatFps(full.frames, full.elapsedMs)} · ${formatRate(full.bytesPerSecond)} · ${formatBytes(full.uploaded)}`;
  model.last = full; return full;
}
