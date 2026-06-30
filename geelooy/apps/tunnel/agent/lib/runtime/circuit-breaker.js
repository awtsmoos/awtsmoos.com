// B"H

/**
 * B"H
 * Chapter 1501: The kernel learned to say no before it forgot how to breathe.
 *
 * A priority queue is mercy, but a circuit breaker is gevurah. When the event
 * loop trembles, P0 still enters the palace while heavy caravans wait outside.
 */
const DEFAULTS = Object.freeze({
  softLagMs: number(process.env.AWTSMOOS_LAG_SOFT_MS, 500),
  hardLagMs: number(process.env.AWTSMOOS_LAG_HARD_MS, 2000),
  panicLagMs: number(process.env.AWTSMOOS_LAG_PANIC_MS, 5000),
  p3QueueLimit: number(process.env.AWTSMOOS_P3_BREAKER_QUEUE, 64),
  p4QueueLimit: number(process.env.AWTSMOOS_P4_BREAKER_QUEUE, 16)
});
function number(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}
function levelForLag(lagMs = 0, limits = DEFAULTS) {
  const lag = Number(lagMs || 0);
  if (lag >= limits.panicLagMs) return 'panic';
  if (lag >= limits.hardLagMs) return 'hard';
  if (lag >= limits.softLagMs) return 'soft';
  return 'open';
}
function canAccept(lane, context = {}, limits = DEFAULTS) {
  const lagMs = Number(context.eventLoopLag?.lastMs || 0);
  const level = levelForLag(lagMs, limits);
  const queued = Number(context.lanes?.[lane]?.queued || 0);
  if (lane === 'p0_control') return allow(level, lagMs, 'p0_is_sacred');
  if (level === 'panic') return deny(level, lagMs, 'kernel_panic_lag_only_p0');
  if (level === 'hard') return deny(level, lagMs, 'kernel_hard_lag_only_p0');
  if (level === 'soft' && lane === 'p4_bulk') return deny(level, lagMs, 'kernel_soft_lag_blocks_bulk');
  if (lane === 'p4_bulk' && queued >= limits.p4QueueLimit) return deny(level, lagMs, 'p4_backpressure');
  if (lane === 'p3_heavy' && queued >= limits.p3QueueLimit) return deny(level, lagMs, 'p3_backpressure');
  return allow(level, lagMs, 'accepted');
}
function allow(level, lagMs, reason) { return { ok:true, status:202, circuitLevel:level, eventLoopLagMs:lagMs, reason }; }
function deny(level, lagMs, reason) { return { ok:false, status:503, error:'agent_circuit_breaker_open', circuitLevel:level, eventLoopLagMs:lagMs, reason, retryAfterMs:level === 'soft' ? 1000 : 3000 }; }
function snapshot(context = {}, limits = DEFAULTS) {
  const lagMs = Number(context.eventLoopLag?.lastMs || 0);
  return { limits, level:levelForLag(lagMs, limits), eventLoopLagMs:lagMs };
}
module.exports = { DEFAULTS, canAccept, levelForLag, snapshot };
