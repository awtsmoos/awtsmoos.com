//B"H
const { json, readBody } = require("./http.cjs");
const { cookieHeader, storeCookies } = require("./cookieJar.cjs");
const streams = new Map();

/**
 * Chapter 9: The Stream Broke Into Living Shards.
 *
 * The app already knows the old relay dialect, so this module speaks the same
 * tiny protocol: /fetch starts the river, /body reads its chunks, and Node keeps
 * walking as the experimental client.
 *
 * @param {import('http').IncomingMessage} req Local request.
 * @param {import('http').ServerResponse} res Local response.
 * @param {{targetOrigin:string}} config Runtime config.
 * @returns {Promise<void>}
 */
async function handleRelayApi(req, res, config) {
  if (req.url === "/fetch") return startFetch(req, res, config);
  if (req.url === "/body") return readStreamBody(req, res);
  json(res, { ok: false, error: "relay_api_not_found" }, 404);
}

async function startFetch(req, res, config) {
  const { url, options = {} } = JSON.parse((await readBody(req)).toString("utf8") || "{}");
  const target = new URL(url);
  if (target.origin !== config.targetOrigin) throw new Error("Only configured target origin is allowed.");
  const upstream = await fetch(target, {
    method: options.method || "GET",
    headers: requestHeaders(options.headers || {}, config.targetOrigin),
    body: options.body,
    redirect: "manual"
  });
  storeCookies(upstream.headers.getSetCookie ? upstream.headers.getSetCookie() : upstream.headers.get("set-cookie"));
  const id = `BH_SPLIT_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const stream = { chunks: [], done: false, error: null, waiters: [] };
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

async function pump(stream, body) {
  try { if (body) for await (const chunk of body) { stream.chunks.push(Buffer.from(chunk)); wake(stream); } }
  catch (error) { stream.error = error; }
  finally { stream.done = true; wake(stream); }
}

async function chunkAt(stream, cursor) {
  if (!stream.chunks[cursor] && !stream.done) await new Promise(resolve => stream.waiters.push(resolve));
  if (stream.error) throw stream.error;
  const chunk = stream.chunks[cursor];
  return chunk ? { chunk: dataUrl(chunk), index: cursor, done: false } : { chunk: null, index: cursor, done: true };
}

function resumeFrom(stream, cursor) {
  return { chunks: stream.chunks.slice(cursor).map((chunk, i) => ({ index: cursor + i, chunk: dataUrl(chunk) })), done: stream.done, error: stream.error?.stack || null };
}

async function whole(stream, action) {
  while (!stream.done && !stream.error) await new Promise(resolve => stream.waiters.push(resolve));
  if (stream.error) throw stream.error;
  const text = Buffer.concat(stream.chunks).toString("utf8");
  return action === "json" ? JSON.parse(text) : action === "blob" ? dataUrl(Buffer.from(text)) : text;
}

function wake(stream) { stream.waiters.splice(0).forEach(fn => fn()); }
function dataUrl(buf) { return `data:application/octet-stream;base64,${Buffer.from(buf).toString("base64")}`; }
module.exports = { handleRelayApi };
