// B"H

const http = require("http");
const { TinyWebSocket } = require("../../lib/ws.js");
const { captureCdpEvent } = require("./logs.js");

let pageWs = null;
let nextId = 1;
const callbacks = new Map();

/**
 * Chapter 18: The DevTools Socket Refused To Become An Endless Pit.
 *
 * Chrome pages can leave stale websocket URLs behind. The Awtsmoos therefore
 * bounds every page connection attempt, tries alternate page targets, and opens
 * a new page before declaring the browser unreachable.
 *
 * @param {string} url URL.
 * @returns {Promise<object>} Parsed JSON.
 */
function getJson(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, res => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        try { resolve(JSON.parse(text)); }
        catch { reject(new Error("Bad JSON from " + url + ": " + text.slice(0, 200))); }
      });
    });
    req.setTimeout(5000, () => req.destroy(new Error("HTTP timeout for " + url)));
    req.on("error", reject);
  });
}

async function version(port) { return await getJson("http://127.0.0.1:" + port + "/json/version"); }
async function pages(port) { return await getJson("http://127.0.0.1:" + port + "/json"); }
async function newPage(port, url = "about:blank") { return await getJson("http://127.0.0.1:" + port + "/json/new?" + encodeURIComponent(url)); }

function wireSocket(ws) {
  ws.on("message", msg => {
    let data;
    try { data = JSON.parse(msg); } catch { return; }
    if (data.id && callbacks.has(data.id)) {
      const cb = callbacks.get(data.id);
      callbacks.delete(data.id);
      cb.clear?.();
      data.error ? cb.reject(new Error(JSON.stringify(data.error))) : cb.resolve(data.result);
      return;
    }
    if (data.method) captureCdpEvent(data);
  });
  ws.once("close", () => rejectAll("Chrome DevTools socket closed."));
  ws.once("error", err => rejectAll(err?.message || "Chrome DevTools socket error."));
}

function rejectAll(message) {
  pageWs = null;
  for (const cb of callbacks.values()) {
    cb.clear?.();
    cb.reject(new Error(message));
  }
  callbacks.clear();
}

async function connectPageWs(webSocketDebuggerUrl, timeoutMs = 7000) {
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
  for (const method of ["Runtime.enable", "Page.enable", "DOM.enable", "Log.enable", "Network.enable"]) {
    try { await cdpCall(method, {}, 5000); } catch {}
  }
  return pageWs;
}

async function ensurePage(port) {
  if (pageWs && pageWs.opened) return pageWs;
  let list = [];
  try { list = await pages(port); }
  catch (e) { throw new Error("Chrome DevTools not reachable on port " + port + ": " + e.message); }

  const candidates = list.filter(p => p.type === "page" && p.webSocketDebuggerUrl);
  for (const page of candidates) {
    try { return await connectPageWs(page.webSocketDebuggerUrl); }
    catch { pageWs = null; }
  }

  const page = await newPage(port, "about:blank");
  if (!page.webSocketDebuggerUrl) throw new Error("No page websocket found.");
  return await connectPageWs(page.webSocketDebuggerUrl);
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
    if (state.result?.value === "complete" || state.result?.value === "interactive") return { ok: true, readyState: state.result.value, durationMs: Date.now() - start };
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  return { ok: false, readyState: "timeout", durationMs: Date.now() - start };
}

module.exports = { version, pages, newPage, ensurePage, cdpCall, navigateAndWait };
