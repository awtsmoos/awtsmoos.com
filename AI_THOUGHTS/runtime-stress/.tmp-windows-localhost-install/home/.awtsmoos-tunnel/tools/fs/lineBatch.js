// B"H
const { readLines } = require("./searchEdit.js");

/**
 * B"H
 * Reads many exact line ranges in one structured breath.
 *
 * Agents often need five little windows into five files. This helper turns that
 * scattered PowerShell ritual into one bounded native action.
 *
 * @param {object} config Agent config.
 * @param {object} payload Payload with ranges array.
 * @returns {Promise<object>} Batch line result.
 */
async function readManyLines(config, payload = {}) {
  const ranges = Array.isArray(payload.ranges) ? payload.ranges : [];
  const maxRanges = Math.max(1, Math.min(Number(payload.maxRanges || 20), 60));
  const chosen = ranges.slice(0, maxRanges);
  const results = [];

  if (!chosen.length) {
    return {
      ok: false,
      action: "readManyLines",
      error: "missing_ranges",
      expectedShape: { ranges: [{
        path: "file.js",
        startLine: 1,
        endLine: 80
      }] }
    };
  }

  for (const range of chosen) {
    try {
      results.push(await readLines(config, {
        ...payload,
        path: range.path || range.p,
        startLine: range.startLine || 1,
        endLine: range.endLine || 250
      }));
    } catch (e) {
      results.push({
        ok: false,
        action: "readLines",
        path: range.path || range.p,
        error: e.message
      });
    }
  }

  return {
    ok: results.every(x => x.ok !== false),
    action: "readManyLines",
    count: results.length,
    partial: ranges.length > chosen.length,
    results
  };
}

module.exports = { readManyLines };
