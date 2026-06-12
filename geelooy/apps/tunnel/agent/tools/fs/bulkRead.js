// B"H
const fs = require("fs");
const path = require("path");
const { readText, readBytesBase64, readTextFromBytes } = require("./readWrite.js");
const { parsePlainList, firstPayloadValue } = require("./plainPayload.js");
const { parseLimit, pageState, describePage, nextPagePayload } = require("./bulkPage.js");
const { safePath, rel } = require("./pathGuard.js");
const { BIN, SKIP, SECRET_FILES } = require("./constants.js");

/** B"H: bulk read is now a directory river with honest remaining-budget breath. */
function normalizeSpec(one) {
  if (typeof one === "string") return { path: one, mode: "text" };
  if (one && typeof one === "object") return { path: String(one.path || one.p || ""), mode: one.mode || one.readMode || "text", maxChars: one.maxChars, offsetChars: one.offsetChars, maxBytes: one.maxBytes, offsetBytes: one.offsetBytes, all: one.all, noLimit: one.noLimit, unlimited: one.unlimited };
  return { path: "", mode: "text" };
}

function qualifySpec(spec, payload = {}) {
  const base = payload.basePath || payload.base || payload.dir || (payload.paths || payload.files ? payload.p || payload.path : "");
  const next = { ...spec };
  if (base && next.path && !path.isAbsolute(next.path) && !next.path.startsWith(String(base))) next.path = path.posix.normalize(path.posix.join(slash(base), slash(next.path)));
  return next;
}

function rawSpecs(payload) {
  const raw = parsePlainList(firstPayloadValue(payload, ["paths", "files", "path", "p"]) || []);
  return raw.length ? raw : [payload.path || payload.p || "."];
}

function uniqueSpecs(paths, payload = {}) {
  const out = [], seen = new Set();
  for (const item of paths || []) {
    for (const spec of expandSpec(qualifySpec(normalizeSpec(item), payload), payload)) {
      const p = String(spec.path || "").trim();
      if (!p) continue;
      const key = [p, spec.mode, spec.offsetChars || 0, spec.offsetBytes || 0].join("::");
      if (!seen.has(key)) { seen.add(key); out.push({ ...spec, path: p }); }
    }
  }
  return out;
}

function expandSpec(spec, payload = {}) {
  if (!spec.path) return [];
  const cfg = { root: payload.__root || payload.root || process.cwd(), allowSecrets: true };
  try {
    const full = safePath(cfg, spec.path);
    const st = fs.statSync(full);
    if (st.isDirectory()) return walkDir(full, payload).map(file => ({ ...spec, path: rel(cfg, file) }));
  } catch (_error) {}
  return [spec];
}

function walkDir(dir, payload = {}, out = []) {
  const maxDepth = Number(payload.maxDepth ?? payload.depth ?? 4);
  const root = payload.__walkRoot || dir;
  const depth = path.relative(root, dir).split(path.sep).filter(Boolean).length;
  if (Number.isFinite(maxDepth) && depth > maxDepth) return out;
  for (const ent of safeReadDir(dir)) {
    if (skipName(ent.name, payload)) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkDir(full, { ...payload, __walkRoot: root }, out);
    else if (ent.isFile() && readableFile(full)) out.push(full);
  }
  return out.sort((a, b) => slash(a).localeCompare(slash(b)));
}

function safeReadDir(dir) { try { return fs.readdirSync(dir, { withFileTypes: true }); } catch (_error) { return []; } }
function skipName(name, payload = {}) { return SKIP.has(name) || (!truthy(payload.allowSecrets) && SECRET_FILES.has(name)); }
function readableFile(full) { return !BIN.has(path.extname(full).toLowerCase()); }
function slash(value) { return String(value || "").replace(/\\/g, "/"); }
function truthy(value) { return value === true || value === "true" || value === 1 || value === "1"; }

function fileSizeMeta(got) {
  return { encoding: got.encoding || "utf8", returnedChars: got.returnedChars || null, totalChars: got.totalChars || null, offsetChars: got.offsetChars || null, nextOffsetChars: got.nextOffsetChars || null, returnedBytes: got.returnedBytes || null, totalBytes: got.totalBytes || null, offsetBytes: got.offsetBytes || null, nextOffsetBytes: got.nextOffsetBytes || null, truncated: !!got.truncated };
}

