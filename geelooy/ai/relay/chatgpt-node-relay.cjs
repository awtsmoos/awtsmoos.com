#!/usr/bin/env node
//B"H
const http = require("http");
const net = require("net");
const { spawn } = require("child_process");
const { randomBytes } = require("crypto");

const PORT = Number(process.env.AWTSMOOS_CHATGPT_RELAY_PORT || 38487);
const DEBUG_PORT = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
const DEBUG_PORT_CANDIDATES = uniqueNumbers([process.env.AWTSMOOS_CHROME_DEBUG_PORT, 9223, 9222, 9224, 9225]);
const PROFILE = process.env.AWTSMOOS_CHROME_PROFILE || `${process.env.USERPROFILE || process.env.HOME || "."}/.awtsmoos-chatgpt-relay-chrome`;
const VERBOSE = process.env.AWTSMOOS_RELAY_VERBOSE !== "0";
const CHATGPT = "https://chatgpt.com";
const STREAM_TTL_MS = 30 * 60 * 1000;
const CHROME_READY_MS = Number(process.env.AWTSMOOS_CHROME_READY_MS || 12000);
const streams = new Map();
let chromeLaunchPromise = null;

process.on("unhandledRejection", error => {
  console.error("B\"H Node relay caught an unhandled promise:", error?.stack || error);
});

process.on("uncaughtException", error => {
  console.error("B\"H Node relay caught an uncaught exception:", error?.stack || error);
});

/**
 * Chapter 69: The Relay Waited Without Lying.
 *
 * The extension says `pending` when a chunk has not yet descended. This Node
 * mirror follows that truth: unread chunks are not fake endings, and refresh
 * resume can continue drinking from the same remembered river.
 */
http.createServer(route).listen(PORT, "127.0.0.1", () => {
  console.log(`B\"H Awtsmoos ChatGPT relay listening at http://127.0.0.1:${PORT}`);
  log("startup", { message: "No ChatGPT tab is opened on startup. Existing Chrome DevTools cookies are preferred." });
});

async function route(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return end(res, 204, "");
  try {
    if (req.url === "/health") return json(res, { ok: true, port: PORT, debugPort: DEBUG_PORT, debugPortCandidates: DEBUG_PORT_CANDIDATES, profile: PROFILE });
    if (req.url === "/open-login") return openLogin(res);
    if (req.url === "/fetch" && req.method === "POST") return startFetch(req, res);
    if (req.url === "/body" && req.method === "POST") return readBody(req, res);
    if (req.url === "/cookies") return json(res, { ok: true, cookieBytes: (await cookieHeader()).length });
    json(res, { ok: false, error: "not_found" }, 404);
  } catch (error) {
    log("route:error", { url: req.url, error: error.stack || error.message || String(error) });
    json(res, { ok: false, error: error.stack || error.message || String(error) }, 500);
  }
}

