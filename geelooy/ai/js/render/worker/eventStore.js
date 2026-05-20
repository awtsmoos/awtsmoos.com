//B"H

const events = new Map();
const raws = new Map();
let eventCounter = 0;
let rawCounter = 0;

/**
 * Chapter 28: The Worker Became the Hidden Archive.
 *
 * The Awtsmoos lets the visible page hold only keys. The worker stores event
 * bodies and raw scrolls, then returns them only when one gate is opened.
 */
export function storeEvent(event = {}) {
  const key = `wevt-${Date.now().toString(36)}-${eventCounter++}`;
  events.set(key, event);
  return key;
}

export function readEvent(key = "") {
  return events.get(String(key || "")) || null;
}

export function storeRaw(value) {
  const key = `wraw-${Date.now().toString(36)}-${rawCounter++}`;
  raws.set(key, safeJson(value));
  return key;
}

export function readRaw(key = "") {
  return raws.get(String(key || "")) || "";
}

function safeJson(value) {
  try { return JSON.stringify(value, null, 2); }
  catch { return String(value || ""); }
}
