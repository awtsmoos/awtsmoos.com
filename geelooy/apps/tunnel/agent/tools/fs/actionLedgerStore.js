// B"H
const fsp = require('fs/promises');
const { safePath } = require('./pathGuard.js');
const { withDb } = require('./awdb/open.js');
const C = require('./awdb/collections.js');
const { retention } = require('./actionLedgerPolicy.js');
const DIR = '.awtsmoos/actions', LOG = `${DIR}/history.jsonl`;
function save(config, entry, output) {
  return withDb(config, 'actions', db => { const a = C.ensure(db.root, 'actions'); C.ensure(a, 'byId')[entry.actionId] = { entry, output }; C.ensure(a, 'order')[entry.actionId] = entry.createdAt; return true; });
}
async function list(config, limit = 50) { const rows = awdbList(config); return (rows.length ? rows : await legacyList(config)).slice(-limit).reverse(); }
async function get(config, actionId) { return withFallback(() => withDb(config, 'actions', db => C.plain(C.ensure(C.ensure(db.root, 'actions'), 'byId')[actionId])), null); }
function awdbList(config) {
  return withFallback(() => withDb(config, 'actions', db => C.values(C.ensure(C.ensure(db.root, 'actions'), 'byId')).map(x => x.entry).filter(Boolean).sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))), []);
}
async function legacyList(config) {
  try { return (await fsp.readFile(safePath(config, LOG), 'utf8')).trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line)).filter(x => x && x.actionId); }
  catch { return []; }
}
async function garbageCollect(config, overrides = {}) {
  const policy = retention(config); for (const k of ['maxEntries','maxAgeMs','maxResultFiles']) if (Number.isFinite(Number(overrides[k]))) policy[k] = Number(overrides[k]);
  const now = Date.now(); let before = 0, after = 0;
  withFallback(() => withDb(config, 'actions', db => { const a = C.ensure(db.root, 'actions'), byId = C.ensure(a, 'byId'), order = C.ensure(a, 'order'); const ids = Object.keys(byId); before = ids.length; const keep = ids.filter(id => now - Date.parse(byId[id]?.entry?.createdAt || 0) <= policy.maxAgeMs).sort((x,y)=>String(order[x]).localeCompare(String(order[y]))).slice(-policy.maxEntries); const kept = new Set(keep); ids.forEach(id => { if (!kept.has(id)) { delete byId[id]; delete order[id]; }}); after = keep.length; }), null);
  return { ok: true, action: 'actionHistoryGarbageCollect', policy, beforeEntries: before, afterEntries: after, deletedEntries: Math.max(0, before - after), deletedResults: 0, summary: { keptEntries: after, maxEntries: policy.maxEntries, maxAgeMs: policy.maxAgeMs, deletedResults: 0 } };
}
function withFallback(fn, fallback) { try { return fn(); } catch { return fallback; } }
module.exports = { save, list, get, garbageCollect, legacyList };
