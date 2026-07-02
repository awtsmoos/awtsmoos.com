// B"H
const Recovery = require('./recovery-envelope.js');

const DEFAULTS = Object.freeze({
  softLagMs: number(process.env.AWTSMOOS_LAG_SOFT_MS, 500),
  hardLagMs: number(process.env.AWTSMOOS_LAG_HARD_MS, 2000),
  panicLagMs: number(process.env.AWTSMOOS_LAG_PANIC_MS, 5000),
  p3QueueLimit: number(process.env.AWTSMOOS_P3_BREAKER_QUEUE, 64),
  p4QueueLimit: number(process.env.AWTSMOOS_P4_BREAKER_QUEUE, 16),
  workerFreshMs: number(process.env.AWTSMOOS_BREAKER_WORKER_FRESH_MS, 45000),
  recentSuccessMs: number(process.env.AWTSMOOS_BREAKER_RECENT_SUCCESS_MS, 120000),
  advisoryOnly: process.env.AWTSMOOS_LAG_ADVISORY_ONLY === '1'
});

const LAG_REASONS = new Set([
  'kernel_panic_lag_only_p0',
  'kernel_hard_lag_only_p0',
  'kernel_soft_lag_blocks_bulk'
]);

/**
 * B"H
 * The breaker is not a padlock on the whole palace. Lag is weather: report it,
 * mark the road slippery, but let isolated workers and other agents pass. Only
 * real queue saturation closes a gate. Thus one long process cannot become a
 * Pharaoh over every other shliach in the tunnel.
 */
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
  const pressureReason = reasonFor(lane, level, queued, limits);
  const liveness = livePressureEvidence(context, limits);
  const hardBlock = blockingReason(pressureReason, liveness, limits);
  const base = {
    ok: true,
    status: 202,
    circuitLevel: level,
    eventLoopLagMs: lagMs,
    maxEventLoopLagMs: maxLagMs,
    degraded: level !== 'open' || Boolean(pressureReason),
    advisoryOnly: limits.advisoryOnly === true,
    pressureReason,
    blockingReason: hardBlock,
    liveness,
    reason: pressureReason ? 'admitted_despite_pressure' : 'accepted',
    wouldHaveBlockedReason: pressureReason,
    retryAfterMs: retryAfterMs(level, pressureReason)
  };
  if (!hardBlock || limits.advisoryOnly === true) return base;
  return { ...base, ...Recovery.lagCircuitEnvelope(request, base), reason: hardBlock, blockingReason: hardBlock };
}

function blockingReason(reason, liveness = {}, _limits = DEFAULTS) {
  if (!reason || LAG_REASONS.has(reason)) return '';
  if (liveness.saturated || /backpressure/.test(reason)) return reason;
  return '';
}

function reasonFor(lane, level, queued, limits = DEFAULTS) {
  if (lane === 'p0_control') return '';
  if (lane === 'p4_bulk' && queued >= limits.p4QueueLimit) return 'p4_backpressure';
  if (lane === 'p3_heavy' && queued >= limits.p3QueueLimit) return 'p3_backpressure';
  if (level === 'panic') return 'kernel_panic_lag_only_p0';
  if (level === 'hard') return 'kernel_hard_lag_only_p0';
  if (level === 'soft' && lane === 'p4_bulk') return 'kernel_soft_lag_blocks_bulk';
  return '';
}

function livePressureEvidence(context = {}, limits = DEFAULTS) {
  const now = Date.now();
  const active = context.workers?.active || {};
  const freshWorker = Object.values(active).some(worker => freshTime(worker?.heartbeatAt || worker?.startedAt, now, limits.workerFreshMs));
  const recentSuccess = freshMs(now - Number(context.lastSuccessfulActionAt || 0), limits.recentSuccessMs);
  const queued = Object.values(context.lanes || {}).reduce((sum, lane) => sum + Number(lane?.queued || 0), 0);
  const saturated = queued >= Number(context.maxQueue || Infinity);
  return { freshWorker, recentSuccess, saturated, canRoute: !saturated && (freshWorker || recentSuccess) };
}

function freshTime(value, now, limit) {
  const time = Date.parse(value || '');
  return Number.isFinite(time) && freshMs(now - time, limit);
}

function freshMs(age, limit) {
  return Number.isFinite(age) && age >= 0 && age <= limit;
}

function retryAfterMs(level, reason) {
  if (!reason) return 0;
  if (level === 'panic') return 3000;
  if (level === 'hard') return 2000;
  return 1000;
}

function snapshot(context = {}, limits = DEFAULTS) {
  const lagMs = Number(context.eventLoopLag?.lastMs || 0);
  const level = levelForLag(lagMs, limits);
  return { limits, level, eventLoopLagMs: lagMs, advisoryOnly: limits.advisoryOnly === true, liveness: livePressureEvidence(context, limits) };
}

module.exports = { DEFAULTS, blockingReason, canAccept, levelForLag, livePressureEvidence, reasonFor, snapshot };
