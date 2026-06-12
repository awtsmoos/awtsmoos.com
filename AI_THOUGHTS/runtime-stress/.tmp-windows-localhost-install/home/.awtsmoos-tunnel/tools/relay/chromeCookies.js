// B"H
const http = require("http");
const net = require("net");
const { spawn } = require("child_process");
const { randomBytes } = require("crypto");
const { CHATGPT } = require("./settings.js");

/**
 * Chapter 4: Chrome Opened One Eye And Gave The Cookie Names.
 *
 * This module speaks the smallest DevTools tongue needed by the relay: find a
 * debug socket, ask for ChatGPT cookies, and never open secrets beyond that one
 * bounded browser jar.
 *
 * @param {object} settings Relay settings from `relaySettings`.
 * @returns {Promise<string>} Cookie header for ChatGPT/OpenAI domains.
 */
async function cookieHeader(settings) {
  const jar = await cookieJar(settings);
  return (jar.cookies || [])
    .filter(x => /(^|\.)chatgpt\.com$/.test(x.domain || "chatgpt.com") || /(^|\.)openai\.com$/.test(x.domain || ""))
    .map(x => `${x.name}=${x.value}`).join("; ");
}

async function openLogin(settings) {
  const status = await ensureChromeReady(settings, CHATGPT);
  return { ok: status.ok, debugPort: status.debugPort || settings.debugPort, chromeReady: status.ok, error: status.error || null };
}

async function cookieJar(settings) {
  try { return await cdp(settings, "Network.getCookies", { urls: [CHATGPT] }); }
  catch { return await cdp(settings, "Storage.getCookies", {}); }
}

async function cdp(settings, method, params) {
  const version = await ensureChromeReady(settings, CHATGPT);
  if (!version.ok) throw new Error(version.error);
  if (!version.webSocketDebuggerUrl) throw new Error("Chrome debug socket not ready.");
  const client = await wsClient(version.webSocketDebuggerUrl);
  try { return await client.send(method, params); }
  finally { client.close(); }
}

async function ensureChromeReady(settings, url) {
  const existing = await findChromeVersion(settings);
  if (existing.ok) return existing;
  safeOpenChrome(settings, "about:blank");
  const deadline = Date.now() + settings.chromeReadyMs;
  let lastError = null;
  while (Date.now() < deadline) {
    const ready = await findChromeVersion(settings).catch(error => (lastError = error, null));
    if (ready?.ok) return ready;
    await new Promise(resolve => setTimeout(resolve, 350));
  }
  return { ok: false, error: `Chrome DevTools refused candidates ${settings.debugPortCandidates.join(", ")}. Last error: ${lastError?.message || "not ready"}` };
}

async function findChromeVersion(settings) {
  let lastError = null;
  for (const port of settings.debugPortCandidates) {
    const ready = await chromeVersion(port).catch(error => (lastError = error, null));
    if (ready?.ok) return { ...ready, debugPort: port };
  }
  return { ok: false, error: lastError?.message || String(lastError || "Chrome DevTools not found") };
}

function safeOpenChrome(settings, url) {
  try {
    const child = spawn(chromePath(settings), [`--remote-debugging-port=${settings.debugPort}`, `--user-data-dir=${settings.profile}`, "--no-first-run", url], { detached: true, stdio: "ignore" });
    child.on("error", () => {});
    child.on("error", () => {});
    child.unref();
    return true;
  } catch { return false; }
}

function chromePath(settings) {
  if (settings.chromePath) return settings.chromePath;
  if (process.platform === "win32") return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  if (process.platform === "darwin") return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  return "google-chrome";
}

async function chromeVersion(port) {
  return { ok: true, ...JSON.parse(await getText(`http://127.0.0.1:${port}/json/version`)) };
}

function wsClient(raw) { return new Promise((resolve, reject) => { const u = new URL(raw), key = randomBytes(16).toString("base64"), socket = net.connect(Number(u.port), u.hostname); let ready = false, buf = Buffer.alloc(0), id = 0, pending = new Map(); socket.on("connect", () => socket.write(`GET ${u.pathname}${u.search} HTTP/1.1\r\nHost: ${u.host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`)); socket.on("data", d => { buf = Buffer.concat([buf, d]); if (!ready) { const n = buf.indexOf("\r\n\r\n"); if (n < 0) return; ready = true; buf = buf.slice(n + 4); resolve({ send: (m, p) => sendWs(socket, pending, ++id, m, p), close: () => socket.end() }); } buf = consumeWs(buf, pending); }); socket.on("error", reject); }); }
function sendWs(socket, pending, id, method, params) { socket.write(wsFrame(JSON.stringify({ id, method, params }))); return new Promise((resolve, reject) => { const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Chrome DevTools timed out during ${method}`)); }, 3500); pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } }); }); }
function consumeWs(buf, pending) { while (buf.length >= 2) { const len = buf[1] & 127, h = len === 126 ? 4 : len === 127 ? 10 : 2, size = len === 126 ? buf.readUInt16BE(2) : len === 127 ? Number(buf.readBigUInt64BE(2)) : len; if (buf.length < h + size) break; const msg = JSON.parse(buf.slice(h, h + size).toString("utf8")); if (pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result || {}); } buf = buf.slice(h + size); } return buf; }
function wsFrame(text) { const body = Buffer.from(text), mask = randomBytes(4), head = body.length < 126 ? Buffer.from([129, 128 | body.length]) : Buffer.from([129, 254, body.length >> 8, body.length & 255]), out = Buffer.alloc(body.length); for (let i = 0; i < body.length; i++) out[i] = body[i] ^ mask[i % 4]; return Buffer.concat([head, mask, out]); }
function getText(url) { return new Promise((resolve, reject) => http.get(url, r => { let d = ""; r.on("data", c => d += c); r.on("end", () => resolve(d)); }).on("error", reject)); }

module.exports = { cookieHeader, openLogin };
