// B"H
const path = require("path");
const { readText, readBytesBase64, readTextFromBytes } = require("./readWrite.js");
const { parsePlainList, firstPayloadValue } = require("./plainPayload.js");
const { parseLimit, pageState, describePage, nextPagePayload } = require("./bulkPage.js");

/**
 * B"H
 * Chapter 357: Bulk Read Learned To Breathe In Pages.
 * Paths may arrive through plain GET letters, JSON arrays, or object specs.
 * If `p` names a base directory and `paths` names children, the children now
 * walk beneath that base. The Awtsmoos reveals one generous page at a time.
 */
function normalizeSpec(one) {
  if (typeof one === "string") return { path: one, mode: "text" };
  if (one && typeof one === "object") {
    return { path: String(one.path || one.p || ""), mode: one.mode || one.readMode || "text", maxChars: one.maxChars, offsetChars: one.offsetChars, maxBytes: one.maxBytes, offsetBytes: one.offsetBytes, all: one.all, noLimit: one.noLimit, unlimited: one.unlimited };
  }
  return { path: "", mode: "text" };
}

function qualifySpec(spec, payload = {}) {
  const base = payload.basePath || payload.base || payload.dir || (payload.paths || payload.files ? payload.p || payload.path : "");
  const next = { ...spec };
  if (base && next.path && !path.isAbsolute(next.path) && !next.path.startsWith(String(base))) {
    next.path = path.posix.normalize(path.posix.join(String(base).replace(/\\/g, "/"), next.path));
  }
  return next;
}

function uniqueSpecs(paths, payload = {}) {
  const out = [], seen = new Set();
  for (const item of paths || []) {
    const spec = qualifySpec(normalizeSpec(item), payload), p = String(spec.path || "").trim();
    if (!p) continue;
    const key = [p, spec.mode, spec.offsetChars || 0, spec.offsetBytes || 0].join("::");
    if (!seen.has(key)) { seen.add(key); spec.path = p; out.push(spec); }
  }
  return out;
}

function fileSizeMeta(got) {
  return { encoding: got.encoding || "utf8", returnedChars: got.returnedChars || null, totalChars: got.totalChars || null, offsetChars: got.offsetChars || null, nextOffsetChars: got.nextOffsetChars || null, returnedBytes: got.returnedBytes || null, totalBytes: got.totalBytes || null, offsetBytes: got.offsetBytes || null, nextOffsetBytes: got.nextOffsetBytes || null, truncated: !!got.truncated };
}

async function readOne(config, spec, payload) {
  const mode = String(spec.mode || "text");
  const all = spec.all || spec.noLimit || spec.unlimited || payload.all || payload.noLimit || payload.unlimited;
  const maxChars = all ? Infinity : parseLimit(spec.maxChars ?? payload.maxChars, 12000);
  const maxBytes = all ? Infinity : parseLimit(spec.maxBytes ?? payload.maxBytes, 24000);
  if (mode === "base64" || mode === "read64") return await readBytesBase64(config, spec.path, maxBytes, spec.offsetBytes ?? payload.offsetBytes ?? 0);
  if (mode === "bytes" || mode === "text-bytes" || mode === "readBytes") return await readTextFromBytes(config, spec.path, maxBytes, spec.offsetBytes ?? payload.offsetBytes ?? 0);
  return await readText(config, spec.path, maxChars, spec.offsetChars ?? payload.offsetChars ?? 0);
}

function rawSpecs(payload) {
  return parsePlainList(firstPayloadValue(payload, ["paths", "files", "path", "p"]) || []);
}

async function readBulk(config, payload) {
  if (!config.tools.fsBulk) throw new Error("fsBulk disabled.");
  const requested = uniqueSpecs(rawSpecs(payload), payload);
  const state = pageState(payload, requested.length);
  const selected = requested.slice(state.cursor, state.end);
  const files = {}, metadata = {}, order = [];
  let usedChars = 0, okCount = 0, errorCount = 0;
  for (const spec of selected) {
    order.push(spec.path);
    try {
      const got = await readOne(config, spec, payload);
      const size = got.returnedBytes || got.returnedChars || String(got.content || got.content64 || "").length;
      usedChars += size; okCount++;
      files[spec.path] = { ok: true, path: spec.path, mode: spec.mode || "text", content: got.content, content64: got.content64, truncated: got.truncated, encoding: got.encoding, offsetChars: got.offsetChars, nextOffsetChars: got.nextOffsetChars, offsetBytes: got.offsetBytes, nextOffsetBytes: got.nextOffsetBytes };
      metadata[spec.path] = fileSizeMeta(got);
    } catch (e) { errorCount++; files[spec.path] = { ok: false, path: spec.path, error: e.message }; metadata[spec.path] = { ok: false, error: e.message }; }
  }
  return bulkResult(config, payload, requested, state, files, metadata, order, usedChars, okCount, errorCount);
}

function bulkResult(config, payload, requested, state, files, metadata, order, usedChars, okCount, errorCount) {
  const limits = { maxFiles: state.pageSize, maxChars: parseLimit(payload.maxChars, 12000), maxBytes: parseLimit(payload.maxBytes, 24000), totalMaxBytes: parseLimit(payload.totalMaxBytes ?? payload.totalMaxChars, Infinity), maxDepth: payload.maxDepth || payload.depth || 0 };
  return { ok: errorCount === 0, action: "bulk", root: config.root, requestedCount: requested.length, returnedCount: order.length, okCount, errorCount, skippedCount: Math.max(0, requested.length - state.end), usedChars, page: state.page, cursor: state.cursor, nextCursor: state.nextCursor, pageSize: state.pageSize, maxFiles: state.pageSize, partial: state.hasNext, stoppedBecause: state.hasNext ? "page_has_more_files" : null, message: describePage("bulk read", state, limits), nextPagePayload: nextPagePayload(payload, "bulk", state), order, metadata, files };
}

module.exports = { readBulk, uniqueSpecs, normalizeSpec, qualifySpec, parseLimit };
