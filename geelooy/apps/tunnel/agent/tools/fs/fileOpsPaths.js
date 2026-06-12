// B"H
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { safePath, assertNotSecret } = require("./pathGuard.js");

const CARRIERS = ["params", "content", "body", "query", "goal", "paths", "files"];

/**
 * B"H
 * Chapter 426: File Ops Accepted The Many-Path Scroll.
 *
 * mkdirp, ensureFile, and touch now receive paths through arrays, JSON strings,
 * base64 JSON, newline lists, or plain p/path. The root guard remains the king.
 */
async function mkdirp(config, payload = {}) {
  if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");
  const paths = normalizePaths(payload);
  const results = {};
  for (const p of paths) {
    const full = safePath(config, p);
    assertNotSecret(config, full);
    const existed = fs.existsSync(full);
    await fsp.mkdir(full, { recursive: true });
    results[p] = { ok: true, path: p, absolutePath: full, existed, created: !existed };
  }
  return { ok: true, action: "mkdirp", count: paths.length, results, acceptedCarriers: CARRIERS };
}

async function ensureFile(config, payload = {}) {
  if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");
  const p = payload.path || payload.p;
  if (!p) return { ok: false, action: "ensureFile", error: "missing_path" };
  const full = safePath(config, p);
  assertNotSecret(config, full);
  const existed = fs.existsSync(full);
  if (!existed) { await fsp.mkdir(path.dirname(full), { recursive: true }); await fsp.writeFile(full, String(payload.content || ""), "utf8"); }
  const st = await fsp.stat(full);
  return { ok: true, action: "ensureFile", path: p, absolutePath: full, existed, created: !existed, bytes: st.size };
}

async function touch(config, payload = {}) {
  if (!config.allowWrite || !config.tools.fsWrite) throw new Error("Writes disabled.");
  const paths = normalizePaths(payload);
  if (!paths.length) return { ok: false, action: "touch", error: "missing_path" };
  const results = {};
  for (const p of paths) {
    const full = safePath(config, p);
    assertNotSecret(config, full);
    const existed = fs.existsSync(full);
    if (!existed) { await fsp.mkdir(path.dirname(full), { recursive: true }); await fsp.writeFile(full, "", "utf8"); }
    const now = new Date();
    await fsp.utimes(full, now, now);
    results[p] = { ok: true, action: "touch", path: p, absolutePath: full, existed, created: !existed };
  }
  return { ok: true, action: "touch", count: paths.length, results, acceptedCarriers: CARRIERS };
}

function normalizePaths(payload = {}) {
  const fused = fusePayload(payload);
  const raw = firstDefined(fused.paths, fused.files, fused.path, fused.p);
  if (Array.isArray(raw)) return raw.map(pathFrom).filter(Boolean);
  if (raw && typeof raw === "object") return Object.keys(raw).filter(Boolean);
  return splitList(raw);
}

function fusePayload(payload = {}) {
  const out = { ...payload, ...objectish(parse64(payload.paths64 || payload.files64, {})) };
  for (const key of CARRIERS) {
    const parsed = parseJson(out[key], null);
    if (Array.isArray(parsed)) out.paths = parsed;
    else if (parsed && typeof parsed === "object") Object.assign(out, parsed);
  }
  return out;
}

function pathFrom(item) { return typeof item === "string" ? item : item && (item.path || item.p); }
function firstDefined(...values) { return values.find(value => value !== undefined && value !== null && value !== ""); }
function splitList(value) { return String(value || "").split(/[\r\n,]+/).map(x => x.trim()).filter(Boolean); }
function parseJson(value, fallback) { if (value && typeof value === "object") return value; if (typeof value !== "string") return fallback; const text = value.trim(); if (!text || !/^[\[{]/.test(text)) return fallback; try { return JSON.parse(text); } catch { return fallback; } }
function parse64(value, fallback) { if (!value) return fallback; try { return parseJson(Buffer.from(String(value), "base64").toString("utf8"), fallback); } catch { return fallback; } }
function objectish(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }

module.exports = { mkdirp, ensureFile, touch, normalizePaths };
