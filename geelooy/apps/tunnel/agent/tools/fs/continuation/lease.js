// B"H
const ONE_HOUR_MS = 3600000;
const FOREVER_UNTIL = '9999-12-31T23:59:59.999Z';
const DEFAULTS = {
  minimumRunMs: ONE_HOUR_MS,
  minimumSteps: 8,
  stopAllowed: false,
  forever: true
};

function number(value, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback;
}

function truthy(value) {
  return value === true || value === 'true' || value === undefined || value === null || value === '';
}

function nowMs() {
  return Date.now();
}

function foreverMode(payload = {}) {
  return payload.forever === true || payload.forever === 'true' ||
    (payload.forever !== false && payload.forever !== 'false' && payload.minimumRunRequired !== false && payload.minimumRunRequired !== 'false');
}

function untilFrom(payload = {}, started = nowMs()) {
  if (foreverMode(payload)) return Date.parse(FOREVER_UNTIL);
  const explicit = Date.parse(payload.minimumUntil || payload.minimumRunUntil || payload.leaseUntil || '');
  if (Number.isFinite(explicit)) return explicit;
  const ms = number(payload.minimumRunMs || payload.minimumMs || payload.leaseMs, DEFAULTS.minimumRunMs, 1000, 24 * ONE_HOUR_MS);
  return started + ms;
}

/**
 * B"H
 * Forever mode means no soft completion may close the gate. Each call remains
 * short, but the mission lease keeps reincarnating until explicit cancel/safety.
 */
function normalize(payload = {}, started = nowMs()) {
  const minimumUntilMs = untilFrom(payload, started);
  const forever = foreverMode(payload);
  const remainingMinimumMs = Math.max(0, minimumUntilMs - nowMs());
  return {
    forever,
    minimumRunRequired: truthy(payload.minimumRunRequired),
    minimumUntilMs,
    minimumUntil: new Date(minimumUntilMs).toISOString(),
    remainingMinimumMs,
    minimumSteps: number(payload.minimumSteps, DEFAULTS.minimumSteps, 1, 50000)
  };
}

function active(lease) {
  return !!lease?.minimumRunRequired && (lease.forever || nowMs() < lease.minimumUntilMs);
}

function decorate(output = {}, lease) {
  const forever = !!lease?.forever;
  const remainingMinimumMs = forever ? Number.MAX_SAFE_INTEGER : Math.max(0, (lease?.minimumUntilMs || 0) - nowMs());
  return {
    ...output,
    forever,
    minimumRunRequired: !!lease?.minimumRunRequired,
    minimumUntil: lease?.minimumUntil || null,
    remainingMinimumMs,
    stopAllowed: false,
    whyStopDenied: forever ? 'FOREVER_CONTINUATION_LOCK_ACTIVE' : (remainingMinimumMs > 0 ? 'MINIMUM_ONE_HOUR_NOT_MET' : '')
  };
}

module.exports = { ONE_HOUR_MS, FOREVER_UNTIL, DEFAULTS, normalize, active, decorate, foreverMode };
