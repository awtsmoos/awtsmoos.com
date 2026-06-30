// B"H

/**
 * B"H
 * Chapter 1801: The gate no longer shut; it whispered the storm level instead.
 *
 * This breaker is advisory by design. It never blocks a request. It marks the
 * pressure, estimates retry-after, and lets the scheduler/queues carry the load.
 * P0 remains sacred; P1-P4 are admitted with degraded metadata even in panic.
 */
const DEFAULTS = Object.freeze({
  softLagMs: number(process.env.AWTSMOOS_LAG_SOFT_MS, 500),
  hardLagMs: number(process.env.AWTSMOOS_LAG_HARD_MS, 2000),
  panicLagMs: number(process.env.AWTSMOOS_LAG_PANIC_MS, 5000),
  p3QueueLimit: number(process.env.AWTSMOOS_P3_BREAKER_QUEUE, 64),
  p4QueueLimit: number(process.env.AWTSMOOS_P4_BREAKER_QUEUE, 16),
  advisoryOnly: true
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
  const wouldHaveBlockedReason = reasonFor(lane, level, queued, limits);
  return {
    ok: true,
    status: 202,
    circuitLevel: level,
    eventLoopLagMs: lagMs,
    degraded: level !== 'open' || Boolean(wouldHaveBlockedReason),
    advisoryOnly: true,
    reason: wouldHaveBlockedReason ? 'admitted_despite_pressure' : 'accepted',
    wouldHaveBlockedReason,
    retryAfterMs: retryAfterMs(level, wouldHaveBlockedReason)
  };
}
function reasonFor(lane, level, queued, limits = DEFAULTS) {
  if (lane === 'p0_control') return '';
  if (level === 'panic') return 'kernel_panic_lag_only_p0';
  if (level === 'hard') return 'kernel_hard_lag_only_p0';
  if (level === 'soft' && lane === 'p4_bulk') return 'kernel_soft_lag_blocks_bulk';
  if (lane === 'p4_bulk' && queued >= limits.p4QueueLimit) return 'p4_backpressure';
  if (lane === 'p3_heavy' && queued >= limits.p3QueueLimit) return 'p3_backpressure';
  return '';
}
function retryAfterMs(level, reason) {
  if (!reason) return 0;
  if (level === 'panic') return 3000;
  if (level === 'hard') return 2000;
  return 1000;
}
function snapshot(context = {}, limits = DEFAULTS) {
  const lagMs = Number(context.eventLoopLag?.lastMs || 0);
  return { limits, level: levelForLag(lagMs, limits), eventLoopLagMs: lagMs, advisoryOnly: true };
}
module.exports = { DEFAULTS, canAccept, levelForLag, reasonFor, snapshot };
