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
 * Chapter 425: Search And Patch Accepted The Loose Scroll.
 *
 * Grep can page before drowning, deadlines can stop the walk, and patch edits
 * may arrive inside params/content/body/query/edits/edits64. Still, the action
 * remains a whole-file rewrite beneath the hood, never a blind partial patch.
 */
function clamp(n, fallback, min, max) { n = Number(n); if (!Number.isFinite(n)) return fallback; return Math.max(min, Math.min(max, Math.floor(n))); }
function sha256(buf) { return crypto.createHash("sha256").update(buf).digest("hex"); }
function escapeRegex(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function deadline(payload = {}) { const ms = Number(payload.deadlineMs || payload.maxDurationMs || payload.searchTimeoutMs || 0); return ms > 0 ? Date.now() + ms : Infinity; }
function expired(until) { return Date.now() > until; }

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
  const startLine = clamp(payload.startLine, 1, 1, 10000000);
  const endLine = clamp(payload.endLine, startLine + 200, startLine, startLine + 1000);
  const text = await fsp.readFile(full, "utf8");
  const lines = text.split(/\r?\n/);
  const selected = lines.slice(startLine - 1, endLine);
  return { ok: true, action: "readLines", path: p, absolutePath: full, startLine, endLine: Math.min(endLine, lines.length), totalLines: lines.length, returnedLines: selected.length, content: selected.map((line, i) => String(startLine + i).padStart(5, " ") + " | " + line).join("\n"), truncatedBefore: startLine > 1, truncatedAfter: endLine < lines.length, guidance: endLine < lines.length ? "Continue with startLine=" + (endLine + 1) + " and endLine=" + Math.min(endLine + 250, lines.length) + "." : null };
}

async function grep(config, payload = {}) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");
  const rootPath = payload.path || payload.p || ".";
  const query = String(payload.query || payload.find || "");
  if (!query) return { ok: false, action: "grep", error: "missing_query" };
  if (payload.usePaged === true || payload.paginate || payload.cursor || payload.fileCursor || Number(payload.page) > 1 || /bulkSearch|bulkSearchPage|semanticSearch/.test(String(payload.action || ''))) return await bulkSearch(config, { ...payload, action: payload.action || "grep" });
  const isRegex = !!payload.regex;
  const maxFiles = clamp(payload.maxFiles, 100, 1, 800);
  const maxResults = clamp(payload.maxResults, 80, 1, 300);
  const maxFileBytes = clamp(payload.maxFileBytes, 800000, 1000, 2000000);
  const until = deadline(payload);
  const rootFull = safePath(config, rootPath);
  const matcher = isRegex ? new RegExp(query, "i") : new RegExp(escapeRegex(query), "i");
  const results = [];
  let scannedFiles = 0, skippedFiles = 0, timedOut = false;
  async function walk(rel) {
    if (scannedFiles >= maxFiles || results.length >= maxResults || expired(until)) { timedOut ||= expired(until); return; }
    let items = [];
    try { items = await listDirDetailed(config, rel || "."); } catch (_) { return; }
    for (const item of items) {
      if (scannedFiles >= maxFiles || results.length >= maxResults || expired(until)) { timedOut ||= expired(until); return; }
      const childRel = rel && rel !== "." ? rel.replace(/[\\/]+$/, "") + "/" + item.name : item.name;
      if (item.isDirectory) { if (!["node_modules", ".git", ".next", "dist", "build", ".cache"].includes(item.name)) await walk(childRel); continue; }
      const ext = path.extname(item.name).toLowerCase();
      if (BIN.has(ext)) continue;
      const full = safePath(config, childRel);
      assertNotSecret(config, full);
      const st = await fsp.stat(full);
      if (st.size > maxFileBytes) { skippedFiles++; continue; }
      scannedFiles++;
      const lines = (await fsp.readFile(full, "utf8")).split(/\r?\n/);
      for (let i = 0; i < lines.length && results.length < maxResults; i++) {
        if (expired(until)) { timedOut = true; return; }
        if (matcher.test(lines[i])) results.push({ path: childRel, line: i + 1, preview: lines[i].slice(0, 500) });
        matcher.lastIndex = 0;
      }
    }
  }
  await walk(rootPath === "." ? "." : rootPath);
  return { ok: true, action: payload.action || "grep", root: config.root, path: rootPath, absolutePath: rootFull, query, regex: isRegex, scannedFiles, skippedFiles, maxFiles, maxResults, returnedResults: results.length, timedOut, partial: timedOut || scannedFiles >= maxFiles || results.length >= maxResults, guidance: "If partial=true, use usePaged=true/cursor or narrow path/query/raise limits.", results };
}

async function replaceRange(config, payload = {}) {
  if (!config.tools.fsWrite) throw new Error("fsWrite disabled.");
  if (!config.allowWrite) throw new Error("Writes disabled.");
  const p = payload.path || payload.p || ".";
  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();
  assertNotSecret(config, full);
  if (BIN.has(ext)) throw new Error("Refusing binary file for replaceRange: " + ext);
  const startLine = clamp(payload.startLine, 1, 1, 10000000);
  const endLine = clamp(payload.endLine, startLine, startLine, 10000000);
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
    const beforeEdit = text;
    const pattern = edit.regex ? new RegExp(find, edit.replaceAll === false ? "" : "g") : new RegExp(escapeRegex(find), edit.replaceAll === false ? "" : "g");
    const matches = text.match(pattern) || [];
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
