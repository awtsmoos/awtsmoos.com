// B"H
const os = require("os");
const http = require("http");
const https = require("https");
const { loadConfig, ROOT, HOME } = require("./lib/config.js");
const { makeLogger } = require("./lib/log.js");
const { startLocalApiServer } = require("./lib/local-api.js");
const { openHostedControl } = require("./lib/open.js");
const { TinyWebSocket } = require("./lib/ws.js");
const { handleFs } = require("./tools/fs/index.js");
const { handleCommand } = require("./tools/command/index.js");
const { handleChrome } = require("./tools/chrome/index.js");
const { handleRelay } = require("./tools/relay/index.js");
const { AGENT_VERSION } = require("./tools/fs/actions.js");
const { compactForSend, jsonBytes, inlineLimit } = require("./lib/response-size.js");
const log = makeLogger(ROOT);
const CPU_COUNT = Math.max(1, os.cpus?.().length || 1);
const MAX_INFLIGHT = boundedNumber(process.env.AWTSMOOS_MAX_INFLIGHT, Math.min(16, Math.max(8, CPU_COUNT * 2)), 1, 64);
const MAX_QUEUE = boundedNumber(process.env.AWTSMOOS_MAX_QUEUE, 1000, 0, 10000);
const REQUEST_MAX_AGE_MS = boundedNumber(process.env.AWTSMOOS_REQUEST_MAX_AGE_MS, 24 * 60 * 60 * 1000, 1000, 7 * 24 * 60 * 60 * 1000);
const MAX_PROXY_BYTES = boundedNumber(process.env.AWTSMOOS_MAX_PROXY_BYTES, 32 * 1024 * 1024, 1024 * 1024, 256 * 1024 * 1024);
let activeWs = null, reconnectTimer = null, reconnecting = false, generation = 0;
const inflight = new Set(), requestQueue = [];
function boundedNumber(value, fallback, min, max) { const n = Number(value || fallback); return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback; }
function safeSend(ws, obj) {
  if (!ws || !ws.opened) return;
  try {
    const packed = compactForSend(ROOT, obj, { limitBytes: inlineLimit() });
    ws.sendJson(packed.envelope);
  } catch (e) {
    const tiny = { type:"TUNNEL_RESPONSE", id:obj?.id, ok:false, status:500, error:"safe_send_failed", message:e.message, originalBytes:jsonBytes(obj) };
    try { ws.sendJson(tiny); } catch {}
  }
}
function memorySnapshot() { const m = process.memoryUsage(); return { rssMB:Math.round(m.rss/1048576), heapUsedMB:Math.round(m.heapUsed/1048576), heapTotalMB:Math.round(m.heapTotal/1048576), externalMB:Math.round(m.external/1048576), inflight:inflight.size, queued:requestQueue.length, maxInflight:MAX_INFLIGHT, maxQueue:MAX_QUEUE, inlineLimitBytes:inlineLimit() }; }
setInterval(() => log("Memory:", JSON.stringify(memorySnapshot())), 60000).unref();
function proxyLocalHttp(config, data, ws) {
  if (!config.enableLocalHttpProxy || !config.tools.httpProxy) return safeSend(ws, { type:"TUNNEL_RESPONSE", id:data.id, ok:false, status:403, error:"Local HTTP proxy disabled." });
  const p = data.payload || {}, target = new URL(p.url || "/", config.local), lib = target.protocol === "https:" ? https : http, body = p.body ? Buffer.from(p.body, "base64") : null;
  const req = lib.request(target, { method:p.method || "GET", headers:{ ...(p.headers || {}), host:target.host } }, res => {
    const chunks = []; let total = 0, aborted = false;
    res.on("data", c => { total += c.length; if (total > MAX_PROXY_BYTES) { aborted = true; req.destroy(); return safeSend(ws, { type:"TUNNEL_RESPONSE", id:data.id, ok:false, status:413, error:"local_proxy_response_too_large", bytes:total, maxBytes:MAX_PROXY_BYTES }); } chunks.push(c); });
    res.on("end", () => { if (!aborted) safeSend(ws, { type:"TUNNEL_RESPONSE", id:data.id, status:res.statusCode, headers:res.headers, body:Buffer.concat(chunks).toString("base64") }); });
  });
  req.on("error", err => safeSend(ws, { type:"TUNNEL_RESPONSE", id:data.id, status:502, headers:{ "content-type":"text/plain" }, body:Buffer.from(err.message).toString("base64") }));
  if (body) req.write(body); req.end();
}
function register(ws) {
  const config = loadConfig();
  ws.sendJson({ type:"TUNNEL_REGISTER", name:config.tunnelName, deviceName:os.hostname(), root:config.root || HOME, allowWrite:config.allowWrite, allowSecrets:config.allowSecrets, allowCommands:config.allowCommands, agentVersion:AGENT_VERSION, tools:config.tools, chrome:config.chrome, command:config.command, limits:{ maxInflight:MAX_INFLIGHT, maxQueue:MAX_QUEUE, requestMaxAgeMs:REQUEST_MAX_AGE_MS, maxProxyBytes:MAX_PROXY_BYTES, inlineLimitBytes:inlineLimit() } });
  log("Tunnel connected:", config.tunnelName, "root:", config.root || HOME);
}
function enqueueRequest(ws, data) {
  if (requestQueue.length >= MAX_QUEUE) return safeSend(ws, { type:"TUNNEL_RESPONSE", id:data.id, ok:false, status:429, error:"agent_queue_full", inflight:inflight.size, queued:requestQueue.length, maxInflight:MAX_INFLIGHT, maxQueue:MAX_QUEUE, guidance:"Retry after queue drains or raise AWTSMOOS_MAX_QUEUE carefully." });
  requestQueue.push({ ws, data, enqueuedAt:Date.now() }); drainQueue();
}
function drainQueue() {
  while (inflight.size < MAX_INFLIGHT && requestQueue.length) {
    const item = requestQueue.shift(); if (!item.ws || !item.ws.opened) continue;
    const ageMs = Date.now() - item.enqueuedAt;
    if (ageMs > REQUEST_MAX_AGE_MS) { safeSend(item.ws, { type:"TUNNEL_RESPONSE", id:item.data.id, ok:false, status:504, error:"agent_queue_timeout", queuedMs:ageMs, maxQueuedMs:REQUEST_MAX_AGE_MS, guidance:"Queue timeout is now long by default; retry or raise AWTSMOOS_REQUEST_MAX_AGE_MS." }); continue; }
    runRequest(item.ws, item.data, item.enqueuedAt);
  }
}
async function runRequest(ws, data, enqueuedAt) {
  const token = data.id || Date.now() + "_" + Math.random().toString(36).slice(2); inflight.add(token);
  try {
    const payload = data.payload || {}; let result;
    if (payload.kind === "fs") result = await handleFs(payload, ws); else if (payload.kind === "command") result = await handleCommand(payload); else if (payload.kind === "chrome") result = await handleChrome(payload); else if (payload.kind === "relay") result = await handleRelay(payload, loadConfig()); else { proxyLocalHttp(loadConfig(), data, ws); return; }
    safeSend(ws, { type:"TUNNEL_RESPONSE", id:data.id, queuedMs:Math.max(0, Date.now() - enqueuedAt), queueStats:{ inflight:inflight.size, queued:requestQueue.length, maxInflight:MAX_INFLIGHT, maxQueue:MAX_QUEUE }, ...result });
  } catch (e) { safeSend(ws, { type:"TUNNEL_RESPONSE", id:data.id, ok:false, status:500, error:e.message, stack:e.stack }); }
  finally { inflight.delete(token); setImmediate(drainQueue); }
}
function scheduleReconnect(reason) { if (reconnecting) return; reconnecting = true; clearTimeout(reconnectTimer); log("Tunnel reconnect scheduled:", reason || "unknown", JSON.stringify(memorySnapshot())); reconnectTimer = setTimeout(() => { reconnecting = false; connect(); }, 2000); reconnectTimer.unref?.(); }
function connect() {
  generation++; if (activeWs) { try { activeWs.removeAllListeners(); } catch {} try { activeWs.close(true); } catch {} activeWs = null; }
  const myGeneration = generation, config = loadConfig(), ws = new TinyWebSocket(config.relay); activeWs = ws;
  ws.on("open", () => { if (myGeneration === generation) register(ws); });
  ws.on("message", msg => { if (myGeneration !== generation) return; let data; try { data = JSON.parse(msg); } catch { return; } if (data.type === "TUNNEL_REPLACED") return log("Tunnel replaced by newer connection."); if (data.type === "TUNNEL_REQUEST") enqueueRequest(ws, data); });
  ws.once("close", () => { if (myGeneration === generation) scheduleReconnect("close"); });
  ws.on("error", err => { if (myGeneration === generation) log("Tunnel error:", err.message); }); ws.connect();
}
function main() { const config = loadConfig(); log('B"H Awtsmoos split agent starting.'); log("Config root dir:", ROOT); log("Tunnel name:", config.tunnelName); log("Project root:", config.root || HOME); log("Limits:", JSON.stringify({ MAX_INFLIGHT, MAX_QUEUE, REQUEST_MAX_AGE_MS, MAX_PROXY_BYTES, inlineLimitBytes:inlineLimit() })); startLocalApiServer({ log }); if (process.argv.includes("--open-control")) openHostedControl(config); connect(); }
process.on("uncaughtException", err => log("Uncaught exception:", err.stack || err.message));
process.on("unhandledRejection", err => log("Unhandled rejection:", err && (err.stack || err.message || String(err))));
main();
