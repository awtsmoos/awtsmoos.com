// B"H
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { safePath } = require("./pathGuard.js");
const { ensureGitignoreHygiene } = require("./gitIgnoreHygiene.js");

const DIR = ".awtsmoos/actions";
const LOG = `${DIR}/history.jsonl`;
const RES = `${DIR}/results`;
const SKIP = new Set(["actionHistoryList", "actionHistoryGet", "actionHistorySearch"]);
const SECRET_KEYS = /^(apiKey|authorization|token|secret|providerKeys|key)$/i;
const DEFAULT_MAX_ENTRIES = 80;
const DEFAULT_MAX_AGE_MS = 2 * 60 * 60 * 1000;
const DEFAULT_MAX_RESULT_FILES = 160;

/**
 * B"H
 * Chapter 366: The ledger wrote memory, then cleaned the git doorway.
 */
function id(prefix = "act") {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
}

function retention(config = {}) {
  const got = config.actionHistoryRetention || config.historyRetention || {};
  return {
    maxEntries: clamp(Number(got.maxEntries || process.env.AWTSMOOS_ACTION_HISTORY_MAX_ENTRIES || DEFAULT_MAX_ENTRIES), 10, 1000, DEFAULT_MAX_ENTRIES),
    maxAgeMs: clamp(Number(got.maxAgeMs || process.env.AWTSMOOS_ACTION_HISTORY_MAX_AGE_MS || DEFAULT_MAX_AGE_MS), 60_000, 24 * 60 * 60 * 1000, DEFAULT_MAX_AGE_MS),
    maxResultFiles: clamp(Number(got.maxResultFiles || process.env.AWTSMOOS_ACTION_RESULT_MAX_FILES || DEFAULT_MAX_RESULT_FILES), 20, 5000, DEFAULT_MAX_RESULT_FILES)
  };
}

function clamp(value, min, max, fallback) {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : fallback;
}

async function ensure(config) {
  await fsp.mkdir(safePath(config, DIR), { recursive: true });
  await fsp.mkdir(safePath(config, RES), { recursive: true });
  await ensureGitignoreHygiene(config, "action-ledger");
}

async function record(config, input, output, meta = {}) {
  if (SKIP.has(input.action)) return output;
  await ensure(config);
  const actionId = output.actionId || id("act");
  const resultRef = `${RES}/${actionId}.json`;
  const entry = {
    actionId,
    inputRef: `cmd_${actionId}`,
    outputRef: resultRef,
    parentActionId: input.parentActionId || null,
    action: input.action,
    input: redact(input),
    ok: output?.ok !== false,
    createdAt: new Date().toISOString(),
    ...meta
  };
  await fsp.writeFile(safePath(config, resultRef), JSON.stringify({ entry, output: redact(output) }, null, 2), "utf8");
  await fsp.appendFile(safePath(config, LOG), JSON.stringify(entry) + "\n", "utf8");
  const cleanup = await garbageCollect(config);
  return { ...output, actionId, inputRef: entry.inputRef, outputRef: resultRef, replayable: true, retention: cleanup.summary };
}

function redact(value, key = "", seen = new WeakSet()) {
  if (SECRET_KEYS.test(key)) return "[REDACTED]";
  if (typeof value === "string") return looksSecret(value) ? mask(value) : value;
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return "[Circular]";
  seen.add(value);
  if (Array.isArray(value)) return value.map(item => redact(item, key, seen));
  const action = value.action || "";
  return Object.fromEntries(Object.entries(value).map(([k, v]) => {
    const carrier = ["content", "text", "body", "query", "goal", "params"].includes(k);
    return [k, action === "aiAgentSetProviderKey" && carrier ? "[REDACTED]" : redact(v, k, seen)];
  }));
}

function looksSecret(text) {
  return /sk-[A-Za-z0-9_-]{16,}|Bearer\s+[A-Za-z0-9._-]{16,}/.test(String(text || ""));
}

function mask(text) {
  const value = String(text || "");
  return value.length <= 12 ? "[REDACTED]" : value.slice(0, 4) + "...[REDACTED]..." + value.slice(-4);
}

async function list(config, limit = 50) {
  try { const entries = await readEntries(config); return entries.slice(-limit).reverse(); }
  catch { return []; }
}

async function get(config, actionId) {
  const found = (await list(config, retention(config).maxEntries)).find(x => x.actionId === actionId);
  if (!found) return null;
  try { return JSON.parse(await fsp.readFile(safePath(config, found.outputRef), "utf8")); }
  catch { return { entry: found, output: null }; }
}

async function garbageCollect(config, overrides = {}) {
  await ensure(config);
  const policy = retention(config);
  for (const key of ["maxEntries", "maxAgeMs", "maxResultFiles"]) if (Number.isFinite(Number(overrides[key]))) policy[key] = Number(overrides[key]);
  const now = Date.now();
  const all = (await readEntries(config)).map(entry => redact(entry));
  const fresh = all.filter(entry => now - Date.parse(entry.createdAt || 0) <= policy.maxAgeMs);
  const kept = fresh.slice(-policy.maxEntries);
  const keptRefs = new Set(kept.map(entry => entry.outputRef).filter(Boolean));
  let deletedResults = 0;
  for (const entry of all) if (entry.outputRef && !keptRefs.has(entry.outputRef)) deletedResults += await unlinkSafe(config, entry.outputRef);
  deletedResults += await pruneResultDirectory(config, keptRefs, policy.maxResultFiles);
  await fsp.writeFile(safePath(config, LOG), kept.map(entry => JSON.stringify(entry)).join("\n") + (kept.length ? "\n" : ""), "utf8");
  return { ok: true, action: "actionHistoryGarbageCollect", policy, beforeEntries: all.length, afterEntries: kept.length, deletedEntries: Math.max(0, all.length - kept.length), deletedResults, summary: { keptEntries: kept.length, maxEntries: policy.maxEntries, maxAgeMs: policy.maxAgeMs, deletedResults } };
}

async function readEntries(config) {
  try { return (await fsp.readFile(safePath(config, LOG), "utf8")).trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)).filter(entry => entry && entry.actionId); }
  catch { return []; }
}

async function pruneResultDirectory(config, keptRefs, maxFiles) {
  let items = [], deleted = 0;
  try { items = await fsp.readdir(safePath(config, RES), { withFileTypes: true }); } catch { return 0; }
  const files = [];
  for (const item of items) {
    if (!item.isFile() || !item.name.endsWith(".json")) continue;
    const rel = `${RES}/${item.name}`;
    const stat = await fsp.stat(safePath(config, rel)).catch(() => null);
    files.push({ rel, mtimeMs: stat?.mtimeMs || 0 });
  }
  files.sort((a, b) => b.mtimeMs - a.mtimeMs);
  const protectedRecent = new Set(files.slice(0, maxFiles).map(f => f.rel));
  for (const file of files) if (!keptRefs.has(file.rel) && !protectedRecent.has(file.rel)) deleted += await unlinkSafe(config, file.rel);
  return deleted;
}

async function unlinkSafe(config, rel) {
  try { await fsp.unlink(safePath(config, rel)); return 1; } catch { return 0; }
}

function patch(input, patchObj = {}) { return { ...input, ...patchObj }; }
function replaceAt(input, key, find, replace) { const out = JSON.parse(JSON.stringify(input)); let box = out; const parts = String(key || "").split(".").filter(Boolean); while (parts.length > 1) box = box[parts.shift()] ??= {}; box[parts[0]] = String(box[parts[0]] ?? "").split(find).join(replace); return out; }

module.exports = { record, list, get, patch, replaceAt, id, garbageCollect, retention, redact, ensure };
