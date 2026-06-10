// B"H
const { STREAM_TTL_MS } = require("./settings.js");

const streams = new Map();

/**
 * Chapter 2: The River Remembered Every Drop.
 *
 * The relay stream store keeps fetch bodies alive after the first response. A
 * cursor may return, resume, drink text, parse JSON, or wait without pretending
 * the river ended before its final wave arrived.
 *
 * @param {Response} response Fetch response with optional body stream.
 * @returns {object} Metadata containing id, headers, and status.
 */
function rememberResponse(response) {
  sweepStreams();
  const id = `BH_TUNNEL_RELAY_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const stream = { id, chunks: [], done: false, error: null, waiters: [], createdAt: Date.now(), lastReadAt: Date.now() };
  streams.set(id, stream);
  pump(stream, response.body);
  return { status: response.status, ok: response.ok, headers: Array.from(response.headers.entries()), url: response.url, redirected: response.redirected, streamId: id, id };
}

async function readRelayBody({ id, bodyAction, cursor = 0 }) {
  const stream = streams.get(id);
  if (!stream) throw new Error("Response not found or already consumed.");
  stream.lastReadAt = Date.now();
  if (bodyAction === "read") return await chunkAt(stream, Number(cursor));
  if (bodyAction === "resume") return resumeFrom(stream, Number(cursor));
  if (["text", "json", "blob"].includes(bodyAction)) return await whole(stream, bodyAction);
  throw new Error("Unknown body action: " + bodyAction);
}

async function pump(stream, body) {
  try {
    if (!body) return void (stream.done = true, wake(stream));
    for await (const chunk of body) { stream.chunks.push(Buffer.from(chunk)); wake(stream); }
    stream.done = true;
  } catch (error) { stream.error = error; stream.done = true; }
  finally { wake(stream); }
}

async function chunkAt(stream, cursor) {
  const ready = await waitFor(stream, cursor, 45000);
  if (ready === "pending") return { pending: true, retryAfter: 700 };
  if (stream.error) throw stream.error;
  const chunk = stream.chunks[cursor];
  if (!chunk) return { chunk: null, index: cursor, done: true };
  return { chunk: dataUrl(chunk), index: cursor, done: false };
}

function resumeFrom(stream, cursor) {
  const chunks = [];
  for (let i = cursor; i < stream.chunks.length; i++) chunks.push({ index: i, chunk: dataUrl(stream.chunks[i]) });
  return { chunks, done: stream.done, error: stream.error?.stack || null };
}

async function whole(stream, action) {
  while (!stream.done && !stream.error) await new Promise(resolve => stream.waiters.push(resolve));
  if (stream.error) throw stream.error;
  const text = Buffer.concat(stream.chunks).toString("utf8");
  if (action === "json") return JSON.parse(text);
  if (action === "blob") return dataUrl(Buffer.from(text));
  return text;
}

function waitFor(stream, cursor, ms) {
  if (stream.chunks[cursor] || stream.done || stream.error) return Promise.resolve("ready");
  return new Promise(resolve => {
    const timer = setTimeout(() => cleanup("pending"), ms);
    const waiter = () => cleanup("ready");
    function cleanup(value) { clearTimeout(timer); stream.waiters = stream.waiters.filter(w => w !== waiter); resolve(value); }
    stream.waiters.push(waiter);
  });
}

function sweepStreams() { const now = Date.now(); for (const [id, s] of streams) if (s.done && now - s.lastReadAt > STREAM_TTL_MS) streams.delete(id); }
function wake(stream) { stream.waiters.splice(0).forEach(fn => fn()); }
function dataUrl(buf) { return `data:application/octet-stream;base64,${Buffer.from(buf).toString("base64")}`; }

module.exports = { rememberResponse, readRelayBody, streams };
