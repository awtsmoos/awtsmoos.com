// B"H
const http = require("http");
const { TinyWebSocket } = require("../../lib/ws.js");
const { captureCdpEvent } = require("./logs.js");

let pageWs = null;
let pagePort = null;
let nextId = 1;
const callbacks = new Map();

/**
 * B"H
 * Chapter 420: DevTools Chose The Living ChatGPT Tab.
 *
 * A browser may keep toy pages, data URLs, and old sandboxes open. The Awtsmoos
 * does not let the messenger speak to the wrong vessel: ChatGPT pages are now
 * chosen first, ordinary web pages second, and data/about shadows last.
 */
function getJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, res => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => parseJson(resolve, reject, url, chunks));
    });
    req.setTimeout(5000, () => req.destroy(new Error("HTTP timeout for " + url)));
    req.on("error", reject);
  });
}

function parseJson(resolve, reject, url, chunks) {
  const text = Buffer.concat(chunks).toString("utf8");
  try { resolve(JSON.parse(text)); }
  catch { reject(new Error("Bad JSON from " + url + ": " + text.slice(0, 200))); }
}

async function version(port) { return await getJson("http://127.0.0.1:" + port + "/json/version"); }
async function pages(port) { return await getJson("http://127.0.0.1:" + port + "/json"); }
async function newPage(port, url = "about:blank") { return await getJson("http://127.0.0.1:" + port + "/json/new?" + encodeURIComponent(url)); }

function wireSocket(ws) {
  ws.on("message", msg => {
    let data;
    try { data = JSON.parse(msg); } catch { return; }
    if (data.id && callbacks.has(data.id)) return resolveCallback(data);
    if (data.method) captureCdpEvent(data);
  });
  ws.once("close", () => rejectAll("Chrome DevTools socket closed."));
  ws.once("error", err => rejectAll(err?.message || "Chrome DevTools socket error."));
}

function resolveCallback(data) {
  const cb = callbacks.get(data.id);
  callbacks.delete(data.id);
  cb.clear?.();
  data.error ? cb.reject(new Error(JSON.stringify(data.error))) : cb.resolve(data.result);
}

function closeCurrent() {
  try { pageWs?.close?.(true); } catch {}
  pageWs = null;
  pagePort = null;
  rejectAll("Chrome DevTools socket replaced.");
}

function rejectAll(message) {
  for (const cb of callbacks.values()) {
    cb.clear?.();
    cb.reject(new Error(message));
  }
  callbacks.clear();
}

async function connectPageWs(port, webSocketDebuggerUrl, timeoutMs = 7000) {
  const ws = new TinyWebSocket(webSocketDebuggerUrl);
  wireSocket(ws);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      try { ws.close(true); } catch {}
      reject(new Error("DevTools websocket open timeout."));
    }, timeoutMs);
    timer.unref?.();
    ws.once("open", () => { clearTimeout(timer); resolve(); });
    ws.once("error", err => { clearTimeout(timer); reject(err); });
    ws.connect();
  });
  pageWs = ws;
  pagePort = port;
  await enableDomains();
  return pageWs;
}

async function enableDomains() {
  for (const method of ["Runtime.enable", "Page.enable", "DOM.enable", "Log.enable", "Network.enable"]) {
    try { await cdpCall(method, {}, 5000); } catch {}
  }
}

async function ensurePage(port = 9222) {
  port = Number(port || 9222);
  if (pageWs && pageWs.opened && pagePort === port) return pageWs;
  if (pageWs && pagePort !== port) closeCurrent();
  let list = [];
  try { list = await pages(port); }
  catch (e) { throw new Error("Chrome DevTools not reachable on port " + port + ": " + e.message); }
  const candidates = sortPageCandidates(list.filter(p => p.type === "page" && p.webSocketDebuggerUrl));
  for (const page of candidates) {
    try { return await connectPageWs(port, page.webSocketDebuggerUrl); }
    catch { closeCurrent(); }
  }
  const page = await newPage(port, "https://chatgpt.com/");
  if (!page.webSocketDebuggerUrl) throw new Error("No page websocket found.");
  return await connectPageWs(port, page.webSocketDebuggerUrl);
}

function sortPageCandidates(list) {
  return [...list].sort((a, b) => pageScore(b) - pageScore(a));
}

function pageScore(page = {}) {
  const url = String(page.url || "");
  const title = String(page.title || "");
  if (/chatgpt\.com/i.test(url)) return 100;
  if (/chatgpt/i.test(title)) return 90;
  if (/^https?:\/\//i.test(url)) return 40;
  if (/^about:blank/i.test(url)) return 5;
  if (/^data:/i.test(url)) return 1;
  return 10;
}

async function cdpCall(method, params = {}, timeoutMs = 30000) {
  if (!pageWs || !pageWs.opened) throw new Error("Page DevTools socket is not connected.");
  const id = nextId++;
  pageWs.sendJson({ id, method, params });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (callbacks.has(id)) {
        callbacks.delete(id);
        reject(new Error("CDP timeout for " + method));
      }
    }, timeoutMs);
    timer.unref?.();
    callbacks.set(id, { resolve, reject, clear: () => clearTimeout(timer) });
  });
}

async function navigateAndWait(url, timeoutMs = 15000, port = 9222) {
  await ensurePage(port);
  await cdpCall("Page.navigate", { url }, timeoutMs);
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const state = await cdpCall("Runtime.evaluate", { expression: "document.readyState", returnByValue: true }, Math.min(timeoutMs, 5000));
    if (["complete", "interactive"].includes(state.result?.value)) return { ok: true, readyState: state.result.value, durationMs: Date.now() - start };
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  return { ok: false, readyState: "timeout", durationMs: Date.now() - start };
}

module.exports = { version, pages, newPage, ensurePage, cdpCall, navigateAndWait, sortPageCandidates, pageScore };
