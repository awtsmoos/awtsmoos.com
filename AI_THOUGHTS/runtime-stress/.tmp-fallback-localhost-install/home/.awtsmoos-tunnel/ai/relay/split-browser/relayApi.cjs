//B"H
const { json, readBody } = require("./http.cjs");
const { cookieHeader, storeCookies } = require("./cookieJar.cjs");
const { assertAllowedOrigin } = require("./originPolicy.cjs");
const streams = new Map();
const WAIT_TIMEOUT_MS = 45000;
const CLEANUP_MS = 1000 * 60 * 8;

/**
 * Chapter 9: The Stream Broke Into Living Shards.
 *
 * The app already knows the extension relay dialect, so this module speaks the
 * same tiny protocol: /fetch starts the river, /body reads/resumes its chunks,
 * and Node keeps walking as the experimental browser. POST bodies and generic
 * configured origins are preserved, not flattened.
 */
async function handleRelayApi(req, res, config) {
  if (req.url === "/fetch") return startFetch(req, res, config);
  if (req.url === "/body") return readStreamBody(req, res);
  json(res, { ok: false, error: "relay_api_not_found" }, 404);
}

async function startFetch(req, res, config) {
  const { url, options = {} } = JSON.parse((await readBody(req)).toString("utf8") || "{}");
  const target = new URL(url, config.targetOrigin);
  assertAllowedOrigin(target, config);
  const method = options.method || "GET";
  const hasBody = !["GET", "HEAD"].includes(method.toUpperCase()) && options.body !== undefined;
  const upstream = await fetch(target, {
    method,
    headers: requestHeaders(options.headers || {}, target.origin),
    body: hasBody ? bodyBuffer(options.body) : undefined,
    redirect: "manual",
    ...(hasBody ? { duplex: "half" } : {})
  });
  storeCookies(upstream.headers.getSetCookie ? upstream.headers.getSetCookie() : upstream.headers.get("set-cookie"));
  const id = `BH_SPLIT_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const stream = { id, chunks: [], done: false, error: null, waiters: [], createdAt: Date.now(), url: target.href, method };
  streams.set(id, stream);
  pump(stream, upstream.body);
  json(res, { status: upstream.status, ok: upstream.ok, headers: [...upstream.headers.entries()], url: upstream.url, redirected: upstream.redirected, streamId: id, id });
}

async function readStreamBody(req, res) {
  const { id, bodyAction, cursor = 0 } = JSON.parse((await readBody(req)).toString("utf8") || "{}");
  const stream = streams.get(id);
  if (!stream) throw new Error("Response not found.");
  if (bodyAction === "read") return json(res, { result: await chunkAt(stream, Number(cursor)) });
  if (bodyAction === "resume") return json(res, { result: resumeFrom(stream, Number(cursor)) });
  if (["text", "json", "blob"].includes(bodyAction)) return json(res, { result: await whole(stream, bodyAction) });
  throw new Error("Unknown body action: " + bodyAction);
}

function requestHeaders(headers, origin) {
  const clean = { accept: "application/json, text/event-stream, */*", referer: origin + "/", origin };
  for (const [key, value] of Object.entries(headers || {})) if (!/^(host|cookie|content-length)$/i.test(key)) clean[key] = value;
  const cookie = cookieHeader();
  if (cookie) clean.cookie = cookie;
  return clean;
}

function bodyBuffer(body) {
  if (Buffer.isBuffer(body)) return body;
  if (body?.type === "base64") return Buffer.from(body.data || "", "base64");
  return Buffer.from(String(body));
}

async function pump(stream, body) {
  try {
    if (body) for await (const chunk of body) {
      stream.chunks.push(Buffer.from(chunk));
      wake(stream);
    }
  } catch (error) {
    stream.error = error;
  } finally {
    stream.done = true;
    wake(stream);
    setTimeout(() => streams.delete(stream.id), CLEANUP_MS);
  }
}

async function chunkAt(stream, cursor) {
  if (!stream.chunks[cursor] && !stream.done) await wait(stream);
  if (stream.error) throw stream.error;
  const chunk = stream.chunks[cursor];
  return chunk ? { chunk: dataUrl(chunk), index: cursor, done: false } : { chunk: null, index: cursor, done: true };
}

function resumeFrom(stream, cursor) {
  return { chunks: stream.chunks.slice(cursor).map((chunk, i) => ({ index: cursor + i, chunk: dataUrl(chunk) })), done: stream.done, error: stream.error?.stack || null };
}

async function whole(stream, action) {
  while (!stream.done && !stream.error) await wait(stream);
  if (stream.error) throw stream.error;
  const bytes = Buffer.concat(stream.chunks);
  const text = bytes.toString("utf8");
  return action === "json" ? JSON.parse(text) : action === "blob" ? dataUrl(bytes) : text;
}

function wait(stream) {
  if (stream.done || stream.error) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for relay stream ${stream.id}`)), WAIT_TIMEOUT_MS);
    stream.waiters.push(() => { clearTimeout(timer); resolve(); });
  });
}

function wake(stream) { stream.waiters.splice(0).forEach(fn => fn()); }
function dataUrl(buf) { return `data:application/octet-stream;base64,${Buffer.from(buf).toString("base64")}`; }
module.exports = { handleRelayApi };
