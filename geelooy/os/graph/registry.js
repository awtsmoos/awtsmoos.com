// B"H
import { graphObject, mergeObject, clone } from "./object.js";
import { EventLog } from "./events.js";
import { snapshot } from "./snapshot.js";
import { pathLookup } from "./query.js";

export class ObjectGraph {
  constructor() { this.map = new Map(); this.events = new EventLog(); this._watchers = new Map(); }
  emit(type, data = {}) { const event = this.events.push(type, data); this.notify(event); return event; }
  notify(event) { for (const watcher of this._watchers.values()) if (matchesWatcher(watcher, event)) watcher.queue.push(clone(event)); }
  subscribe(input = {}) { const watcher = makeWatcher(input, this.events.list().length); this._watchers.set(watcher.id, watcher); this.emit("watcher.created", { id:watcher.id, filter:watcher.filter }); return watcherSummary(watcher); }
  unsubscribe(id) { const watcher = this._watchers.get(id); if (!watcher) return null; this._watchers.delete(id); this.emit("watcher.deleted", { id }); return watcherSummary(watcher); }
  drain(id, limit = 100) { const watcher = this._watchers.get(id); if (!watcher) return null; const events = watcher.queue.splice(0, Number(limit || 100)); watcher.lastSeq = events.at(-1)?.seq || watcher.lastSeq; return { watcher:watcherSummary(watcher), events }; }
  watchers() { return [...this._watchers.values()].map(watcherSummary); }
  upsert(input) {
    const old = this.map.get(input.id);
    const object = old ? mergeObject(old, input) : graphObject(input);
    this.map.set(object.id, object); this.emit(old ? "object.updated" : "object.created", { id:object.id, type:object.type }); return clone(object);
  }
  get(id) { return clone(this.map.get(id) || null); }
  list() { return [...this.map.values()].map(clone); }
  remove(id) { const old = this.map.get(id); if (!old) return null; this.map.delete(id); this.emit("object.deleted", { id, type:old.type }); return clone(old); }
  references(id) {
    const object = this.map.get(id), reverse = [];
    for (const other of this.map.values()) if ([...(other.refs || []), ...(other.children || [])].includes(id)) reverse.push(clone(other));
    return { refs:(object?.refs || []).map(ref => this.get(ref)).filter(Boolean), children:(object?.children || []).map(ref => this.get(ref)).filter(Boolean), reverse };
  }
  pathLookup(value) { return pathLookup(this, value); }
  traverse(options = {}) { return traverseGraph(this, options); }
  diff(input = {}) { return diffGraph(this, input); }
  history(filter = {}) { return this.events.list().filter(event => (!filter.type || event.type === filter.type) && (!filter.id || event.data?.id === filter.id)).slice(-(filter.limit || 100)); }
  transaction(operations = []) { return runTransaction(this, operations); }
  snapshot() { return snapshot(this); }
}

function makeWatcher(input = {}, seq = 0) { return { id:input.id || `graph:watch:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`, filter:input.filter || {}, createdAt:new Date().toISOString(), lastSeq:seq, queue:[] }; }
function watcherSummary(watcher) { return { id:watcher.id, filter:clone(watcher.filter), createdAt:watcher.createdAt, lastSeq:watcher.lastSeq, queued:watcher.queue.length }; }
function matchesWatcher(watcher, event) { const f = watcher.filter || {}; if (f.type && f.type !== event.type && f.eventType !== event.type) return false; if (f.id && f.id !== event.data?.id) return false; if (f.objectType && f.objectType !== event.data?.type) return false; return true; }
function cloneWatchers(graph) { return [...graph._watchers.entries()].map(([id, w]) => [id, { ...w, filter:clone(w.filter), queue:w.queue.map(clone) }]); }
function restoreWatchers(graph, backup) { graph._watchers.clear(); for (const [id, watcher] of backup) graph._watchers.set(id, watcher); }

function traverseGraph(graph, { id, direction = "out", depth = 2 } = {}) {
  const seen = new Set(), objects = [], edges = []; let frontier = [id].filter(Boolean);
  for (let level = 0; level <= Number(depth || 0) && frontier.length; level++) {
    const next = [];
    for (const current of frontier) {
      if (seen.has(current)) continue; seen.add(current);
      const object = graph.get(current); if (object) objects.push(object);
      const refs = graph.references(current), linked = direction === "in" ? refs.reverse : [...refs.refs, ...refs.children];
      for (const target of linked) { edges.push({ from:direction === "in" ? target.id : current, to:direction === "in" ? current : target.id }); next.push(target.id); }
    }
    frontier = next;
  }
  return { objects, edges };
}

function diffGraph(graph, input = {}) {
  const source = input.objects || (input.id ? [input] : []), incoming = new Map(source.filter(Boolean).map(object => [object.id, object]));
  const added = [], changed = [], removed = [];
  for (const [id, object] of incoming) { const current = graph.get(id); if (!current) added.push(object); else if (JSON.stringify(current) !== JSON.stringify(object)) changed.push({ id, before:current, after:object }); }
  for (const object of graph.list()) if (!incoming.has(object.id)) removed.push(object);
  return { added, changed, removed };
}

function applyOperation(graph, op) { if (op.op === "delete" || op.op === "remove") return graph.remove(op.id); if (op.op === "upsert" || !op.op) return graph.upsert(op.object || op); throw new Error(`Unsupported graph transaction op: ${op.op}`); }
function runTransaction(graph, operations = []) {
  const backup = graph.list(), eventBackup = graph.events.list(), watcherBackup = cloneWatchers(graph), results = [];
  try { for (const op of operations) results.push(applyOperation(graph, op)); graph.emit("transaction.committed", { count:operations.length }); return { ok:true, results, graph:graph.snapshot() }; }
  catch (error) { graph.map.clear(); backup.forEach(object => graph.map.set(object.id, object)); graph.events.events = eventBackup; restoreWatchers(graph, watcherBackup); return { ok:false, error:error.message, graph:graph.snapshot() }; }
}

export function makeObjectGraph() { return new ObjectGraph(); }
/** B"H: the browser graph now walks, remembers, compares, rolls back, and lets watchers hear its living changes. */
