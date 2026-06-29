// B"H
const Obj = require('./object.js');
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function normGraph(input) { return Array.isArray(input) ? input : input?.objects || [input].filter(Boolean); }
function create() {
  const map = new Map(), watchers = new Map();
  const events = [];
  let seq = 0;
  function emit(type, data = {}) {
    const e = { id:`graph:event:${++seq}`, seq, type, data, at:Obj.now() };
    events.push(e); notify(e); return e;
  }
  function matches(watcher, event) {
    const f = watcher.filter || {};
    if (f.type && f.type !== event.type && f.eventType !== event.type) return false;
    if (f.id && f.id !== event.data?.id) return false;
    if (f.objectType && f.objectType !== event.data?.type) return false;
    return true;
  }
  function notify(event) { for (const w of watchers.values()) if (matches(w, event)) w.queue.push(Obj.clone(event)); }
  function subscribe(input = {}) {
    const id = input.id || `graph:watch:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`;
    const watcher = { id, filter:input.filter || {}, createdAt:Obj.now(), lastSeq:seq, queue:[] };
    watchers.set(id, watcher); emit('watcher.created', { id, filter:watcher.filter }); return summary(watcher);
  }
  function unsubscribe(id) { const old = watchers.get(id); if (!old) return null; watchers.delete(id); emit('watcher.deleted', { id }); return summary(old); }
  function drain(id, limit = 100) { const w = watchers.get(id); if (!w) return null; const events = w.queue.splice(0, Number(limit || 100)); w.lastSeq = events.at(-1)?.seq || w.lastSeq; return { watcher:summary(w), events }; }
  function summary(w) { return { id:w.id, filter:Obj.clone(w.filter), createdAt:w.createdAt, lastSeq:w.lastSeq, queued:w.queue.length }; }
  function watcherList() { return [...watchers.values()].map(summary); }
  function upsert(input = {}) { const old = map.get(input.id); const next = old ? Obj.mergeObject(old, input) : Obj.object(input); map.set(next.id, next); emit(old ? 'object.updated' : 'object.created', { id:next.id, type:next.type }); return Obj.clone(next); }
  function remove(id) { const old = map.get(id); if (!old) return null; map.delete(id); emit('object.deleted', { id, type:old.type, object:old }); return Obj.clone(old); }
  function get(id) { const obj = map.get(id); return obj ? Obj.clone(obj) : null; }
  function list() { return [...map.values()].map(Obj.clone); }
  function search(q = '') { const text = String(q).toLowerCase(); return list().filter(o => JSON.stringify(o).toLowerCase().includes(text)); }
  function indexes() {
    const byType = {}, byParent = {}, byPath = {}, reverseRefs = {};
    for (const o of map.values()) {
      (byType[o.type] ||= []).push(o.id);
      if (o.parentId) (byParent[o.parentId] ||= []).push(o.id);
      if (o.path) byPath[o.path] = o.id;
      for (const ref of [...(o.refs || []), ...(o.children || [])]) (reverseRefs[ref] ||= []).push(o.id);
    }
    return { byType, byParent, byPath, reverseRefs };
  }
  function references(id) { const o = map.get(id); const idx = indexes(); return { refs:(o?.refs || []).map(get).filter(Boolean), children:(o?.children || []).map(get).filter(Boolean), reverse:(idx.reverseRefs[id] || []).map(get).filter(Boolean) }; }
  function pathLookup(value = '') { const text = String(value); return list().find(o => [o.id, o.url, o.path, o.title].includes(text)) || search(text)[0] || null; }
  function traverse({ id, direction = 'out', depth = 2, types = [] } = {}) {
    const wanted = new Set(Array.isArray(types) ? types : [types].filter(Boolean));
    const seen = new Set(), edges = [], objects = []; let frontier = [id].filter(Boolean);
    for (let level = 0; level <= Number(depth || 0) && frontier.length; level++) {
      const next = [];
      for (const current of frontier) {
        if (seen.has(current)) continue; seen.add(current);
        const obj = get(current); if (obj && (!wanted.size || wanted.has(obj.type))) objects.push(obj);
        const r = references(current), linked = direction === 'in' ? r.reverse : [...r.refs, ...r.children];
        for (const target of linked) { edges.push({ from:direction === 'in' ? target.id : current, to:direction === 'in' ? current : target.id }); next.push(target.id); }
      }
      frontier = next;
    }
    return { objects, edges };
  }
  function diff(input = {}) {
    const incoming = new Map(normGraph(input).map(o => [o.id, o])); const added = [], removed = [], changed = [];
    for (const [id, obj] of incoming) { const current = map.get(id); if (!current) added.push(obj); else if (!same(current, obj)) changed.push({ id, before:Obj.clone(current), after:Obj.clone(obj) }); }
    for (const [id, obj] of map) if (!incoming.has(id)) removed.push(Obj.clone(obj)); return { added, removed, changed };
  }
  function transaction(operations = []) {
    const backup = new Map(map), beforeEvents = events.length, results = [];
    try { for (const op of operations) results.push((op.op === 'delete' || op.op === 'remove') ? remove(op.id) : (op.op === 'upsert' || !op.op) ? upsert(op.object || op) : (() => { throw new Error(`Unsupported graph transaction op: ${op.op}`); })()); emit('transaction.committed', { count:operations.length }); return { ok:true, results, graph:snapshot() }; }
    catch (error) { map.clear(); for (const [k, v] of backup) map.set(k, v); events.splice(beforeEvents); return { ok:false, error:error.message, graph:snapshot() }; }
  }
  function history(filter = {}) { return events.filter(e => (!filter.type || e.type === filter.type) && (!filter.id || e.data?.id === filter.id)).slice(-(filter.limit || 100)); }
  function snapshot() { return { kind:'virtual-os-graph', at:Obj.now(), objects:list(), indexes:indexes(), watchers:watcherList(), events:history({ limit:100 }) }; }
  return { upsert, remove, delete:remove, get, list, search, indexes, references, pathLookup, traverse, diff, transaction, history, subscribe, unsubscribe, watchers:watcherList, drain, snapshot };
}
/** B"H: the registry is a river that remembers each stone and now lets watchers hear the splash. */
module.exports = { create };
