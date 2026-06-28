// B"H
const SKIP = new Set(['actionHistoryList', 'actionHistoryGet', 'actionHistorySearch']);
const DEFAULTS = { maxEntries: 80, maxAgeMs: 2 * 60 * 60 * 1000, maxResultFiles: 160 };
function clamp(value, min, max, fallback) { return Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : fallback; }
function retention(config = {}) {
  const got = config.actionHistoryRetention || config.historyRetention || {};
  return {
    maxEntries: clamp(Number(got.maxEntries || process.env.AWTSMOOS_ACTION_HISTORY_MAX_ENTRIES || DEFAULTS.maxEntries), 10, 1000, DEFAULTS.maxEntries),
    maxAgeMs: clamp(Number(got.maxAgeMs || process.env.AWTSMOOS_ACTION_HISTORY_MAX_AGE_MS || DEFAULTS.maxAgeMs), 60000, 86400000, DEFAULTS.maxAgeMs),
    maxResultFiles: clamp(Number(got.maxResultFiles || process.env.AWTSMOOS_ACTION_RESULT_MAX_FILES || DEFAULTS.maxResultFiles), 20, 5000, DEFAULTS.maxResultFiles)
  };
}
module.exports = { SKIP, DEFAULTS, retention };