async function readOne(config, spec, payload, remaining = Infinity) {
  const mode = String(spec.mode || "text");
  const all = spec.all || spec.noLimit || spec.unlimited || payload.all || payload.noLimit || payload.unlimited;
  const charCap = all ? Infinity : parseLimit(spec.maxChars ?? payload.maxChars, 12000);
  const byteCap = all ? Infinity : parseLimit(spec.maxBytes ?? payload.maxBytes, 24000);
  const maxChars = Math.max(0, Math.min(charCap, remaining));
  const maxBytes = Math.max(0, Math.min(byteCap, remaining));
  if (mode === "base64" || mode === "read64") return await readBytesBase64(config, spec.path, maxBytes, spec.offsetBytes ?? payload.offsetBytes ?? 0);
  if (mode === "bytes" || mode === "text-bytes" || mode === "readBytes") return await readTextFromBytes(config, spec.path, maxBytes, spec.offsetBytes ?? payload.offsetBytes ?? 0);
  return await readText(config, spec.path, maxChars, spec.offsetChars ?? payload.offsetChars ?? 0);
}

async function readBulk(config, payload) {
  if (!config.tools.fsBulk) throw new Error("fsBulk disabled.");
  const requested = uniqueSpecs(rawSpecs(payload), { ...payload, __root: config.root, root: config.root });
  const state = pageState(payload, requested.length);
  const budget = parseLimit(payload.totalMaxBytes ?? payload.totalMaxChars, Infinity);
  const files = {}, metadata = {}, order = [];
  let usedChars = 0, okCount = 0, errorCount = 0, index = state.cursor;
  while (index < requested.length && order.length < state.pageSize && usedChars < budget) {
    const spec = requested[index++];
    const remaining = budget === Infinity ? Infinity : Math.max(0, budget - usedChars);
    if (remaining <= 0) { index--; break; }
    order.push(spec.path);
    try {
      const got = await readOne(config, spec, payload, remaining);
      const size = got.returnedBytes || got.returnedChars || String(got.content || got.content64 || "").length;
      usedChars += size; okCount++;
      files[spec.path] = { ok: true, path: spec.path, mode: spec.mode || "text", content: got.content, content64: got.content64, truncated: got.truncated, encoding: got.encoding, offsetChars: got.offsetChars, nextOffsetChars: got.nextOffsetChars, offsetBytes: got.offsetBytes, nextOffsetBytes: got.nextOffsetBytes };
      metadata[spec.path] = fileSizeMeta(got);
    } catch (e) { errorCount++; files[spec.path] = { ok: false, path: spec.path, error: e.message }; metadata[spec.path] = { ok: false, error: e.message }; }
  }
  const nextCursor = index < requested.length ? index : null;
  return bulkResult(config, payload, requested, state, nextCursor, files, metadata, order, usedChars, okCount, errorCount, budget);
}

function bulkResult(config, payload, requested, state, nextCursor, files, metadata, order, usedChars, okCount, errorCount, budget) {
  const hasNext = nextCursor !== null;
  const liveState = { ...state, end: nextCursor ?? requested.length, hasNext, nextCursor };
  const limits = { maxFiles: state.pageSize, maxChars: parseLimit(payload.maxChars, 12000), maxBytes: parseLimit(payload.maxBytes, 24000), totalMaxBytes: budget, maxDepth: payload.maxDepth || payload.depth || 4 };
  return { ok: errorCount === 0, action: "bulk", root: config.root, requestedCount: requested.length, returnedCount: order.length, okCount, errorCount, skippedCount: Math.max(0, requested.length - liveState.end), usedChars, page: state.page, cursor: state.cursor, nextCursor, pageSize: state.pageSize, maxFiles: state.pageSize, partial: hasNext, stoppedBecause: hasNext ? "page_or_budget_has_more_files" : null, message: describePage("bulk read", liveState, limits), nextPagePayload: nextPagePayload(payload, "bulk", liveState), order, metadata, files };
}

module.exports = { readBulk, uniqueSpecs, normalizeSpec, qualifySpec, parseLimit, walkDir };
