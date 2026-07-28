// B"H
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { withDb, dbFile } = require('./awdb/open.js');
const C = require('./awdb/collections.js');
const { retention } = require('./actionLedgerPolicy.js');

/**
 * B"H
 * Chapter 1932: The gate is seen before the hand touches it.
 *
 * The tunnel must never let a history write freeze the event loop, so an
 * active writer lock fails fast into the async retry path. Locks owned by dead
 * processes are reclaimed here before that check. Normally AWDB performs the
 * same reclamation while opening, but this guard intentionally runs first.
 */
function actionRoot(db) { return C.ensure(db.root, 'actions'); }
function historyPath(config = {}) { return dbFile(config, 'actions'); }
function lockPath(config = {}) { return `${historyPath(config)}.lock`; }
function pendingDir(config = {}) { return path.join(path.dirname(historyPath(config)), 'pending'); }
function safeActionId(actionId) { return String(actionId || '').replace(/[^a-zA-Z0-9_.-]/g, '_').slice(0, 240); }
function pendingPath(config, actionId) { return path.join(pendingDir(config), `${safeActionId(actionId)}.json`); }
function lockOwner(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}
function processAlive(pid) {
  const value = Number(pid || 0);
  if (!Number.isSafeInteger(value) || value <= 0) return false;
  try { process.kill(value, 0); return true; }
  catch (error) { return error?.code === 'EPERM'; }
}
function reclaimStaleLock(file) {
  if (!fs.existsSync(file)) return true;
  const owner = lockOwner(file);
  if (owner && processAlive(owner.pid)) return false;
  try { fs.rmSync(file, { force: true }); }
  catch {}
  return !fs.existsSync(file);
}
function assertUnlocked(config = {}) {
  const file = lockPath(config);
  if (reclaimStaleLock(file)) return;
  const error = new Error(`ledger_lock_present: ${file}`);
  error.code = 'LEDGER_BUSY';
  throw error;
}
function applyRow(root, row) {
  const entry = row.entry;
  if (!entry?.actionId) return false;
  const byId = C.ensure(root, 'byId');
  const order = C.ensure(root, 'order');
  const timeline = C.ensure(root, 'timeline', []);
  const existed = Boolean(byId[entry.actionId]);
  byId[entry.actionId] = { entry:C.plain(entry), output:C.plain(row.output) };
  order[entry.actionId] = entry.createdAt;
  if (!existed) timeline.push({
    actionId:entry.actionId,
    action:entry.action,
    ok:entry.ok,
    createdAt:entry.createdAt
  });
  return true;
}
function pendingRows(config, limit = 1000) {
  let names;
  try { names = fs.readdirSync(pendingDir(config)).filter(name => name.endsWith('.json')).sort(); }
  catch { return []; }
  const rows = [];
  for (const name of names.slice(0, Math.max(0, limit))) {
    const file = path.join(pendingDir(config), name);
    try {
      const row = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (row?.entry?.actionId) rows.push({ file, row });
    } catch {}
  }
  return rows;
}
function pendingCount(config) {
  try { return fs.readdirSync(pendingDir(config)).filter(name => name.endsWith('.json')).length; }
  catch { return 0; }
}
function savePending(config, entry, output) {
  const directory = pendingDir(config);
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const destination = pendingPath(config, entry.actionId);
  const temporary = `${destination}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify({
    entry:C.plain(entry),
    output:C.plain(output)
  }), { mode: 0o600 });
  fs.renameSync(temporary, destination);
  const policy = retention(config);
  if (pendingCount(config) > policy.maxEntries) {
    prunePending(config, policy, Date.now(), Math.max(1, policy.maxEntries - 50));
  }
  return true;
}
function save(config, entry, output) {
  assertUnlocked(config);
  return withDb(config, 'actions', db => {
    const root = actionRoot(db);
    applyRow(root, { entry, output });
    pruneRoot(root, retention(config), Date.now());
    root.storage = { backend:'awtsmoosdb', dbFile:historyPath(config), jsonl:false, gitRepoStorage:false };
    return true;
  });
}
async function list(config, limit = 50) { return awdbList(config).slice(-limit).reverse(); }
async function get(config, actionId) {
  try {
    const deferred = JSON.parse(fs.readFileSync(pendingPath(config, actionId), 'utf8'));
    if (deferred?.entry?.actionId === actionId) return C.plain(deferred);
  } catch {}
  return withFallback(
    () => withDb(config, 'actions', db => C.plain(actionRoot(db).byId?.[actionId]), {
      readOnly:true,
      processLockMode:'shared'
    }),
    null
  );
}
function awdbList(config) {
  const stored = withFallback(
    () => withDb(config, 'actions', db => C.values(C.ensure(actionRoot(db), 'byId')).map(x => x.entry).filter(Boolean), {
      readOnly:true,
      processLockMode:'shared'
    }),
    []
  );
  const merged = new Map(stored.map(entry => [entry.actionId, entry]));
  for (const item of pendingRows(config)) merged.set(item.row.entry.actionId, item.row.entry);
  return [...merged.values()].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
}
async function legacyList(config) { return awdbList(config); }
async function durableList(config) { return awdbList(config); }
async function durableGet(config, actionId) { return get(config, actionId); }
async function garbageCollect(config, overrides = {}) {
  assertUnlocked(config);
  const policy = retention(config);
  for (const k of ['maxEntries', 'maxAgeMs', 'maxResultFiles']) if (Number.isFinite(Number(overrides[k]))) policy[k] = Number(overrides[k]);
  const now = Date.now(); let before = 0, after = 0;
  const pendingBefore = pendingRows(config).length;
  withFallback(() => withDb(config, 'actions', db => {
    const root = actionRoot(db);
    before = Object.keys(C.ensure(root, 'byId')).length;
    after = pruneRoot(root, policy, now);
    root.storage = { backend:'awtsmoosdb', dbFile:historyPath(config), jsonl:false, gitRepoStorage:false };
  }), null);
  const pendingAfter = prunePending(config, policy, now);
  return { ok:true, action:'actionHistoryGarbageCollect', policy, beforeEntries:before + pendingBefore, afterEntries:after + pendingAfter, deletedEntries:Math.max(0, before - after) + Math.max(0, pendingBefore - pendingAfter), deletedResults:0, historyBackend:'awtsmoosdb+durable-receipts', awdbPath:historyPath(config), jsonl:false, gitRepoStorage:false, summary:{ keptEntries:after + pendingAfter, maxEntries:policy.maxEntries, maxAgeMs:policy.maxAgeMs, deletedResults:0 } };
}
function pruneRoot(root, policy, now = Date.now()) {
  const byId = C.ensure(root, 'byId');
  const order = C.ensure(root, 'order');
  const ids = Object.keys(byId);
  const keep = ids
    .filter(id => now - Date.parse(byId[id]?.entry?.createdAt || 0) <= policy.maxAgeMs)
    .sort((left, right) => String(order[left]).localeCompare(String(order[right])))
    .slice(-policy.maxEntries);
  if (keep.length === ids.length) return keep.length;
  const kept = new Set(keep);
  ids.forEach(id => {
    if (!kept.has(id)) {
      delete byId[id];
      delete order[id];
    }
  });
  root.timeline = (root.timeline || []).filter(row => kept.has(row.actionId));
  return keep.length;
}
function prunePending(config, policy, now = Date.now(), targetEntries = policy.maxEntries) {
  const items = pendingRows(config);
  const keep = items
    .filter(item => now - Date.parse(item.row.entry.createdAt || 0) <= policy.maxAgeMs)
    .sort((left, right) => String(left.row.entry.createdAt).localeCompare(String(right.row.entry.createdAt)))
    .slice(-Math.max(1, Math.min(policy.maxEntries, Number(targetEntries) || policy.maxEntries)));
  if (keep.length === items.length) return keep.length;
  const kept = new Set(keep.map(item => item.file));
  for (const item of items) {
    if (kept.has(item.file)) continue;
    try { fs.rmSync(item.file, { force:true }); } catch {}
  }
  return keep.length;
}
function withFallback(fn, fallback) { try { return fn(); } catch { return fallback; } }
module.exports = { save, savePending, pendingRows, pendingCount, pendingPath, list, get, garbageCollect, legacyList, durableList, durableGet, historyPath, lockPath, assertUnlocked, reclaimStaleLock, processAlive, pruneRoot, prunePending, AWDB_HISTORY:'device-specific-awtsmoosdb+durable-receipts' };
