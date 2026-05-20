//B"H
import { normalizeMessage } from "../messageNormalizer.js";
import { interpretStreamPacket, mergeStreamText } from "../streamPacket.js";
import { mergeEvents } from "./renderHelpers.js";

export function makeRecord(input) {
  const msg = normalizeMessage(input);
  const streamEvent = input?.awtsmoosStreamEvent;
  return {
    id: msg.id || crypto.randomUUID(),
    role: msg.role,
    text: msg.text || "",
    events: mergeEvents(streamEvent ? [streamEvent] : (msg.events || []), input?.awtsmoosFoldedEvents || []),
    raw: msg.raw,
    prepared: null,
    shell: null,
    expanded: false,
    loading: Boolean(input?.awtsmoosLoading),
    message: msg
  };
}

export function applyPacket(record, input, role) {
  const live = interpretStreamPacket(input);
  const normalized = typeof input === "string" ? null : normalizeMessage(input);
  const nextText = live.text || normalized?.text || (typeof input === "string" ? input : "");
  if (nextText) record.text = mergeStreamText(record.text, nextText);
  const events = [live.event, ...(normalized?.events || [])].filter(Boolean);
  if (events.length) record.events = mergeEvents(record.events, events);
  record.role = role;
  record.loading = false;
}

export function snapshotRecord(record) {
  return { text: record.text, events: record.events, role: record.role, raw: record.raw };
}
