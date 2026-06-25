// B"H

const DEFAULT_MS = 60 * 60 * 1000;
const SOFT_MS = 5 * 60 * 1000;

function nowMs() { return Date.now(); }
function iso(ms = nowMs()) { return new Date(ms).toISOString(); }
function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
function bool(v, fallback = false) {
  if (v === true || v === 'true') return true;
  if (v === false || v === 'false') return false;
  return fallback;
}
function duration(input = {}) {
  const hours = num(input.leaseHours, 0);
  if (hours) return Math.floor(hours * 60 * 60 * 1000);
  const minutes = num(input.leaseMinutes, 0);
  if (minutes) return Math.floor(minutes * 60 * 1000);
  return num(input.leaseMs || input.defaultLeaseMs, DEFAULT_MS);
}

/**
 * B"H
 * Chapter 543: Time became a servant, not a prison.
 * A lease is not a death sentence. It is a candle with a soft edge: when the
 * flame gets low, the mission checkpoints, dreams, renews, and keeps walking.
 */
function create(input = {}) {
  const startedAtMs = nowMs();
  const leaseMs = duration(input);
  return {
    startedAt: iso(startedAtMs),
    renewedAt: iso(startedAtMs),
    expiresAt: iso(startedAtMs + leaseMs),
    defaultLeaseMs: leaseMs,
    softDeadlineMs: num(input.softDeadlineMs, SOFT_MS),
    autoRenew: bool(input.autoRenewLease ?? input.autoRenew, true),
    renewals: 0,
    maxRenewals: num(input.maxLeaseRenewals, 24),
    checkpointBeforeExpiry: bool(input.checkpointBeforeExpiry, true),
    reason: input.leaseReason || 'mission default lease'
  };
}
function ensure(m, input = {}) {
  m.lease ||= create(input);
  return m.lease;
}
function status(m, input = {}) {
  const lease = ensure(m, input);
  const expiresMs = Date.parse(lease.expiresAt || 0);
  const remainingMs = Math.max(0, expiresMs - nowMs());
  const soft = remainingMs <= num(lease.softDeadlineMs, SOFT_MS);
  const expired = remainingMs <= 0;
  const canRenew = lease.autoRenew !== false && lease.renewals < num(lease.maxRenewals, 24);
  return { lease, remainingMs, softDeadline: soft, expired, canRenew };
}
function renew(m, input = {}) {
  const lease = ensure(m, input);
  const leaseMs = duration({ ...lease, ...input });
  const base = nowMs();
  lease.renewedAt = iso(base);
  lease.expiresAt = iso(base + leaseMs);
  lease.defaultLeaseMs = leaseMs;
  lease.softDeadlineMs = num(input.softDeadlineMs, lease.softDeadlineMs || SOFT_MS);
  lease.autoRenew = bool(input.autoRenewLease ?? input.autoRenew, lease.autoRenew !== false);
  lease.renewals += 1;
  lease.reason = input.reason || input.leaseReason || lease.reason || 'renewed while progress remained';
  return status(m, input);
}
function touch(m, input = {}) {
  const state = status(m, input);
  if ((state.softDeadline || state.expired) && state.canRenew && input.renew !== false) {
    return { ...renew(m, input), renewed: true };
  }
  return { ...state, renewed: false };
}
function nextAction(m, input = {}) {
  const state = status(m, input);
  if (state.expired && !state.canRenew) return { action: 'missionRecovery', missionId: m.id };
  if (state.softDeadline) return { action: 'missionLoopCheckpoint', missionId: m.id, reason: 'lease_soft_deadline' };
  return null;
}

module.exports = { DEFAULT_MS, SOFT_MS, create, ensure, status, renew, touch, nextAction };
