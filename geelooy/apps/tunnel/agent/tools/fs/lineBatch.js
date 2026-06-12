// B"H
const { readLines } = require("./searchEdit.js");

const CARRIERS = ["params", "content", "body", "query", "goal", "text", "ranges"];

/**
 * B"H
 * Chapter 424: Many Line Windows Learned Every Carrier.
 *
 * Ranges may arrive as native arrays, JSON strings, base64 JSON, object params,
 * or a newline list of paths. Each window is still bounded; the vessel simply
 * stopped rejecting honest messengers who carried the list differently.
 */
async function readManyLines(config, payload = {}) {
  const ranges = normalizeRanges(payload);
  const maxRanges = Math.max(1, Math.min(Number(payload.maxRanges || 20), 60));
  const chosen = ranges.slice(0, maxRanges);
  const results = [];
  if (!chosen.length) return missingRanges();
  for (const range of chosen) {
    try {
      results.push(await readLines(config, { ...payload, path: range.path || range.p, startLine: range.startLine || 1, endLine: range.endLine || 250 }));
    } catch (e) {
      results.push({ ok: false, action: "readLines", path: range.path || range.p, error: e.message });
    }
  }
  return { ok: results.every(x => x.ok !== false), action: "readManyLines", count: results.length, partial: ranges.length > chosen.length, results, acceptedCarriers: CARRIERS };
}

function normalizeRanges(payload = {}) {
  const fused = fusePayload(payload);
  if (Array.isArray(fused.ranges)) return normalizeArray(fused.ranges, fused);
  if (Array.isArray(fused.files)) return normalizeArray(fused.files, fused);
  if (Array.isArray(fused.paths)) return normalizeArray(fused.paths, fused);
  if (typeof fused.ranges === "string") return normalizeArray(parseJson(fused.ranges, splitList(fused.ranges)), fused);
  if (typeof fused.paths === "string") return normalizeArray(splitList(fused.paths), fused);
  if (typeof fused.files === "string") return normalizeArray(splitList(fused.files), fused);
  const p = fused.path || fused.p;
  return p ? [{ path: String(p), startLine: fused.startLine || 1, endLine: fused.endLine || 250 }] : [];
}

function fusePayload(payload = {}) {
  const out = { ...payload };
  Object.assign(out, objectish(parse64(payload.ranges64, {})));
  for (const key of CARRIERS) {
    const parsed = parseJson(out[key], null);
    if (Array.isArray(parsed)) out.ranges = parsed;
    else if (parsed && typeof parsed === "object") Object.assign(out, parsed);
  }
  return out;
}

function normalizeArray(list, payload = {}) {
  const arr = Array.isArray(list) ? list : [];
  return arr.map(item => typeof item === "string" ? { path: item } : item).filter(x => x && (x.path || x.p)).map(x => ({ path: String(x.path || x.p), startLine: Number(x.startLine || payload.startLine || 1), endLine: Number(x.endLine || payload.endLine || 250) }));
}

function parseJson(value, fallback) {
  if (value && typeof value === "object") return value;
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  if (!text || !/^[\[{]/.test(text)) return fallback;
  try { return JSON.parse(text); } catch { return fallback; }
}

function parse64(value, fallback) { if (!value) return fallback; try { return parseJson(Buffer.from(String(value), "base64").toString("utf8"), fallback); } catch { return fallback; } }
function objectish(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
function splitList(value) { return String(value || "").split(/[\r\n,]+/).map(x => x.trim()).filter(Boolean); }
function missingRanges() { return { ok: false, action: "readManyLines", error: "missing_ranges", acceptedCarriers: CARRIERS, expectedShape: { ranges: [{ path: "file.js", startLine: 1, endLine: 80 }] } }; }

module.exports = { readManyLines, normalizeRanges };
