// B"H
const os = require('os');
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
function boundedNumber(value, fallback, min, max) {
  const n = Number(value || fallback);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback;
}
const CPU_COUNT = Math.max(1, os.cpus?.().length || 1);
const STRICT_ORDERING = process.env.AWTSMOOS_STRICT_ORDERING === '1';
const DEFAULT_MAX_INFLIGHT = STRICT_ORDERING ? 1 : Math.min(64, Math.max(16, CPU_COUNT * 4));
const MAX_INFLIGHT = boundedNumber(process.env.AWTSMOOS_MAX_INFLIGHT, DEFAULT_MAX_INFLIGHT, 1, 128);
const MAX_QUEUE = boundedNumber(process.env.AWTSMOOS_MAX_QUEUE, 5000, 0, 50000);
const LANE_LIMITS = Object.freeze({
  p0_control: boundedNumber(process.env.AWTSMOOS_P0_INFLIGHT, 8, 1, 32),
  p1_fs_light: boundedNumber(process.env.AWTSMOOS_P1_INFLIGHT, Math.min(16, Math.max(4, CPU_COUNT * 2)), 1, 64),
  p2_chrome_light: boundedNumber(process.env.AWTSMOOS_P2_INFLIGHT, 4, 1, 16),
  p3_heavy: boundedNumber(process.env.AWTSMOOS_P3_INFLIGHT, Math.min(16, Math.max(4, CPU_COUNT)), 1, 64),
  p4_bulk: boundedNumber(process.env.AWTSMOOS_P4_INFLIGHT, 2, 1, 16)
});
const LANE_TIMEOUT_MS = Object.freeze({
  p0_control: boundedNumber(process.env.AWTSMOOS_P0_TIMEOUT_MS, 5 * MINUTE, 5 * SECOND, DAY),
  p1_fs_light: boundedNumber(process.env.AWTSMOOS_P1_TIMEOUT_MS, 30 * MINUTE, 5 * SECOND, DAY),
  p2_chrome_light: boundedNumber(process.env.AWTSMOOS_P2_TIMEOUT_MS, 30 * MINUTE, 5 * SECOND, DAY),
  p3_heavy: boundedNumber(process.env.AWTSMOOS_P3_TIMEOUT_MS, 4 * HOUR, 5 * SECOND, 7 * DAY),
  p4_bulk: boundedNumber(process.env.AWTSMOOS_P4_TIMEOUT_MS, 12 * HOUR, 5 * SECOND, 7 * DAY)
});
const REQUEST_MAX_AGE_MS = boundedNumber(process.env.AWTSMOOS_REQUEST_MAX_AGE_MS, 7 * DAY, MINUTE, 30 * DAY);
const KEEPALIVE_MS = boundedNumber(process.env.AWTSMOOS_TUNNEL_KEEPALIVE_MS, 25 * SECOND, 5 * SECOND, 5 * MINUTE);
const LONG_LIVED_CONNECTIONS = process.env.AWTSMOOS_LONG_LIVED_CONNECTIONS !== '0';
module.exports = {
  boundedNumber,
  CPU_COUNT,
  STRICT_ORDERING,
  MAX_INFLIGHT,
  MAX_QUEUE,
  LANE_LIMITS,
  LANE_TIMEOUT_MS,
  REQUEST_MAX_AGE_MS,
  KEEPALIVE_MS,
  LONG_LIVED_CONNECTIONS,
  MAX_PROXY_BYTES: boundedNumber(process.env.AWTSMOOS_MAX_PROXY_BYTES, 268435456, 1048576, 1073741824),
  RECONNECT_MIN_MS: boundedNumber(process.env.AWTSMOOS_RECONNECT_MIN_MS, 1000, 250, 60000),
  RECONNECT_MAX_MS: boundedNumber(process.env.AWTSMOOS_RECONNECT_MAX_MS, 30000, boundedNumber(process.env.AWTSMOOS_RECONNECT_MIN_MS, 1000, 250, 60000), 300000),
  WATCHDOG_MS: boundedNumber(process.env.AWTSMOOS_TUNNEL_WATCHDOG_MS, 45000, 5000, 600000),
  WATCHDOG_STALE_MS: boundedNumber(process.env.AWTSMOOS_TUNNEL_STALE_MS, 120000, 45000, 1800000)
};
