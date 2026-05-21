//B"H
import { storeEvent, readEvent, storeRaw, readRaw } from "./eventStore.js";
import { parseSseChunk } from "./sseParser.js";

const CHUNK = 1800;
const MAX_CHUNKS = 8;

self.onmessage = event => {
  const msg = event.data || {};
  if (msg.kind === "storeEvent") return reply(msg, { key: storeEvent(msg.event || {}) });
  if (msg.kind === "readEvent") return reply(msg, { event: readEvent(msg.key) });
  if (msg.kind === "storeRaw") return reply(msg, { key: storeRaw(msg.value) });
  if (msg.kind === "readRaw") return reply(msg, { raw: readRaw(msg.key) });
  if (msg.kind === "sseChunk") return reply(msg, { packets: parseSseChunk(msg.sessionId, msg.text, msg.final) });
  const records = (msg.records || []).map(prepareRecord);
  self.postMessage({ id: msg.id, records });
};

function reply(msg, extra) { self.postMessage({ id: msg.id, ...extra }); }

function prepareRecord(record) {
  const text = String(record.text || "");
  return {
    id: record.id,
    role: record.role || "assistant",
    raw: null,
    events: summarizeEvents(record.events || []),
    textLength: text.length,
    chunks: splitText(text)
  };
}

function summarizeEvents(events) {
  return events.map(event => ({
    kind: event.kind || "raw",
    label: event.label || "event",
    textLength: String(event.text || "").length,
    key: storeEvent(event)
  }));
}

function splitText(text) {
  if (text.length <= CHUNK) return [{ index: 0, total: 1, text, overflow: false }];
  const chunks = [];
  let offset = 0;
  while (offset < text.length && chunks.length < MAX_CHUNKS) {
    const next = Math.min(text.length, offset + CHUNK);
    const soft = findSoftBreak(text, offset, next);
    chunks.push({ index: chunks.length, total: 0, text: text.slice(offset, soft), overflow: false });
    offset = soft;
  }
  if (offset < text.length) chunks.push({ index: chunks.length, total: 0, text: `… ${text.length - offset} more characters stored off-DOM.`, overflow: true });
  return chunks.map(chunk => ({ ...chunk, total: chunks.length }));
}

function findSoftBreak(text, start, hardEnd) {
  if (hardEnd >= text.length) return text.length;
  const slice = text.slice(start, hardEnd);
  const marks = ["\n\n", "\n", ". ", " "].map(mark => slice.lastIndexOf(mark)).filter(v => v > CHUNK * .55);
  const best = marks.length ? Math.max(...marks) : slice.length;
  return Math.max(start + 1, start + best + (slice[best] === " " ? 1 : 0));
}
