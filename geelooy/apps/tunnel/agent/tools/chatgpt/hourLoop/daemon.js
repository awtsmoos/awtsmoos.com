// B"H
const Tick = require('./tick.js');
const State = require('./state.js');
const C = require('./constants.js');
const timers = new Map();

/** B"H — Chapter 1953: The daemon taps, never grips. */
function start(input = {}) {
  const key = input.conversationId || input.sessionId || 'default';
  stop(key);
  const intervalMs = Math.max(1000, Number(input.intervalMs || C.STRESS_PROBE_INTERVAL_MS));
  const timer = setInterval(() => Tick.run(input).catch(() => null), intervalMs);
  timer.unref?.();
  timers.set(key, timer);
  return { ok: true, key, intervalMs, running: true };
}
function stop(key = 'default') {
  const timer = timers.get(key);
  if (timer) clearInterval(timer);
  timers.delete(key);
  return { ok: true, key, running: false };
}
function status(base) {
  const state = State.read(base || process.env.HOME);
  return { ok: true, running: [...timers.keys()], sessions: Object.keys(state.sessions || {}), queued: Object.keys(state.queue || {}).length, receipts: (state.receipts || []).length };
}
module.exports = { start, stop, status, timers };
