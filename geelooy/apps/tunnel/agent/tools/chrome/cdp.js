// B"H
const http = require("http");
const { TinyWebSocket } = require("../../lib/ws.js");
const { captureCdpEvent } = require("./logs.js");
let pageWs = null, pagePort = null, nextId = 1;
const callbacks = new Map();
function maxTimeout() { const n = Number(process.env.AWTSMOOS_CDP_MAX_TIMEOUT_MS || 24 * 60 * 60 * 1000); return Number.isFinite(n) ? Math.max(10000, Math.min(n, 7 * 24 * 60 * 60 * 1000)) : 24 * 60 * 60 * 1000; }
function timeoutOf(value, fallback) { const n = Number(value || fallback); return Number.isFinite(n) ? Math.max(1000, Math.min(Math.floor(n), maxTimeout())) : fallback; }
function getJson(url, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, res => { const chunks = []; res.on("data", c => chunks.push(c)); res.on("end", () => parseJson(resolve, reject, url, chunks)); });
    req.setTimeout(timeoutOf(timeoutMs, 30000), () => req.destroy(new Error("HTTP timeout for " + url)));
    req.on("error", reject);
  });
}
function parseJson(resolve, reject, url, chunks) { const text = Buffer.concat(chunks).toString("utf8"); try { resolve(JSON.parse(text)); } catch { reject(new Error("Bad JSON from " + url + ": " + text.slice(0, 200))); } }
async function version(port) { return await getJson("http://127.0.0.1:" + port + "/json/version"); }
async function pages(port) { return await getJson("http://127.0.0.1:" + port + "/json"); }
async function newPage(port, url = "about:blank") { return await getJson("http://127.0.0.1:" + port + "/json/new?" + encodeURIComponent(url)); }
function wireSocket(ws) { ws.on("message", msg => { let data; try { data = JSON.parse(msg); } catch { return; } if (data.id && callbacks.has(data.id)) return resolveCallback(data); if (data.method) captureCdpEvent(data); }); ws.once("close", () => rejectAll("Chrome DevTools socket closed.")); ws.once("error", err => rejectAll(err?.message || "Chrome DevTools socket error.")); }
function resolveCallback(data) { const cb = callbacks.get(data.id); callbacks.delete(data.id); cb.clear?.(); data.error ? cb.reject(new Error(JSON.stringify(data.error))) : cb.resolve(data.result); }
function closeCurrent() { try { pageWs?.close?.(true); } catch {} pageWs = null; pagePort = null; rejectAll("Chrome DevTools socket replaced."); }
function rejectAll(message) { for (const cb of callbacks.values()) { cb.clear?.(); cb.reject(new Error(message)); } callbacks.clear(); }
async function connectPageWs(port, webSocketDebuggerUrl, timeoutMs = 30000) {
  const ws = new TinyWebSocket(webSocketDebuggerUrl); wireSocket(ws);
  await new Promise((resolve, reject) => { const timer = setTimeout(() => { try { ws.close(true); } catch {} reject(new Error("DevTools websocket open timeout.")); }, timeoutOf(timeoutMs, 30000)); timer.unref?.(); ws.once("open", () => { clearTimeout(timer); resolve(); }); ws.once("error", err => { clearTimeout(timer); reject(err); }); ws.connect(); });
  pageWs = ws; pagePort = port; await enableDomains(); return pageWs;
}
async function enableDomains() { for (const method of ["Runtime.enable", "Page.enable", "DOM.enable", "Log.enable", "Network.enable"]) try { await cdpCall(method, {}, 15000); } catch {} }
async function ensurePage(port = 9222) {
  port = Number(port || 9222); if (pageWs && pageWs.opened && pagePort === port) return pageWs; if (pageWs && pagePort !== port) closeCurrent();
  let list = []; try { list = await pages(port); } catch (e) { throw new Error("Chrome DevTools not reachable on port " + port + ": " + e.message); }
  const candidates = sortPageCandidates(list.filter(p => p.type === "page" && p.webSocketDebuggerUrl));
  for (const page of candidates) { try { return await connectPageWs(port, page.webSocketDebuggerUrl); } catch { closeCurrent(); } }
  const page = await newPage(port, "about:blank"); if (!page.webSocketDebuggerUrl) throw new Error("No page websocket found."); return await connectPageWs(port, page.webSocketDebuggerUrl);
}
function sortPageCandidates(list) { return [...list].sort((a, b) => pageScore(b) - pageScore(a)); }
function pageScore(page = {}) { const url = String(page.url || ""), title = String(page.title || ""); if (/chatgpt\.com/i.test(url)) return 100; if (/chatgpt/i.test(title)) return 90; if (/^https?:\/\//i.test(url)) return 40; if (/^about:blank/i.test(url)) return 5; if (/^data:/i.test(url)) return 1; return 10; }
async function cdpCall(method, params = {}, timeoutMs = 30000) {
  if (!pageWs || !pageWs.opened) throw new Error("Page DevTools socket is not connected.");
  const id = nextId++; pageWs.sendJson({ id, method, params });
  return new Promise((resolve, reject) => { const limit = timeoutOf(timeoutMs, 30000); const timer = setTimeout(() => { if (callbacks.has(id)) { callbacks.delete(id); reject(new Error("CDP timeout for " + method + " after " + limit + "ms")); } }, limit); timer.unref?.(); callbacks.set(id, { resolve, reject, clear:() => clearTimeout(timer) }); });
}
async function navigateAndWait(url, timeoutMs = 30000, port = 9222) {
  const limit = timeoutOf(timeoutMs, 30000); await ensurePage(port);
  try { await cdpCall("Page.navigate", { url }, limit); } catch (e) { return { ok:false, readyState:"navigate_error", error:e.message, durationMs:0 }; }
  const start = Date.now(); while (Date.now() - start < limit) { try { const state = await cdpCall("Runtime.evaluate", { expression:"document.readyState", returnByValue:true }, Math.min(limit, 15000)); if (["complete", "interactive"].includes(state.result?.value)) return { ok:true, readyState:state.result.value, durationMs:Date.now() - start }; } catch (e) { return { ok:false, readyState:"eval_error", error:e.message, durationMs:Date.now() - start }; } await new Promise(resolve => setTimeout(resolve, 250)); }
  return { ok:false, readyState:"timeout", durationMs:Date.now() - start, timeoutMs:limit };
}
module.exports = { version, pages, newPage, ensurePage, cdpCall, navigateAndWait, sortPageCandidates, pageScore, timeoutOf };
