//B"H
import { normalizeMessage } from "../messageNormalizer.js";
import { interpretStreamPacket, mergeStreamText } from "../streamPacket.js";
import { mergeEvents } from "./renderHelpers.js";

/**
 * Chapter 199: The Record Remembered Metrics While It Was Still Alive.
 *
 * A record starts as loading, text, or events. Live packets may carry text,
 * reasoning/tool events, and stream metrics. All three must survive refreshes,
 * reload snapshots, and final markdown freezing.
 */
export function makeRecord(input) {
  const msg = normalizeMessage(input);
  const streamEvent = input?.awtsmoosStreamEvent;
  return {
    id: msg.id || crypto.randomUUID(),
    role: msg.role,
    text: msg.text || "",
    events: mergeEvents(streamEvent ? [streamEvent] : (msg.events || []), input?.awtsmoosFoldedEvents || []),
    metrics: input?.awtsmoos?.metrics || null,
    raw: msg.raw,
    prepared: null,
    shell: null,
    expanded: false,
    loading: Boolean(input?.awtsmoosLoading),
    streaming: Boolean(input?.awtsmoosLoading),
    streamStartedAt: Date.now(),
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
  if (input?.awtsmoos?.metrics) record.metrics = input.awtsmoos.metrics;
  record.role = role;
  record.loading = false;
  record.streaming = true;
  record.streamStartedAt ||= Date.now();
}

export function snapshotRecord(record) {
  return {
    text: record.text,
    events: record.events,
    role: record.role,
    metrics: record.metrics,
    raw: summarizeRawForVault(record.raw)
  };
}

/**
 * B"H — stores only the footprint of raw provider thunder.
 *
 * Raw packets can contain vast event forests. The renderer keeps the living text
 * and semantic events; the vault needs only enough raw shape for diagnostics,
 * not a second hidden copy of every extension payload.
 */
function summarizeRawForVault(raw) {
  if (!raw || typeof raw !== "object") return null;
  return { kind: Array.isArray(raw) ? "array" : "object", keys: Object.keys(raw).slice(0, 16), id: raw.id || raw.message?.id || null };
}
