//B"H

const events = new Map();
const raws = new Map();
const MAX_EVENTS = 360;
const MAX_RAWS = 180;
const MAX_TEXT = 60000;
let eventCounter = 0;
let rawCounter = 0;

/**
 * Chapter 28: The Worker Became the Hidden Archive, Then Learned Hunger.
 *
 * The visible page holds only keys. The worker stores event bodies and raw
 * scrolls, but it may never become an infinite cave. Every insertion trims,
 * every old uncapped session can be purged by reset, and massive strings are
 * shortened before the browser gets dragged into silence.
 */
export function storeEvent(event = {}, stableKey = "") {
  const key = stableKey || `wevt-${Date.now().toString(36)}-${eventCounter++}`;
  events.set(key, slimEvent(event));
  trimOldest(events, MAX_EVENTS);
  return key;
}

export function readEvent(key = "") {
  return events.get(String(key || "")) || null;
}

export function storeRaw(value, stableKey = "") {
  const key = stableKey || `wraw-${Date.now().toString(36)}-${rawCounter++}`;
  raws.set(key, safeJson(value));
  trimOldest(raws, MAX_RAWS);
  return key;
}

export function readRaw(key = "") {
  return raws.get(String(key || "")) || "";
}

export function resetStores() {
  events.clear();
  raws.clear();
  eventCounter = 0;
  rawCounter = 0;
  return stats();
}

export function stats() {
  return { events: events.size, raws: raws.size, eventCounter, rawCounter, maxEvents: MAX_EVENTS, maxRaws: MAX_RAWS };
}

function trimOldest(map, max) {
  while (map.size > max) map.delete(map.keys().next().value);
}

function slimEvent(event = {}) {
  try { return shrink(event); }
  catch { return { kind: event?.kind || "raw", label: event?.label || "event", text: truncate(String(event?.text || "")) }; }
}

function shrink(value, depth = 0) {
  if (value == null) return value;
  if (typeof value === "string") return truncate(value);
  if (typeof value !== "object") return value;
  if (depth > 8) return "[deep payload trimmed]";
  if (Array.isArray(value)) return value.slice(-160).map(item => shrink(item, depth + 1));
  const out = {};
  for (const [key, child] of Object.entries(value)) out[key] = shrink(child, depth + 1);
  return out;
}

function truncate(text) {
  return text.length > MAX_TEXT ? text.slice(0, MAX_TEXT) + `\n… ${text.length - MAX_TEXT} more chars trimmed from worker memory.` : text;
}

function safeJson(value) {
  try { return JSON.stringify(shrink(value), null, 2); }
  catch { return truncate(String(value || "")); }
}
