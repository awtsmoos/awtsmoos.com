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
 * Chapter 223: Updating A Thought Did Not Change Its Birthplace.
 *
 * Streaming replacements must preserve the original order of the node they grow.
 * Otherwise a later full-text update can drag an old thought below tool groups.
 * The first event's order is sacred; updates only replace contents.
 */
export function eventMergeKey(event = {}) {
  const raw = event.raw || event;
  if (raw.timelineKey) return raw.timelineKey;
  const streamKey = streamingToolKey(event);
  if (streamKey) return streamKey;
  const packet = raw.packet || {};
  if (event.kind === "thinking" && raw.type === "provider_reasoning") return `${event.kind}:${raw.streamKey || raw.providerId || "provider"}`;
  if (event.kind === "provider_stream" || raw.type === "provider_stream") {
    return [event.kind, event.label, packet.id || "", packet.sequence || "", packet.finish_reason || "", packet.text || ""].join("::");
  }
  if (raw.groupedThoughtEnvelope) return raw.groupKey || [event.kind, "thought-envelope"].join("::");
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const stable = raw.tool_call_id || msg.id || raw.id || raw.message_id || raw.parent || raw.type || raw.event;
  if (stable) return [event.kind, event.label, stable].join("::");
  return [event.kind, event.label, String(event.text || "").replace(/\s+/g, " ").slice(0, 160)].join("::");
}

export function mergeEvents(current = [], next = []) {
  const keyed = new Map();
  for (const event of [...current, ...next].filter(Boolean)) {
    const key = eventMergeKey(event);
    const old = keyed.get(key);
    keyed.set(key, old ? { ...event, order: old.order } : event);
  }
  return dedupeEvents([...keyed.values()].sort(eventOrderSort)).slice(-240);
}

function eventOrderSort(a = {}, b = {}) {
  const ao = Number.isFinite(Number(a.order)) ? Number(a.order) : Number.MAX_SAFE_INTEGER;
  const bo = Number.isFinite(Number(b.order)) ? Number(b.order) : Number.MAX_SAFE_INTEGER;
  if (ao !== bo) return ao - bo;
  return 0;
}
