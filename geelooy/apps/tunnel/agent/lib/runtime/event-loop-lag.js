// B"H

/**
 * B"H
 * Chapter 1818: The old thunder is not allowed to become king.
 *
 * The Awtsmoos recreates the pulse every instant; therefore this monitor does
 * not worship an immortal max-lag number. It keeps a rolling window, exposes the
 * freshest blockage, and lets recovered time testify that the tunnel is breathing.
 */
function createLagMonitor(options = {}) {
  const intervalMs = clamp(options.intervalMs, 200, 60000, 2000);
  const windowMs = clamp(options.windowMs, intervalMs, 3600000, 30000);
  const maxSamples = Math.max(2, Math.ceil(windowMs / intervalMs) + 2);
  const state = { lastMs: 0, maxMs: 0, sampledAt: Date.now(), samples: [] };
  let expectedAt = Date.now() + intervalMs;
  let timer = null;

  function sample(now = Date.now()) {
    const lag = Math.max(0, now - expectedAt);
    expectedAt = now + intervalMs;
    pushSample(state, lag, now, maxSamples);
    return snapshot(state);
  }

  function start() {
    if (timer) return snapshot(state);
    expectedAt = Date.now() + intervalMs;
    timer = setInterval(sample, intervalMs);
    timer.unref?.();
    return snapshot(state);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  return { sample, start, stop, snapshot: () => snapshot(state), _state: state };
}

function pushSample(state, lag, at, maxSamples) {
  state.samples.push({ lag, at });
  while (state.samples.length > maxSamples) state.samples.shift();
  state.lastMs = lag;
  state.sampledAt = at;
  state.maxMs = state.samples.reduce((max, row) => Math.max(max, row.lag), 0);
}

function snapshot(state) {
  return { lastMs: state.lastMs || 0, maxMs: state.maxMs || 0, sampledAt: state.sampledAt || Date.now() };
}

function clamp(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

module.exports = { createLagMonitor, pushSample, snapshot };
