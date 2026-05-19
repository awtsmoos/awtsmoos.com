//B"H

const CHUNK = 1800;
const MAX_CHUNKS = 8;

self.onmessage = event => {
  const { id, records } = event.data || {};
  const prepared = (records || []).map(prepareRecord);
  self.postMessage({ id, records: prepared });
};

function prepareRecord(record) {
  const text = String(record.text || "");
  const chunks = splitText(text);
  return {
    id: record.id,
    role: record.role || "assistant",
    raw: record.raw || null,
    events: record.events || [],
    textLength: text.length,
    chunks
  };
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
  if (offset < text.length) chunks.push({ index: chunks.length, total: 0, text: `… ${text.length - offset} more characters stored off-DOM. Open raw/source to inspect.`, overflow: true });
  const total = chunks.length;
  return chunks.map(chunk => ({ ...chunk, total }));
}

function findSoftBreak(text, start, hardEnd) {
  if (hardEnd >= text.length) return text.length;
  const slice = text.slice(start, hardEnd);
  const candidates = [slice.lastIndexOf("\n\n"), slice.lastIndexOf("\n"), slice.lastIndexOf(". "), slice.lastIndexOf(" ")].filter(v => v > CHUNK * .55);
  const best = candidates.length ? Math.max(...candidates) : slice.length;
  return Math.max(start + 1, start + best + (slice[best] === " " ? 1 : 0));
}
