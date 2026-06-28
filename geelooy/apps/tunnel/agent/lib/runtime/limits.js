// B"H
const os = require('os');
function boundedNumber(value, fallback, min, max) { const n = Number(value || fallback); return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback; }
const CPU_COUNT = Math.max(1, os.cpus?.().length || 1);
const STRICT_ORDERING = process.env.AWTSMOOS_STRICT_ORDERING === '1';
const DEFAULT_MAX_INFLIGHT = STRICT_ORDERING ? 1 : Math.min(64, Math.max(16, CPU_COUNT * 4));
module.exports = { boundedNumber, CPU_COUNT, STRICT_ORDERING, MAX_INFLIGHT: boundedNumber(process.env.AWTSMOOS_MAX_INFLIGHT, DEFAULT_MAX_INFLIGHT, 1, 128), MAX_QUEUE: boundedNumber(process.env.AWTSMOOS_MAX_QUEUE, 5000, 0, 50000), REQUEST_MAX_AGE_MS: boundedNumber(process.env.AWTSMOOS_REQUEST_MAX_AGE_MS, 86400000, 1000, 604800000), MAX_PROXY_BYTES: boundedNumber(process.env.AWTSMOOS_MAX_PROXY_BYTES, 268435456, 1048576, 1073741824), RECONNECT_MIN_MS: boundedNumber(process.env.AWTSMOOS_RECONNECT_MIN_MS, 1000, 250, 60000), RECONNECT_MAX_MS: boundedNumber(process.env.AWTSMOOS_RECONNECT_MAX_MS, 30000, boundedNumber(process.env.AWTSMOOS_RECONNECT_MIN_MS, 1000, 250, 60000), 300000), WATCHDOG_MS: boundedNumber(process.env.AWTSMOOS_TUNNEL_WATCHDOG_MS, 45000, 5000, 600000), WATCHDOG_STALE_MS: boundedNumber(process.env.AWTSMOOS_TUNNEL_STALE_MS, 120000, 45000, 1800000) };
