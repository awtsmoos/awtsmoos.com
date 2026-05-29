//B"H
import { streamingToolKey } from "./toolStreamIdentity.js";

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function button(className) {
  const el = document.createElement("button");
  el.className = className;
  return el;
}

export function dedupeEvents(events = []) {
  const seen = new Set();
  return events.filter(event => {
    const key = eventMergeKey(event);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Chapter 188: The Same Completion Id No Longer Ate Its Own Children.
 *
 * MiniMax reuses one completion id for every SSE chunk. If the renderer keyed
 * by that id alone, later packets replaced earlier packets and the event rail
 * blinked like a broken vessel. Provider stream events now carry sequence/text
 * identity so every real drop remains visible in order.
 */
export function eventMergeKey(event = {}) {
  const streamKey = streamingToolKey(event);
  if (streamKey) return streamKey;
  const raw = event.raw || event;
  const packet = raw.packet || {};
  if (event.kind === "provider_stream" || raw.type === "provider_stream") {
    return [event.kind, event.label, packet.id || "", packet.sequence || "", packet.finish_reason || "", packet.text || ""].join("::");
  }
  if (raw.groupedThoughtEnvelope) return raw.groupKey || [event.kind, "thought-envelope"].join("::");
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const stable = msg.id || raw.id || raw.message_id || raw.parent || raw.type || raw.event;
  if (stable) return [event.kind, event.label, stable].join("::");
  return [event.kind, event.label, String(event.text || "").replace(/\s+/g, " ").slice(0, 160)].join("::");
}

export function mergeEvents(current = [], next = []) {
  const keyed = new Map();
  for (const event of [...current, ...next]) keyed.set(eventMergeKey(event), event);
  return dedupeEvents([...keyed.values()].sort(eventOrderSort)).slice(-180);
}

function eventOrderSort(a = {}, b = {}) {
  const ao = Number.isFinite(Number(a.order)) ? Number(a.order) : Number.MAX_SAFE_INTEGER;
  const bo = Number.isFinite(Number(b.order)) ? Number(b.order) : Number.MAX_SAFE_INTEGER;
  if (ao !== bo) return ao - bo;
  return 0;
}