async function startFetch(req, res) {
  sweepStreams();
  const { url, options = {} } = await readJson(req);
  const target = new URL(url);
  log("fetch:received", { url: target.href, method: options.method || "GET", headerNames: Object.keys(options.headers || {}) });
  log("fetch:received", { url: target.href, method: options.method || "GET", headerNames: Object.keys(options.headers || {}) });
  if (target.origin !== CHATGPT) throw new Error("Only chatgpt.com requests are allowed.");
  const id = `BH_NODE_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const headers = browserHeaders(cleanHeaders(options.headers || {}));
  headers.cookie = await cookieHeader();
  log("fetch:start", { url: target.href, method: options.method || "GET", hasCookie: Boolean(headers.cookie), cookieBytes: headers.cookie.length, hasBearer: Boolean(headers.authorization) });
  const response = await fetch(target, { method: options.method || "GET", headers, body: options.body, cache: "no-store" });
  log("fetch:response", { url: response.url, status: response.status, ok: response.ok, contentType: response.headers.get("content-type") });
  const stream = { id, chunks: [], done: false, error: null, waiters: [], createdAt: Date.now(), lastReadAt: Date.now() };
  streams.set(id, stream);
  pump(stream, response.body);
  json(res, { status: response.status, ok: response.ok, headers: Array.from(response.headers.entries()), url: response.url, redirected: response.redirected, streamId: id, id });
}

async function readBody(req, res) {
  const { id, bodyAction, cursor = 0 } = await readJson(req);
  log("body:received", { id, bodyAction, cursor });
  log("body:received", { id, bodyAction, cursor });
  const stream = streams.get(id);
  if (!stream) throw new Error("Response not found or already consumed.");
  stream.lastReadAt = Date.now();
  if (bodyAction === "read") return json(res, { result: await chunkAt(stream, Number(cursor)) });
  if (bodyAction === "resume") return json(res, { result: await resumeFrom(stream, Number(cursor)) });
  if (["text", "json", "blob"].includes(bodyAction)) return json(res, { result: await whole(stream, bodyAction) });
  throw new Error("Unknown body action: " + bodyAction);
}

async function pump(stream, body) {
  try {
    if (!body) return void (stream.done = true, wake(stream));
    for await (const chunk of body) { stream.chunks.push(Buffer.from(chunk)); wake(stream); }
    stream.done = true;
  } catch (error) {
    stream.error = error; stream.done = true;
  } finally { wake(stream); }
}

async function chunkAt(stream, cursor) {
  const ready = await waitFor(stream, cursor, 45000);
  if (ready === "pending") return { pending: true, retryAfter: 700 };
  if (stream.error) throw stream.error;
  const chunk = stream.chunks[cursor];
  if (!chunk) return { chunk: null, index: cursor, done: true };
  return { chunk: dataUrl(chunk), index: cursor, done: false };
}

async function resumeFrom(stream, cursor) {
  const chunks = [];
  for (let i = cursor; i < stream.chunks.length; i++) chunks.push({ index: i, chunk: dataUrl(stream.chunks[i]) });
  return { chunks, done: stream.done, error: stream.error?.stack || null };
}

async function whole(stream, action) {
  while (!stream.done && !stream.error) await new Promise(resolve => stream.waiters.push(resolve));
  if (stream.error) throw stream.error;
  const bytes = Buffer.concat(stream.chunks);
  const text = bytes.toString("utf8");
  if (action === "json") return JSON.parse(text);
  if (action === "blob") return dataUrl(bytes);
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

async function openLogin(res) {
  const status = await ensureChromeReady(CHATGPT);
  json(res, { ok: status.ok, debugPort: DEBUG_PORT, chromeReady: status.ok, error: status.error || null });
}

function safeOpenChrome(url) {
  try {
    const child = spawn(chromePath(), [`--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${PROFILE}`, "--no-first-run", url], { detached: true, stdio: "ignore" });
    child.unref();
    return true;
  } catch (e) {
    console.error("B\"H Chrome launch failed:", e.message);
    return false;
  }
}

function chromePath() { return process.env.CHROME_PATH || (process.platform === "win32" ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" : process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "google-chrome"); }
async function cookieHeader() {
  const c = await cookieJar();
  const cookies = (c.cookies || []).filter(x => /(^|\.)chatgpt\.com$/.test(x.domain || "chatgpt.com") || /(^|\.)openai\.com$/.test(x.domain || ""));
  const header = cookies.map(x => `${x.name}=${x.value}`).join("; ");
  log("cookies", { count: cookies.length, bytes: header.length, names: cookies.slice(0, 12).map(x => x.name) });
  return header;
}

async function cookieJar() {
  try { return await cdp("Network.getCookies", { urls: [CHATGPT] }); }
  catch (networkError) {
    log("cookies:fallback", { from: "Network.getCookies", error: networkError.message });
    return await cdp("Storage.getCookies", {});
  }
}

async function cdp(method, params) {
  const version = await ensureChromeReady(CHATGPT);
  if (!version.ok) throw new Error(version.error);
  const ws = version.webSocketDebuggerUrl;
  if (!ws) throw new Error("Chrome debug socket not ready on port " + (version.debugPort || DEBUG_PORT));
  const client = await wsClient(ws);
  try { return await client.send(method, params); } finally { client.close(); }
}

async function ensureChromeReady(url) {
  const existing = await findChromeVersion();
  if (existing.ok) return existing;
  if (!chromeLaunchPromise) chromeLaunchPromise = waitForChrome(url);
  const launched = await chromeLaunchPromise;
  if (!launched.ok) chromeLaunchPromise = null;
  return launched;
}

async function waitForChrome(url) {
  safeOpenChrome("about:blank");
  const deadline = Date.now() + CHROME_READY_MS;
  let lastError = null;
  while (Date.now() < deadline) {
    const ready = await findChromeVersion().catch(error => (lastError = error, null));
    if (ready?.ok) return ready;
    await sleep(350);
  }
  return { ok: false, error: `Chrome DevTools refused candidates ${DEBUG_PORT_CANDIDATES.join(", ")}. The relay needs a Chrome profile that already has ChatGPT cookies. Last error: ${lastError?.message || lastError || "not ready"}` };
}

async function findChromeVersion() {
  let lastError = null;
  for (const port of DEBUG_PORT_CANDIDATES) {
    const ready = await chromeVersion(port).catch(error => (lastError = error, null));
    if (ready?.ok) {
      log("chrome:debug", { port, browser: ready.Browser || ready.browser || "unknown" });
      return { ...ready, debugPort: port };
    }
  }
  return { ok: false, error: lastError?.message || String(lastError || "Chrome DevTools not found") };
}

async function chromeVersion(port = DEBUG_PORT) {
  const version = JSON.parse(await getText(`http://127.0.0.1:${port}/json/version`));
  return { ok: true, ...version };
}
function wsClient(raw) { return new Promise((resolve, reject) => { const u = new URL(raw), key = randomBytes(16).toString("base64"), socket = net.connect(Number(u.port), u.hostname); let ready = false, buf = Buffer.alloc(0), id = 0, pending = new Map(); socket.on("connect", () => socket.write(`GET ${u.pathname}${u.search} HTTP/1.1\r\nHost: ${u.host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`)); socket.on("data", d => { buf = Buffer.concat([buf, d]); if (!ready) { const n = buf.indexOf("\r\n\r\n"); if (n < 0) return; ready = true; buf = buf.slice(n + 4); resolve({ send: (m, p) => sendWs(socket, pending, ++id, m, p), close: () => socket.end() }); } buf = consumeWs(buf, pending); }); socket.on("error", reject); }); }
function sendWs(socket, pending, id, method, params) { socket.write(wsFrame(JSON.stringify({ id, method, params }))); return new Promise((resolve, reject) => pending.set(id, { resolve, reject })); }
function consumeWs(buf, pending) { while (buf.length >= 2) { const len = buf[1] & 127, h = len === 126 ? 4 : len === 127 ? 10 : 2, size = len === 126 ? buf.readUInt16BE(2) : len === 127 ? Number(buf.readBigUInt64BE(2)) : len; if (buf.length < h + size) break; const msg = JSON.parse(buf.slice(h, h + size).toString("utf8")); if (pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result || {}); } buf = buf.slice(h + size); } return buf; }
function wsFrame(text) { const body = Buffer.from(text), mask = randomBytes(4), head = body.length < 126 ? Buffer.from([129, 128 | body.length]) : Buffer.from([129, 254, body.length >> 8, body.length & 255]), out = Buffer.alloc(body.length); for (let i = 0; i < body.length; i++) out[i] = body[i] ^ mask[i % 4]; return Buffer.concat([head, mask, out]); }
function cleanHeaders(input) { const h = {}; for (const [k, v] of Object.entries(input || {})) if (!/^(host|origin|cookie|content-length)$/i.test(k)) h[k] = v; return h; }
function browserHeaders(headers) {
  return {
    accept: "application/json, text/event-stream, */*",
    "accept-language": "en-US,en;q=0.9",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
    referer: CHATGPT + "/",
    ...headers
  };
}
function log(label, value) { if (VERBOSE) console.log(`B\"H relay ${label}`, JSON.stringify(value)); }
function uniqueNumbers(values) { return [...new Set(values.map(Number).filter(Number.isFinite))]; }
function sweepStreams() { const now = Date.now(); for (const [id, s] of streams) if (s.done && now - s.lastReadAt > STREAM_TTL_MS) streams.delete(id); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function wake(s) { s.waiters.splice(0).forEach(fn => fn()); }
function dataUrl(buf) { return `data:application/octet-stream;base64,${Buffer.from(buf).toString("base64")}`; }
function getText(url) { return new Promise((resolve, reject) => http.get(url, r => { let d = ""; r.on("data", c => d += c); r.on("end", () => resolve(d)); }).on("error", reject)); }
function readJson(req) { return new Promise((resolve, reject) => { let d = ""; req.on("data", c => d += c); req.on("end", () => { try { resolve(JSON.parse(d || "{}")); } catch (e) { reject(e); } }); }); }
function cors(res) { res.setHeader("Access-Control-Allow-Origin", "*"); res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS"); res.setHeader("Access-Control-Allow-Headers", "content-type,authorization,oai-device-id,oai-language"); }
function json(res, value, status = 200) { res.setHeader("Content-Type", "application/json"); end(res, status, JSON.stringify(value)); }
function end(res, status, text) { res.statusCode = status; res.end(text); }
