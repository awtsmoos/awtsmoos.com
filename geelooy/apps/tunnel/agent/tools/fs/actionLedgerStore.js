// B"H
const fs = require('fs');
const { withDb, dbFile } = require('./awdb/open.js');
const C = require('./awdb/collections.js');
const { retention } = require('./actionLedgerPolicy.js');

/**
 * B"H
 * Chapter 1932: The gate is seen before the hand touches it.
 *
 * AWDB exclusive locks can block synchronously inside open(). The tunnel must
 * never let a history write freeze the event loop, so we check the lock file
 * first and fail fast into the async retry path.
 */
function actionRoot(db) { return C.ensure(db.root, 'actions'); }
function historyPath(config = {}) { return dbFile(config, 'actions'); }
function lockPath(config = {}) { return `${historyPath(config)}.lock`; }
function assertUnlocked(config = {}) {
  const file = lockPath(config);
  if (!fs.existsSync(file)) return;
  const error = new Error(`ledger_lock_present: ${file}`);
  error.code = 'LEDGER_BUSY';
  throw error;
}
function save(config, entry, output) {
  assertUnlocked(config);
  return withDb(config, 'actions', db => {
    const root = actionRoot(db);
    const row = { entry:C.plain(entry), output:C.plain(output) };
    C.ensure(root, 'byId')[entry.actionId] = row;
    C.ensure(root, 'order')[entry.actionId] = entry.createdAt;
    C.ensure(root, 'timeline', []).push({ actionId:entry.actionId, action:entry.action, ok:entry.ok, createdAt:entry.createdAt });
    root.storage = { backend:'awtsmoosdb', dbFile:historyPath(config), jsonl:false, gitRepoStorage:false };
    return true;
  });
}
async function list(config, limit = 50) { return awdbList(config).slice(-limit).reverse(); }
async function get(config, actionId) { return withFallback(() => withDb(config, 'actions', db => C.plain(actionRoot(db).byId?.[actionId])), null); }
function awdbList(config) {
  if (fs.existsSync(lockPath(config))) return [];
  return withFallback(() => withDb(config, 'actions', db => C.values(C.ensure(actionRoot(db), 'byId')).map(x => x.entry).filter(Boolean).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))), []);
}
async function legacyList(config) { return awdbList(config); }
async function durableList(config) { return awdbList(config); }
async function durableGet(config, actionId) { return get(config, actionId); }
async function garbageCollect(config, overrides = {}) {
  assertUnlocked(config);
  const policy = retention(config);
  for (const k of ['maxEntries', 'maxAgeMs', 'maxResultFiles']) if (Number.isFinite(Number(overrides[k]))) policy[k] = Number(overrides[k]);
  const now = Date.now(); let before = 0, after = 0;
  withFallback(() => withDb(config, 'actions', db => {
    const root = actionRoot(db), byId = C.ensure(root, 'byId'), order = C.ensure(root, 'order');
    const ids = Object.keys(byId); before = ids.length;
    const keep = ids.filter(id => now - Date.parse(byId[id]?.entry?.createdAt || 0) <= policy.maxAgeMs).sort((x, y) => String(order[x]).localeCompare(String(order[y]))).slice(-policy.maxEntries);
    const kept = new Set(keep);
    ids.forEach(id => { if (!kept.has(id)) { delete byId[id]; delete order[id]; } });
    root.timeline = (root.timeline || []).filter(x => kept.has(x.actionId));
    root.storage = { backend:'awtsmoosdb', dbFile:historyPath(config), jsonl:false, gitRepoStorage:false };
    after = keep.length;
  }), null);
  return { ok:true, action:'actionHistoryGarbageCollect', policy, beforeEntries:before, afterEntries:after, deletedEntries:Math.max(0, before - after), deletedResults:0, historyBackend:'awtsmoosdb', awdbPath:historyPath(config), jsonl:false, gitRepoStorage:false, summary:{ keptEntries:after, maxEntries:policy.maxEntries, maxAgeMs:policy.maxAgeMs, deletedResults:0 } };
}
function withFallback(fn, fallback) { try { return fn(); } catch { return fallback; } }
module.exports = { save, list, get, garbageCollect, legacyList, durableList, durableGet, historyPath, lockPath, assertUnlocked, AWDB_HISTORY:'device-specific-awtsmoosdb' };
