//B"H

const sessions = new Map();

/**
 * B"H
 * Chapter 263: The Final Tail Was Not Replaced By The Last Pebble.
 *
 * Streaming chunks may split an SSE block at any byte. On final flush the old
 * parser accidentally appended only the newest chunk instead of the accumulated
 * tail, erasing split `<think>` packets. The Awtsmoos now keeps the whole tail,
 * parses complete blocks once, and deletes the session only after the river is
 * actually drained.
 *
 * @param {string} sessionId Stable stream id.
 * @param {string} text New stream text.
 * @param {boolean} final Whether this is the last chunk.
 * @returns {object[]} Parsed packets.
 */
export function parseSseChunk(sessionId, text = "", final = false) {
  const state = sessions.get(sessionId) || { buffer: "", seen: new Set() };
  state.buffer += String(text || "");
  const parts = state.buffer.split(/\r?\n\r?\n/);
  const tail = parts.pop() || "";
  const blocks = final ? [...parts, tail].filter(Boolean) : parts;
  state.buffer = final ? "" : tail;
  const packets = blocks.map(block => parseBlock(block, state)).filter(Boolean);
  if (final) sessions.delete(sessionId); else sessions.set(sessionId, state);
  return packets;
}

function parseBlock(block, state) {
  const trimmed = String(block || "").trim();
  if (!trimmed) return null;
  const { event, data } = collectBlock(trimmed);
  if (!data) return null;
  const key = `${event || "message"}:${data}`;
  if (state.seen.has(key)) return null;
  state.seen.add(key);
  try { return { data: JSON.parse(data), event }; }
  catch (error) { return { dataNoJSON: data, event, error: String(error?.message || error) }; }
}

function collectBlock(block) {
  let event = null;
  const dataLines = [];
  for (const line of String(block || "").split(/\r?\n/)) {
    if (/^event\s*:/i.test(line)) event = line.replace(/^event\s*:\s?/i, "").trim();
    if (/^data\s*:/i.test(line)) dataLines.push(line.replace(/^data\s*:\s?/i, ""));
  }
  return { event, data: dataLines.join("\n").trim() };
}
