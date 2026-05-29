//B"H
const http = require("http");
const net = require("net");
const { spawn } = require("child_process");
const { randomBytes } = require("crypto");
const { storeCookies } = require("./cookieJar.cjs");

const CHATGPT = "https://chatgpt.com";
const DEVTOOLS_UUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

/**
 * Chapter 19: The Chrome Gate Learned Humility.
 *
 * Some DevTools sockets are browser-level and cannot speak Network.getCookies.
 * The Awtsmoos therefore seeks a page target first, opens Chrome only by an
 * explicit control click, and reports redacted status instead of exploding.
 *
 * @param {{targetOrigin:string}} config Runtime relay configuration.
 * @returns {Promise<object>} Redacted status for the control page.
 */
async function openDebugChrome(config) {
  const before = await statusDebugChrome(config);
  if (!before.ok) safeLaunchChrome(config.targetOrigin || CHATGPT);
  const ready = await waitForDebugChrome(config, 12000);
  if (!ready.ok) return ready;
  return saveDebugCookies(config);
}

/** @param {{targetOrigin:string}} config Runtime relay configuration. */
async function statusDebugChrome(config) {
  const target = await findTarget();
  if (!target.ok) return target;
  const cookies = await readCookies(config).catch(error => ({ ok: false, error: error.message, cookies: [] }));
  return summarize(target, cookies.cookies || [], cookies.error || "");
}

/** @param {{targetOrigin:string}} config Runtime relay configuration. */
async function saveDebugCookies(config) {
  const target = await findTarget();
  if (!target.ok) return target;
  const payload = await readCookies(config).catch(error => ({ ok: false, error: error.message, cookies: [] }));
  for (const cookie of payload.cookies || []) storeCookies(`${cookie.name}=${cookie.value}`);
  return summarize(target, payload.cookies || [], payload.error || "");
}

async function waitForDebugChrome(config, ms) {
  const end = Date.now() + ms;
  let last = null;
  while (Date.now() < end) {
    const state = await statusDebugChrome(config);
    if (state.ok) return state;
    last = state;
    await sleep(350);
  }
  return { ok: false, status: "debug_chrome_unavailable", error: last?.error || "Chrome DevTools did not answer." };
}

async function readCookies(config) {
  const target = await findTarget();
  if (!target.ok) throw new Error(target.error);
  const client = await wsClient(target.webSocketDebuggerUrl);
  try {
    return await client.send("Network.getCookies", { urls: [config.targetOrigin || CHATGPT] });
  } catch (networkError) {
    try { return await client.send("Storage.getCookies", {}); }
    catch (storageError) { throw new Error(`${networkError.message}; ${storageError.message}`); }
  } finally {
    client.close();
  }
}

async function findTarget() {
  const checks = [];
  for (const port of candidatePorts()) {
    const pages = await getJson(`http://127.0.0.1:${port}/json/list`).catch(error => (checks.push(`${port}:list:${error.message}`), null));
    const page = Array.isArray(pages) ? pages.find(item => item.webSocketDebuggerUrl && item.type === "page") || pages.find(item => item.webSocketDebuggerUrl) : null;
    if (page) return { ok: true, debugPort: port, kind: "page", webSocketDebuggerUrl: page.webSocketDebuggerUrl, title: page.title || "", url: page.url || "" };
    const version = await getJson(`http://127.0.0.1:${port}/json/version`).catch(error => (checks.push(`${port}:version:${error.message}`), null));
    if (version?.webSocketDebuggerUrl) return { ok: true, debugPort: port, kind: "browser", webSocketDebuggerUrl: version.webSocketDebuggerUrl, browser: version.Browser || version.browser || "Chrome" };
  }
  return { ok: false, status: "debug_chrome_unavailable", error: checks.at(-1) || "No Chrome DevTools port answered.", checks };
}

function safeLaunchChrome(url) {
  try {
    const profile = process.env.AWTSMOOS_CHROME_PROFILE || `${process.env.USERPROFILE || process.env.HOME || "."}/.awtsmoos-split-debug-chrome`;
    const port = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 9223);
    const args = [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--no-first-run", url];
    const child = spawn(chromePath(), args, { detached: true, stdio: "ignore" });
    child.unref();
    return { ok: true, port };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function candidatePorts() { return [...new Set([process.env.AWTSMOOS_CHROME_DEBUG_PORT, 9223, 9222, 9224].map(Number).filter(Number.isFinite))]; }
function chromePath() { if (process.env.CHROME_PATH) return process.env.CHROME_PATH; if (process.platform === "win32") return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"; if (process.platform === "darwin") return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; return "google-chrome"; }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function wsClient(raw) { return new Promise((resolve, reject) => { const u = new URL(raw), key = randomBytes(16).toString("base64"), socket = net.connect(Number(u.port), u.hostname); let ready = false, buf = Buffer.alloc(0), id = 0, pending = new Map(); socket.on("connect", () => socket.write(`GET ${u.pathname}${u.search} HTTP/1.1\r\nHost: ${u.host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`)); socket.on("data", d => { buf = Buffer.concat([buf, d]); if (!ready) { const n = buf.indexOf("\r\n\r\n"); if (n < 0) return; ready = true; buf = buf.slice(n + 4); resolve({ send: (m, p) => sendWs(socket, pending, ++id, m, p), close: () => socket.end() }); } buf = consumeWs(buf, pending); }); socket.on("error", reject); }); }
function sendWs(socket, pending, id, method, params) { socket.write(wsFrame(JSON.stringify({ id, method, params }))); return new Promise((resolve, reject) => { const t = setTimeout(() => (pending.delete(id), reject(new Error(`Chrome DevTools timed out during ${method}`))), 4500); pending.set(id, { resolve: v => (clearTimeout(t), resolve(v)), reject: e => (clearTimeout(t), reject(e)) }); }); }
function consumeWs(buf, pending) { while (buf.length >= 2) { const len = buf[1] & 127, h = len === 126 ? 4 : len === 127 ? 10 : 2, size = len === 126 ? buf.readUInt16BE(2) : len === 127 ? Number(buf.readBigUInt64BE(2)) : len; if (buf.length < h + size) break; const msg = JSON.parse(buf.slice(h, h + size).toString("utf8")); const p = pending.get(msg.id); if (p) { pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result || {}); } buf = buf.slice(h + size); } return buf; }
function wsFrame(text) { const body = Buffer.from(text), mask = randomBytes(4), head = body.length < 126 ? Buffer.from([129, 128 | body.length]) : Buffer.from([129, 254, body.length >> 8, body.length & 255]), out = Buffer.alloc(body.length); for (let i = 0; i < body.length; i++) out[i] = body[i] ^ mask[i % 4]; return Buffer.concat([head, mask, out]); }
function getJson(url) { return new Promise((resolve, reject) => http.get(url, res => { let data = ""; res.on("data", c => data += c); res.on("end", () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } }); }).on("error", reject)); }
function summarize(target, cookies, cookieError) { const names = cookies.map(c => c.name).filter(Boolean); return { ok: true, status: cookieError ? "debug_chrome_ready_cookie_read_failed" : names.length ? "cookies_saved" : "debug_chrome_ready", debugPort: target.debugPort, targetKind: target.kind, cookieCount: names.length, cookieNames: names.slice(0, 20), cookieError: cookieError || "" }; }

module.exports = { openDebugChrome, statusDebugChrome, saveDebugCookies };
