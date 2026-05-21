//B"H

const sessions = new Map();

/**
 * Chapter 35: The Stream Was Judged Beyond the Window.
 *
 * The Awtsmoos lets bytes arrive from the bridge, but SSE parsing happens in
 * the worker. Complete packets return to the page; partial smoke stays here.
 */
export function parseSseChunk(sessionId, text = "", final = false) {
  const state = sessions.get(sessionId) || { buffer: "", seen: new Set() };
  state.buffer += text;
  const parts = state.buffer.split(/\r?\n\r?\n/);
  state.buffer = final ? "" : parts.pop() || "";
  const blocks = final ? [...parts, state.buffer || text] : parts;
  const packets = blocks.map(block => parseBlock(block, state)).filter(Boolean);
  if (final) sessions.delete(sessionId); else sessions.set(sessionId, state);
  return packets;
}

function parseBlock(block, state) {
  const trimmed = String(block || "").trim();
  if (!trimmed) return null;
  let curEvent = null;
  const dataLines = [];
  for (const line of trimmed.split(/\r?\n/)) {
    if (line.startsWith("event:")) curEvent = line.slice(6).trim();
    if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
  }
  if (!dataLines.length) return null;
  const data = dataLines.join("\n").trim();
  const key = `${curEvent || "message"}:${data}`;
  if (state.seen.has(key)) return null;
  state.seen.add(key);
  try { return { data: JSON.parse(data), event: curEvent }; }
  catch (error) { return { dataNoJSON: data, event: curEvent, error: String(error?.message || error) }; }
}
