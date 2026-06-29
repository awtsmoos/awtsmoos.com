// B"H
const Obj = require('./object.js');

function create(events, seqReader) {
  const watchers = new Map();
  return {
    notify(event) { for (const w of watchers.values()) if (matches(w, event)) w.queue.push(Obj.clone(event)); },
    subscribe(input = {}, emit) { const w = makeWatcher(input, seqReader()); watchers.set(w.id, w); emit('watcher.created', { id:w.id, filter:w.filter }); return summary(w); },
    unsubscribe(id, emit) { const w = watchers.get(id); if (!w) return null; watchers.delete(id); emit('watcher.deleted', { id }); return summary(w); },
    drain(id, limit = 100) { const w = watchers.get(id); if (!w) return null; const events = w.queue.splice(0, Number(limit || 100)); w.lastSeq = events.at(-1)?.seq || w.lastSeq; return { watcher:summary(w), events }; },
    list() { return [...watchers.values()].map(summary); },
    backup() { return [...watchers.entries()].map(([id, w]) => [id, cloneWatcher(w)]); },
    restore(entries = []) { watchers.clear(); for (const [id, w] of entries) watchers.set(id, w); }
  };
}

function makeWatcher(input = {}, seq = 0) { return { id:input.id || `graph:watch:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`, filter:input.filter || {}, createdAt:Obj.now(), lastSeq:seq, queue:[] }; }
function summary(w) { return { id:w.id, filter:Obj.clone(w.filter), createdAt:w.createdAt, lastSeq:w.lastSeq, queued:w.queue.length }; }
function matches(w, event) { const f = w.filter || {}; if (f.type && f.type !== event.type && f.eventType !== event.type) return false; if (f.id && f.id !== event.data?.id) return false; if (f.objectType && f.objectType !== event.data?.type) return false; return true; }
function cloneWatcher(w) { return { ...w, filter:Obj.clone(w.filter), queue:w.queue.map(Obj.clone) }; }

module.exports = { create };
/** B"H: server watchers mirror the browser cups without a second river. */
