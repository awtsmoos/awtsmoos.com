// B"H
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { safePath, assertNotSecret } = require("./pathGuard.js");
const { listDirDetailed } = require("./listing.js");
const { BIN } = require("./constants.js");
const { bulkSearch } = require("./pagedSearch.js");

/**
 * B"H
 * Chapter: Grep stopped pretending a few hundred lines were the whole sea.
 *
 * All search-shaped actions now flow through the paged search river unless the
 * caller explicitly stays tiny. No byte/file ceiling is used as abuse control;
 * perutas and nextRequest pagination carry that burden.
 */
function num(value, fallback) { const n = Number(value); return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback; }
function sha256(buf) { return crypto.createHash("sha256").update(buf).digest("hex"); }
function escapeRegex(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

async function statPath(config, payload = {}) {
  const p = payload.path || payload.p || ".";
  const full = safePath(config, p);
  assertNotSecret(config, full);
  const st = await fsp.stat(full);
  const hash = st.isFile() && st.size <= 10 * 1024 * 1024 ? sha256(await fsp.readFile(full)) : null;
  return { ok: true, action: "stat", path: p, absolutePath: full, isFile: st.isFile(), isDirectory: st.isDirectory(), sizeBytes: st.size, mtimeMs: st.mtimeMs, ctimeMs: st.ctimeMs, sha256: hash };
}

async function readLines(config, payload = {}) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");
  const p = payload.path || payload.p || ".";
  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();
  assertNotSecret(config, full);
  if (BIN.has(ext)) throw new Error("Refusing binary file as text: " + ext);
  const startLine = Math.max(1, num(payload.startLine, 1));
  const endLine = Math.max(startLine, num(payload.endLine || payload.limit, startLine + 250));
  const text = await fsp.readFile(full, "utf8");
  const lines = text.split(/\r?\n/);
  const selected = lines.slice(startLine - 1, endLine);
  return { ok: true, action: "readLines", path: p, absolutePath: full, startLine, endLine: Math.min(endLine, lines.length), totalLines: lines.length, returnedLines: selected.length, content: selected.map((line, i) => String(startLine + i).padStart(5, " ") + " | " + line).join("\n"), truncatedBefore: startLine > 1, truncatedAfter: endLine < lines.length, guidance: endLine < lines.length ? "Continue with startLine=" + (endLine + 1) + "." : null };
}

async function grep(config, payload = {}) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");
  return await bulkSearch(config, { ...payload, action: payload.action || "grep", query: payload.query || payload.find || payload.pattern || "", pageSize: payload.pageSize || payload.limit || payload.maxResults || 100, maxFiles: payload.maxFiles || payload.pageSize || payload.limit || 1000 });
}

async function replaceRange(config, payload = {}) {
  if (!config.tools.fsWrite) throw new Error("fsWrite disabled.");
  if (!config.allowWrite) throw new Error("Writes disabled.");
  const p = payload.path || payload.p || ".";
  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();
  assertNotSecret(config, full);
  if (BIN.has(ext)) throw new Error("Refusing binary file for replaceRange: " + ext);
  const startLine = Math.max(1, num(payload.startLine, 1));
  const endLine = Math.max(startLine, num(payload.endLine, startLine));
  const replacement = String(payload.content || payload.replace || "");
  const before = await fsp.readFile(full, "utf8");
  const lines = before.split(/\r?\n/);
  if (startLine > lines.length + 1) return { ok: false, action: "replaceRange", error: "startLine_out_of_range", totalLines: lines.length };
  const nextLines = [...lines.slice(0, startLine - 1), ...replacement.split(/\r?\n/), ...lines.slice(endLine)];
  const after = nextLines.join("\n");
  await fsp.writeFile(full, after, "utf8");
  return { ok: true, action: "replaceRange", path: p, absolutePath: full, startLine, endLine, beforeLines: lines.length, afterLines: nextLines.length, beforeChars: before.length, afterChars: after.length, changed: before !== after };
}

async function applyPatch(config, payload = {}) {
  if (!config.tools.fsWrite) throw new Error("fsWrite disabled.");
  if (!config.allowWrite) throw new Error("Writes disabled.");
  const fused = fusePayload(payload);
  const p = fused.path || fused.p || ".";
  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();
  assertNotSecret(config, full);
  if (BIN.has(ext)) throw new Error("Refusing binary file for applyPatch: " + ext);
  const edits = normalizeEdits(fused);
  if (!edits.length) return { ok: false, action: "applyPatch", error: "missing_edits", acceptedCarriers: ["edits", "params", "content", "body", "query", "edits64"], expectedShape: { edits: [{ find: "old text", replace: "new text", replaceAll: false }] } };
  let text = await fsp.readFile(full, "utf8");
  const before = text;
  const results = [];
  for (const edit of edits) {
    const find = String(edit.find || "");
    const replace = String(edit.replace || "");
    if (!find) { results.push({ ok: false, error: "missing_find" }); continue; }
    const pattern = edit.regex ? new RegExp(find, edit.replaceAll === false ? "" : "g") : new RegExp(escapeRegex(find), edit.replaceAll === false ? "" : "g");
    const matches = text.match(pattern) || [];
    const beforeEdit = text;
    text = text.replace(pattern, replace);
    results.push({ ok: true, matches: matches.length, changed: beforeEdit !== text });
  }
  if (text !== before) await fsp.writeFile(full, text, "utf8");
  return { ok: true, action: "applyPatch", path: p, absolutePath: full, editCount: edits.length, changed: text !== before, beforeChars: before.length, afterChars: text.length, results };
}

function fusePayload(payload = {}) {
  const out = { ...payload, ...objectish(parse64(payload.edits64, {})) };
  for (const key of ["params", "content", "body", "query", "goal", "text", "edits"]) {
    const parsed = parseJson(out[key], null);
    if (Array.isArray(parsed)) out.edits = parsed;
    else if (parsed && typeof parsed === "object") Object.assign(out, parsed);
  }
  return out;
}
function normalizeEdits(payload = {}) { return Array.isArray(payload.edits) ? payload.edits : []; }
function parseJson(value, fallback) { if (value && typeof value === "object") return value; if (typeof value !== "string") return fallback; const text = value.trim(); if (!text || !/^[\[{]/.test(text)) return fallback; try { return JSON.parse(text); } catch { return fallback; } }
function parse64(value, fallback) { if (!value) return fallback; try { return parseJson(Buffer.from(String(value), "base64").toString("utf8"), fallback); } catch { return fallback; } }
function objectish(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }

module.exports = { statPath, readLines, grep, replaceRange, applyPatch, normalizeEdits };
