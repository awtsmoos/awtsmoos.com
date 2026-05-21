//B"H

let worker = null;
let seq = 0;
const pending = new Map();
const fallback = new Map();

/**
 * Chapter 38: If the Worker Fell, the Small Lamp Still Parsed.
 *
 * Worker parsing is preferred. If Chrome blocks the worker, a tiny fallback SSE
 * parser preserves realtime streaming rather than freezing the vessel.
 */
export async function parseStreamChunk(sessionId, text, final = false) {
  if (!worker) worker = makeWorker();
  if (!worker) return fallbackParse(sessionId, text, final);
  const id = ++seq;
  return new Promise(resolve => {
    pending.set(id, resolve);
    worker.postMessage({ id, kind: "sseChunk", sessionId, text, final });
  });
}

function makeWorker() {
  try {
    const w = new Worker(new URL("../../render/worker/renderWorker.js", import.meta.url), { type: "module" });
    w.onmessage = event => { const { id, packets } = event.data || {}; pending.get(id)?.(packets || []); pending.delete(id); };
    w.onerror = () => { worker = null; for (const resolve of pending.values()) resolve([]); pending.clear(); };
    return w;
  } catch { return null; }
}

function fallbackParse(sessionId, text = "", final = false) {
  const state = fallback.get(sessionId) || { buffer: "", seen: new Set() };
  state.buffer += text;
  const parts = state.buffer.split(/\r?\n\r?\n/);
  state.buffer = final ? "" : parts.pop() || "";
  const packets = parts.map(block => parseBlock(block, state)).filter(Boolean);
  if (final) fallback.delete(sessionId); else fallback.set(sessionId, state);
  return packets;
}

function parseBlock(block, state) {
  let curEvent = null;
  const lines = [];
  for (const line of String(block || "").trim().split(/\r?\n/)) {
    if (line.startsWith("event:")) curEvent = line.slice(6).trim();
    if (line.startsWith("data:")) lines.push(line.slice(5).trimStart());
  }
  const data = lines.join("\n").trim();
  if (!data || state.seen.has(`${curEvent}:${data}`)) return null;
  state.seen.add(`${curEvent}:${data}`);
  try { return { data: JSON.parse(data), event: curEvent }; }
  catch (error) { return { dataNoJSON: data, event: curEvent, error: String(error?.message || error) }; }
}
