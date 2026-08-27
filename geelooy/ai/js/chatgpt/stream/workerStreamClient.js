//B"H

let worker = null;
let seq = 0;
const pending = new Map();
const fallback = new Map();
const ASK_TIMEOUT = 12000;
const MAX_PENDING = 120;

/**
 * Chapter 91: The Main Thread Received Only Sparks.
 *
 * Worker replies prefer compact deltas. Raw packets exist only as a fallback for
 * older tests or worker failure. The main page should route text/event sparks,
 * not nested provider mountains.
 */
export async function parseStreamChunk(sessionId, text, final = false) {
  const reply = await askWorker({ kind: "sseChunk", sessionId, text, final }, () => ({ packets: fallbackParse(sessionId, text, final), deltas: [] }));
  return reply.packets || [];
}

export async function parseStreamDeltas(sessionId, text, final = false) {
  const reply = await askWorker({ kind: "sseChunk", sessionId, text, final }, () => ({ packets: fallbackParse(sessionId, text, final), deltas: [] }));
  return reply.deltas?.length ? reply.deltas : packetsToFallbackDeltas(reply.packets || []);
}

export async function parseStreamDataUrlDeltas(sessionId, url, final = false) {
  const reply = await askWorker({ kind: "sseDataUrl", sessionId, url, final }, async () => ({ packets: fallbackParse(sessionId, await dataUrlText(url), final), deltas: [] }));
  return reply.deltas?.length ? reply.deltas : packetsToFallbackDeltas(reply.packets || []);
}

function askWorker(message, fallbackFn) {
  if (pending.size > MAX_PENDING) resetWorker("too many pending stream parses");
  if (!worker) worker = makeWorker();
  if (!worker) return Promise.resolve(fallbackFn());
  const id = ++seq;
  return new Promise(resolve => {
    const timer = setTimeout(() => {
      pending.delete(id);
      resolve(fallbackFn());
    }, ASK_TIMEOUT);
    pending.set(id, payload => {
      clearTimeout(timer);
      resolve(payload || {});
    });
    try { worker.postMessage({ id, ...message }); }
    catch {
      clearTimeout(timer);
      pending.delete(id);
      resetWorker("postMessage failed");
      resolve(fallbackFn());
    }
  });
}

function makeWorker() {
  try {
    const w = new Worker(new URL("../../render/worker/renderWorker.js", import.meta.url), { type: "module" });
    w.onmessage = event => {
      const { id, packets, deltas } = event.data || {};
      pending.get(id)?.({ packets: packets || [], deltas: deltas || [] });
      pending.delete(id);
    };
    w.onerror = () => resetWorker("stream worker error");
    return w;
  } catch { return null; }
}

function resetWorker(reason = "") {
  try { worker?.terminate?.(); } catch {}
  worker = null;
  for (const resolve of pending.values()) resolve({ packets: [], deltas: [{ kind: "event", event: { kind: "status", label: "Worker reset", text: reason, raw: null } }] });
  pending.clear();
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
  const lines = String(block || "").trim().split(/\r?\n/);
  const data = lines.filter(line => line.startsWith("data:")).map(line => line.slice(5).trimStart()).join("\n").trim();
  const event = lines.find(line => line.startsWith("event:"))?.slice(6).trim() || null;
  if (!data || state.seen.has(`${event}:${data}`)) return null;
  state.seen.add(`${event}:${data}`);
  try { return { data: JSON.parse(data), event }; }
  catch (error) { return { dataNoJSON: data, event, error: String(error?.message || error) }; }
}

function packetsToFallbackDeltas(packets) {
  return packets.map(packet => packet?.dataNoJSON === "[DONE]" ? { kind: "done" } : null).filter(Boolean);
}

async function dataUrlText(url) {
  const blob = await (await fetch(url)).blob();
  return new TextDecoder("utf-8").decode(await blob.arrayBuffer());
}
