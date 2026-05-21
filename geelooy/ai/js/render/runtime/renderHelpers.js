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
    const raw = event?.raw || event;
    const text = event?.text || raw?.dataNoJSON || raw?.message?.content?.parts?.join?.("\n") || "";
    const key = [event?.kind, event?.label, raw?.id || raw?.message?.id || raw?.event || "", String(text).replace(/\s+/g, " ").slice(0, 240)].join("::");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function eventMergeKey(event = {}) {
  const streamKey = streamingToolKey(event);
  if (streamKey) return streamKey;
  const raw = event.raw || event;
  if (raw.groupedThoughtEnvelope) return raw.groupKey || [event.kind, "thought-envelope"].join("::");
  const msg = raw.message || raw.input_message || raw.data?.message || raw;
  const stable = msg.id || raw.id || raw.message_id || raw.parent || raw.type || raw.event;
  if (stable) return [event.kind, event.label, stable].join("::");
  return [event.kind, event.label, String(event.text || "").replace(/\s+/g, " ").slice(0, 160)].join("::");
}

export function mergeEvents(current = [], next = []) {
  const keyed = new Map();
  for (const event of [...current, ...next]) keyed.set(eventMergeKey(event), event);
  return dedupeEvents([...keyed.values()]).slice(-140);
}
