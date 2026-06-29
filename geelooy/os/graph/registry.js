// B"H
import { graphObject, mergeObject, clone } from "./object.js";
import { EventLog } from "./events.js";
import { snapshot } from "./snapshot.js";
import { pathLookup, search } from "./query.js";
import { createWatcherStore } from "./watchers.js";
import { traverseGraph } from "./traversal.js";
import { diffGraph } from "./diff.js";
import { runTransaction } from "./transaction.js";

export class ObjectGraph {
  constructor() {
    this.map = new Map();
    this.events = new EventLog();
    this.watchStore = createWatcherStore(this.events);
  }

  emit(type, data = {}) { const event = this.events.push(type, data); this.watchStore.notify(event); return event; }
  subscribe(input = {}) { return this.watchStore.subscribe(input, this.emit.bind(this)); }
  unsubscribe(id) { return this.watchStore.unsubscribe(id, this.emit.bind(this)); }
  drain(id, limit = 100) { return this.watchStore.drain(id, limit); }
  watchers() { return this.watchStore.list(); }

  upsert(input) {
    const old = this.map.get(input.id);
    const object = old ? mergeObject(old, input) : graphObject(input);
    this.map.set(object.id, object);
    this.emit(old ? "object.updated" : "object.created", { id:object.id, type:object.type });
    return clone(object);
  }

  get(id) { return clone(this.map.get(id) || null); }
  list() { return [...this.map.values()].map(clone); }

  remove(id) {
    const old = this.map.get(id);
    if (!old) return null;
    this.map.delete(id);
    this.emit("object.deleted", { id, type:old.type });
    return clone(old);
  }

  references(id) {
    const object = this.map.get(id), reverse = [];
    for (const other of this.map.values()) {
      if ([...(other.refs || []), ...(other.children || [])].includes(id)) reverse.push(clone(other));
    }
    return {
      refs:(object?.refs || []).map(ref => this.get(ref)).filter(Boolean),
      children:(object?.children || []).map(ref => this.get(ref)).filter(Boolean),
      reverse
    };
  }

  search(text = "") { return search(this, text); }
  pathLookup(value) { return pathLookup(this, value); }
  traverse(options = {}) { return traverseGraph(this, options); }
  diff(input = {}) { return diffGraph(this, input); }
  history(filter = {}) {
    return this.events.list()
      .filter(event => (!filter.type || event.type === filter.type) && (!filter.id || event.data?.id === filter.id))
      .slice(-(filter.limit || 100));
  }
  transaction(operations = []) { return runTransaction(this, operations); }
  snapshot() { return snapshot(this); }
}

export function makeObjectGraph() { return new ObjectGraph(); }

/**
 * B"H
 * The graph registry is the throne room of object identity. Search now enters
 * through the same door as history, transactions, traversal, and watchers.
 */
