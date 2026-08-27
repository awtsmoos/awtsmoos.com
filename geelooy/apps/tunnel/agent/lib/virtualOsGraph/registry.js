// B"H
const Obj = require('./object.js');
const Watchers = require('./watchers.js');
const Traversal = require('./traversal.js');
const Diff = require('./diff.js');
const Tx = require('./transaction.js');

function create() {
  const map = new Map();
  const events = [];
  let seq = 0;
  const graph = {
    get watchStore() { return watchStore; },
    emit, upsert, remove, delete:remove, get, list, search, indexes, references,
    pathLookup, traverse, diff, transaction, history, subscribe, unsubscribe,
    watchers:watcherList, drain, snapshot, rawEntries, rawEvents, restoreRaw
  };
  const watchStore = Watchers.create(events, () => seq);
  return graph;

  function emit(type, data = {}) { const e = { id:`graph:event:${++seq}`, seq, type, data, at:Obj.now() }; events.push(e); watchStore.notify(e); return e; }
  function upsert(input = {}) { const old = map.get(input.id); const next = old ? Obj.mergeObject(old, input) : Obj.object(input); map.set(next.id, next); emit(old ? 'object.updated' : 'object.created', { id:next.id, type:next.type }); return Obj.clone(next); }
  function remove(id) { const old = map.get(id); if (!old) return null; map.delete(id); emit('object.deleted', { id, type:old.type, object:old }); return Obj.clone(old); }
  function get(id) { const obj = map.get(id); return obj ? Obj.clone(obj) : null; }
  function list() { return [...map.values()].map(Obj.clone); }
  function search(q = '') { const text = String(q).toLowerCase(); return list().filter(o => JSON.stringify(o).toLowerCase().includes(text)); }
  function references(id) { const o = map.get(id), idx = indexes(); return { refs:(o?.refs || []).map(get).filter(Boolean), children:(o?.children || []).map(get).filter(Boolean), reverse:(idx.reverseRefs[id] || []).map(get).filter(Boolean) }; }
  function pathLookup(value = '') { const text = String(value); return list().find(o => [o.id, o.url, o.path, o.title].includes(text)) || search(text)[0] || null; }
  function traverse(options = {}) { return Traversal.traverse(graph, options); }
  function diff(input = {}) { return Diff.diff(graph, input); }
  function transaction(operations = []) { return Tx.transaction(graph, operations); }
  function history(filter = {}) { return events.filter(e => (!filter.type || e.type === filter.type) && (!filter.id || e.data?.id === filter.id)).slice(-(filter.limit || 100)); }
  function subscribe(input = {}) { return watchStore.subscribe(input, emit); }
  function unsubscribe(id) { return watchStore.unsubscribe(id, emit); }
  function watcherList() { return watchStore.list(); }
  function drain(id, limit = 100) { return watchStore.drain(id, limit); }
  function snapshot() { return { kind:'virtual-os-graph', at:Obj.now(), objects:list(), indexes:indexes(), watchers:watcherList(), events:history({ limit:100 }) }; }
  function rawEntries() { return new Map(map); }
  function rawEvents() { return [...events]; }
  function restoreRaw(entries, eventBackup) { map.clear(); for (const [k, v] of entries) map.set(k, v); events.splice(0, events.length, ...eventBackup); }
  function indexes() { const byType = {}, byParent = {}, byPath = {}, reverseRefs = {}; for (const o of map.values()) indexOne(o, byType, byParent, byPath, reverseRefs); return { byType, byParent, byPath, reverseRefs }; }
}

function indexOne(o, byType, byParent, byPath, reverseRefs) { (byType[o.type] ||= []).push(o.id); if (o.parentId) (byParent[o.parentId] ||= []).push(o.id); if (o.path) byPath[o.path] = o.id; for (const ref of [...(o.refs || []), ...(o.children || [])]) (reverseRefs[ref] ||= []).push(o.id); }

module.exports = { create };
/** B"H: the server graph registry now conducts focused engines in mirrored order. */
