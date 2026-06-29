// B"H
import { clone } from "./object.js";

export function createWatcherStore(events) {
  const watchers = new Map();
  return {
    notify(event) {
      for (const watcher of watchers.values()) if (matches(watcher, event)) watcher.queue.push(clone(event));
    },
    subscribe(input = {}, emit) {
      const watcher = makeWatcher(input, lastSeq(events));
      watchers.set(watcher.id, watcher);
      emit("watcher.created", { id:watcher.id, filter:watcher.filter });
      return summary(watcher);
    },
    unsubscribe(id, emit) {
      const watcher = watchers.get(id);
      if (!watcher) return null;
      watchers.delete(id);
      emit("watcher.deleted", { id });
      return summary(watcher);
    },
    drain(id, limit = 100) {
      const watcher = watchers.get(id);
      if (!watcher) return null;
      const events = watcher.queue.splice(0, Number(limit || 100));
      watcher.lastSeq = events.at(-1)?.seq || watcher.lastSeq;
      return { watcher:summary(watcher), events };
    },
    list() { return [...watchers.values()].map(summary); },
    backup() { return [...watchers.entries()].map(([id, watcher]) => [id, cloneWatcher(watcher)]); },
    restore(entries = []) { watchers.clear(); for (const [id, watcher] of entries) watchers.set(id, watcher); }
  };
}

function makeWatcher(input = {}, seq = 0) {
  return {
    id:input.id || `graph:watch:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`,
    filter:input.filter || {},
    createdAt:new Date().toISOString(),
    lastSeq:seq,
    queue:[]
  };
}

function lastSeq(events) {
  return events.lastSeq?.() ?? events.list?.().at(-1)?.seq ?? 0;
}

function summary(watcher) {
  return {
    id:watcher.id,
    filter:clone(watcher.filter),
    createdAt:watcher.createdAt,
    lastSeq:watcher.lastSeq,
    queued:watcher.queue.length
  };
}

function matches(watcher, event) {
  const filter = watcher.filter || {};
  if (filter.type && filter.type !== event.type && filter.eventType !== event.type) return false;
  if (filter.id && filter.id !== event.data?.id) return false;
  if (filter.objectType && filter.objectType !== event.data?.type) return false;
  return true;
}

function cloneWatcher(watcher) {
  return { ...watcher, filter:clone(watcher.filter), queue:watcher.queue.map(clone) };
}

/**
 * B"H
 * Watchers keep their place by event sequence. They do not guess from array
 * length; they remember the last numbered spark they actually received.
 */
