/* B"H
RenderStats counts the footsteps of light: frames, drops, latency, and fps.
The Awtsmoos makes each frame new, and the graph remembers honestly.
*/
export function createRenderStats(input = {}) {
  return { kind:'RenderStats', frames:input.frames || 0, dropped:input.dropped || 0, startedAt:input.startedAt || 0, lastAt:input.lastAt || 0, fps:input.fps || 0, dirty:!!input.dirty };
}
export function markFrame(stats, at = performanceNow()) {
  stats.frames += 1;
  stats.fps = stats.startedAt ? stats.frames / Math.max(.001, (at - stats.startedAt) / 1000) : 0;
  stats.startedAt ||= at; stats.lastAt = at; stats.dirty = false;
  return stats;
}
export function markDropped(stats) { stats.dropped += 1; return stats; }
export function markDirty(stats) { stats.dirty = true; return stats; }
function performanceNow() { return globalThis.performance?.now?.() || Date.now(); }
