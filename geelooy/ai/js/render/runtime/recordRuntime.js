//B"H
import { normalizeMessage } from "../messageNormalizer.js";
import { interpretStreamPacket, mergeStreamText } from "../streamPacket.js";
import { mergeEvents } from "./renderHelpers.js";

/**
 * Chapter 52: The Record Became A Living Scroll.
 *
 * A record starts as a vessel for loading, text, or hidden events. While stream
 * packets arrive it is marked `streaming`; when the router finishes, the record
 * freezes into normal markdown history without losing its raw traces.
 *
 * @param {object} input Raw message input.
 * @returns {object} Mutable render record.
 */
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
    streaming: Boolean(input?.awtsmoosLoading),
    message: msg
  };
}

/**
 * Applies a live packet to a record without replacing the whole record object.
 *
 * @param {object} record Existing record.
 * @param {object|string} input Incoming packet.
 * @param {string} role Render role.
 * @returns {void}
 */
export function applyPacket(record, input, role) {
  const live = interpretStreamPacket(input);
  const normalized = typeof input === "string" ? null : normalizeMessage(input);
  const nextText = live.text || normalized?.text || (typeof input === "string" ? input : "");
  if (nextText) record.text = mergeStreamText(record.text, nextText);
  const events = [live.event, ...(normalized?.events || [])].filter(Boolean);
  if (events.length) record.events = mergeEvents(record.events, events);
  record.role = role;
  record.loading = false;
  record.streaming = true;
}

/**
 * @param {object} record Record to snapshot.
 * @returns {{text:string,events:Array,role:string,raw:object}} Serializable record snapshot.
 */
export function snapshotRecord(record) {
  return { text: record.text, events: record.events, role: record.role, raw: summarizeRawForVault(record.raw) };
}

/**
 * B"H — stores only the footprint of raw provider thunder.
 *
 * Raw packets can contain vast event forests. The renderer keeps the living text
 * and semantic events; the vault needs only enough raw shape for diagnostics,
 * not a second hidden copy of every extension payload.
 *
 * @param {*} raw Raw normalized message payload.
 * @returns {object|null} Compact diagnostic shape.
 */
function summarizeRawForVault(raw) {
  if (!raw || typeof raw !== "object") return null;
  return { kind: Array.isArray(raw) ? "array" : "object", keys: Object.keys(raw).slice(0, 16), id: raw.id || raw.message?.id || null };
}
