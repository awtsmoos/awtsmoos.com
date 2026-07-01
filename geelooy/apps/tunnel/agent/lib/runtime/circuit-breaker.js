// B"H
const Recovery = require('./recovery-envelope.js');
const DEFAULTS = Object.freeze({
  softLagMs: number(process.env.AWTSMOOS_LAG_SOFT_MS, 500),
  hardLagMs: number(process.env.AWTSMOOS_LAG_HARD_MS, 2000),
  panicLagMs: number(process.env.AWTSMOOS_LAG_PANIC_MS, 5000),
  p3QueueLimit: number(process.env.AWTSMOOS_P3_BREAKER_QUEUE, 64),
  p4QueueLimit: number(process.env.AWTSMOOS_P4_BREAKER_QUEUE, 16),
  advisoryOnly: process.env.AWTSMOOS_LAG_ADVISORY_ONLY === '1'
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
function canAccept(lane, context = {}, limits = DEFAULTS, request = {}) {
  const lagMs = Number(context.eventLoopLag?.lastMs || 0);
  const maxLagMs = Number(context.eventLoopLag?.maxMs || 0);
  const level = levelForLag(lagMs, limits);
  const queued = Number(context.lanes?.[lane]?.queued || 0);
  const wouldHaveBlockedReason = reasonFor(lane, level, queued, limits);
  const base = {
    ok: true,
    status: 202,
    circuitLevel: level,
    eventLoopLagMs: lagMs,
    maxEventLoopLagMs: maxLagMs,
    degraded: level !== 'open' || Boolean(wouldHaveBlockedReason),
    advisoryOnly: limits.advisoryOnly === true,
    reason: wouldHaveBlockedReason ? 'admitted_despite_pressure' : 'accepted',
    wouldHaveBlockedReason,
    retryAfterMs: retryAfterMs(level, wouldHaveBlockedReason)
  };
  if (!wouldHaveBlockedReason || limits.advisoryOnly === true) return base;
  return { ...base, ...Recovery.lagCircuitEnvelope(request, base), reason: wouldHaveBlockedReason };
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
  return { limits, level: levelForLag(lagMs, limits), eventLoopLagMs: lagMs, advisoryOnly: limits.advisoryOnly === true };
}
module.exports = { DEFAULTS, canAccept, levelForLag, reasonFor, snapshot };
