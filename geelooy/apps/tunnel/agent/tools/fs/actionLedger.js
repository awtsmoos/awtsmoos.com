// B"H
const fsp = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { safePath } = require("./pathGuard.js");

const DIR = ".awtsmoos/actions";
const LOG = `${DIR}/history.jsonl`;
const RES = `${DIR}/results`;
const SKIP = new Set(["actionHistoryList", "actionHistoryGet", "actionHistorySearch"]);
const DEFAULT_MAX_ENTRIES = 80;
const DEFAULT_MAX_AGE_MS = 2 * 60 * 60 * 1000;
const DEFAULT_MAX_RESULT_FILES = 160;

function id(prefix = "act") {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
}

function retention(config = {}) {
  const got = config.actionHistoryRetention || config.historyRetention || {};
  const maxEntries = Number(got.maxEntries || process.env.AWTSMOOS_ACTION_HISTORY_MAX_ENTRIES || DEFAULT_MAX_ENTRIES);
  const maxAgeMs = Number(got.maxAgeMs || process.env.AWTSMOOS_ACTION_HISTORY_MAX_AGE_MS || DEFAULT_MAX_AGE_MS);
  const maxResultFiles = Number(got.maxResultFiles || process.env.AWTSMOOS_ACTION_RESULT_MAX_FILES || DEFAULT_MAX_RESULT_FILES);
  return {
    maxEntries: clamp(maxEntries, 10, 1000, DEFAULT_MAX_ENTRIES),
    maxAgeMs: clamp(maxAgeMs, 60_000, 24 * 60 * 60 * 1000, DEFAULT_MAX_AGE_MS),
    maxResultFiles: clamp(maxResultFiles, 20, 5000, DEFAULT_MAX_RESULT_FILES)
  };
}

function clamp(value, min, max, fallback) {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : fallback;
}

async function ensure(config) {
  await fsp.mkdir(safePath(config, DIR), { recursive: true });
  await fsp.mkdir(safePath(config, RES), { recursive: true });
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
    input,
    ok: output?.ok !== false,
    createdAt: new Date().toISOString(),
    ...meta
  };
  await fsp.writeFile(safePath(config, resultRef), JSON.stringify({ entry, output }, null, 2), "utf8");
  await fsp.appendFile(safePath(config, LOG), JSON.stringify(entry) + "\n", "utf8");
  const cleanup = await garbageCollect(config);
  return { ...output, actionId, inputRef: entry.inputRef, outputRef: resultRef, replayable: true, retention: cleanup.summary };
}

async function list(config, limit = 50) {
  try {
    const entries = await readEntries(config);
    return entries.slice(-limit).reverse();
  } catch {
    return [];
  }
}

async function get(config, actionId) {
  const found = (await list(config, retention(config).maxEntries)).find(x => x.actionId === actionId);
  if (!found) return null;
  try {
    return JSON.parse(await fsp.readFile(safePath(config, found.outputRef), "utf8"));
  } catch {
    return { entry: found, output: null };
  }
}

async function garbageCollect(config, overrides = {}) {
  await ensure(config);
  const policy = retention(config);
  for (const key of ["maxEntries", "maxAgeMs", "maxResultFiles"]) {
    const value = Number(overrides[key]);
    if (Number.isFinite(value)) policy[key] = value;
  }
  const now = Date.now();
  const all = await readEntries(config);
  const fresh = all.filter(entry => now - Date.parse(entry.createdAt || 0) <= policy.maxAgeMs);
  const kept = fresh.slice(-policy.maxEntries);
  const keptRefs = new Set(kept.map(entry => entry.outputRef).filter(Boolean));
  const stale = all.filter(entry => entry.outputRef && !keptRefs.has(entry.outputRef));

  let deletedResults = 0;
  for (const entry of stale) deletedResults += await unlinkSafe(config, entry.outputRef);

  const extra = await pruneResultDirectory(config, keptRefs, policy.maxResultFiles);
  deletedResults += extra;
  await fsp.writeFile(safePath(config, LOG), kept.map(entry => JSON.stringify(entry)).join("\n") + (kept.length ? "\n" : ""), "utf8");

  return {
    ok: true,
    action: "actionHistoryGarbageCollect",
    policy,
    beforeEntries: all.length,
    afterEntries: kept.length,
    deletedEntries: Math.max(0, all.length - kept.length),
    deletedResults,
    summary: { keptEntries: kept.length, maxEntries: policy.maxEntries, maxAgeMs: policy.maxAgeMs, deletedResults }
  };
}

async function readEntries(config) {
  try {
    const lines = (await fsp.readFile(safePath(config, LOG), "utf8")).trim().split(/\r?\n/).filter(Boolean);
    return lines.map(line => JSON.parse(line)).filter(entry => entry && entry.actionId);
  } catch {
    return [];
  }
}

async function pruneResultDirectory(config, keptRefs, maxFiles) {
  let deleted = 0;
  let items = [];
  try { items = await fsp.readdir(safePath(config, RES), { withFileTypes: true }); } catch { return 0; }
  const files = [];
  for (const item of items) {
    if (!item.isFile() || !item.name.endsWith(".json")) continue;
    const rel = `${RES}/${item.name}`;
    const full = safePath(config, rel);
    const stat = await fsp.stat(full).catch(() => null);
    files.push({ rel, mtimeMs: stat?.mtimeMs || 0 });
  }
  files.sort((a, b) => b.mtimeMs - a.mtimeMs);
  const protectedRecent = new Set(files.slice(0, maxFiles).map(f => f.rel));
  for (const file of files) {
    if (keptRefs.has(file.rel) || protectedRecent.has(file.rel)) continue;
    deleted += await unlinkSafe(config, file.rel);
  }
  return deleted;
}

async function unlinkSafe(config, rel) {
  try {
    await fsp.unlink(safePath(config, rel));
    return 1;
  } catch {
    return 0;
  }
}

function patch(input, patchObj = {}) { return { ...input, ...patchObj }; }

function replaceAt(input, key, find, replace) {
  const out = JSON.parse(JSON.stringify(input));
  let box = out;
  const parts = String(key || "").split(".").filter(Boolean);
  while (parts.length > 1) box = box[parts.shift()] ??= {};
  const last = parts[0];
  box[last] = String(box[last] ?? "").split(find).join(replace);
  return out;
}

module.exports = { record, list, get, patch, replaceAt, id, garbageCollect, retention };
