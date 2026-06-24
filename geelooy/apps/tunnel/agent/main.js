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
const { handleStreaming } = require("./tools/streaming/index.js");
const { AGENT_VERSION } = require("./tools/fs/actions.js");
const { compactForSend, jsonBytes, inlineLimit } = require("./lib/response-size.js");
const { nativeRegistrationPacket } = require("./lib/registration.js");

const log = makeLogger(ROOT);
const CPU_COUNT = Math.max(1, os.cpus?.().length || 1);
const STRICT_ORDERING = process.env.AWTSMOOS_STRICT_ORDERING === "1";
const DEFAULT_MAX_INFLIGHT = STRICT_ORDERING ? 1 : Math.min(64, Math.max(16, CPU_COUNT * 4));
const MAX_INFLIGHT = boundedNumber(process.env.AWTSMOOS_MAX_INFLIGHT, DEFAULT_MAX_INFLIGHT, 1, 128);
const MAX_QUEUE = boundedNumber(process.env.AWTSMOOS_MAX_QUEUE, 5000, 0, 50000);
const REQUEST_MAX_AGE_MS = boundedNumber(process.env.AWTSMOOS_REQUEST_MAX_AGE_MS, 86400000, 1000, 604800000);
const MAX_PROXY_BYTES = boundedNumber(process.env.AWTSMOOS_MAX_PROXY_BYTES, 268435456, 1048576, 1073741824);
const RECONNECT_MIN_MS = boundedNumber(process.env.AWTSMOOS_RECONNECT_MIN_MS, 1000, 250, 60000);
const RECONNECT_MAX_MS = boundedNumber(process.env.AWTSMOOS_RECONNECT_MAX_MS, 30000, RECONNECT_MIN_MS, 300000);
const WATCHDOG_MS = boundedNumber(process.env.AWTSMOOS_TUNNEL_WATCHDOG_MS, 45000, 5000, 600000);
const WATCHDOG_STALE_MS = boundedNumber(process.env.AWTSMOOS_TUNNEL_STALE_MS, 120000, WATCHDOG_MS, 1800000);

let activeWs = null;
let reconnectTimer = null;
let watchdogTimer = null;
let reconnectAttempt = 0;
let wasEverConnected = false;
let generation = 0;

const inflight = new Set();
const requestQueue = [];

function boundedNumber(value, fallback, min, max) {
  const n = Number(value || fallback);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback;
}

function correlationFields(payload = {}) {
  return {
    tunnelName: payload.tunnelName || "",
    requestedTunnelName: payload.requestedTunnelName || "",
    controlRequestId: payload.controlRequestId || "",
    clientRequestId: payload.clientRequestId || "",
    agentSessionId: payload.agentSessionId || "",
    logicalAgentId: payload.logicalAgentId || "",
    projectRoot: payload.projectRoot || payload.root || "",
    nonce: payload.nonce || ""
  };
}

function safeSend(ws, obj) {
  if (!ws || !ws.opened) return;
  try {
    ws.sendJson(compactForSend(ROOT, obj, { limitBytes: inlineLimit() }).envelope);
  } catch (e) {
    try {
      ws.sendJson({
        type: "TUNNEL_RESPONSE",
        id: obj?.id,
        ...correlationFields(obj),
        requestAction: obj?.requestAction,
        ok: false,
        status: 500,
        error: "safe_send_failed",
        message: e.message,
        originalBytes: jsonBytes(obj)
      });
    } catch (_) {}
  }
}

function responseEnvelope(data, payload, result, enqueuedAt) {
  const safeResult = result && typeof result === "object" ? { ...result } : { ok: true, value: result };
  const actualAction = String(safeResult.action || "");
  const requestAction = String(payload?.action || "");
  const actionMismatch = Boolean(requestAction && actualAction && requestAction !== actualAction && !allowedActionAlias(requestAction, actualAction));
  delete safeResult.type;
  delete safeResult.id;
  delete safeResult.controlRequestId;
  delete safeResult.queueStats;
  delete safeResult.queuedMs;
  return {
    ...safeResult,
    type: "TUNNEL_RESPONSE",
    id: data.id,
    ...correlationFields({
      ...payload,
      tunnelName: payload?.tunnelName || loadConfig().tunnelName,
      requestedTunnelName: payload?.requestedTunnelName || payload?.tunnelName || ""
    }),
    requestAction,
    actualAction,
    actionMismatch,
    queuedMs: Math.max(0, Date.now() - enqueuedAt),
    queueStats: { inflight: inflight.size, queued: requestQueue.length, maxInflight: MAX_INFLIGHT, maxQueue: MAX_QUEUE }
  };
}

function allowedActionAlias(requestAction, actualAction) {
  if (requestAction === actualAction) return true;
  const aliases = {
    command: ["commandRun", "commandStart"],
    commandRun: ["commandStart"],
    commandStart: ["commandStart"],
    commandStatus: ["commandStatus", "commandStart"],
    commandPoll: ["commandStatus", "commandStart"],
    commandJobStatus: ["commandStatus", "commandStart"],
    commandWait: ["commandWait", "commandStatus", "commandStart"],
    commandJobWait: ["commandWait", "commandStatus", "commandStart"],
    commandJobOutputPage: ["commandJobOutputPage"],
    commandOutputPage: ["commandJobOutputPage"],
    commandCancel: ["commandCancel"],
    commandJobCancel: ["commandCancel"]
  };
  return (aliases[requestAction] || []).includes(actualAction);
}

function normalizePayloadKind(payload = {}) {
  const action = String(payload.action || "");
  const known = new Set(["fs", "command", "chrome", "relay", "streaming"]);
  if (known.has(payload.kind) && payload.kind !== "tunnel.read" && payload.kind !== "tunnel.write") return payload.kind;
  if (action.startsWith("mission")) return "fs";
  if (action.startsWith("command") || action === "nodeScriptRun" || action === "nodeCheck" || action === "nodeCheckTree") return "command";
  if (action.startsWith("chrome")) return "chrome";
  if (action.startsWith("relay")) return "relay";
  if (action.startsWith("streaming")) return "streaming";
  return payload.kind || "fs";
}

function memorySnapshot() {
  const m = process.memoryUsage();
  return {
    rssMB: Math.round(m.rss / 1048576),
    heapUsedMB: Math.round(m.heapUsed / 1048576),
    heapTotalMB: Math.round(m.heapTotal / 1048576),
    externalMB: Math.round(m.external / 1048576),
    inflight: inflight.size,
    queued: requestQueue.length,
    maxInflight: MAX_INFLIGHT,
    maxQueue: MAX_QUEUE,
    reconnectAttempt,
    wasEverConnected,
    strictOrdering: STRICT_ORDERING,
    inlineLimitBytes: inlineLimit()
  };
}

setInterval(() => log("Memory:", JSON.stringify(memorySnapshot())), 60000).unref();

function proxyLocalHttp(config, data, ws) {
  if (!config.enableLocalHttpProxy || !config.tools.httpProxy) {
    return safeSend(ws, { type: "TUNNEL_RESPONSE", id: data.id, controlRequestId: data.payload?.controlRequestId, ok: false, status: 403, error: "Local HTTP proxy disabled." });
  }
  const p = data.payload || {};
  const target = new URL(p.url || "/", config.local);
  const lib = target.protocol === "https:" ? https : http;
  const body = p.body ? Buffer.from(p.body, "base64") : null;
  const req = lib.request(target, { method: p.method || "GET", headers: { ...(p.headers || {}), host: target.host } }, res => {
    const chunks = [];
    let total = 0;
    let aborted = false;
    res.on("data", chunk => {
      total += chunk.length;
      if (total > MAX_PROXY_BYTES) {
        aborted = true;
        req.destroy();
        return safeSend(ws, { type: "TUNNEL_RESPONSE", id: data.id, controlRequestId: p.controlRequestId, ok: false, status: 413, error: "local_proxy_response_too_large", bytes: total, maxBytes: MAX_PROXY_BYTES });
      }
      chunks.push(chunk);
    });
    res.on("end", () => {
      if (!aborted) safeSend(ws, { type: "TUNNEL_RESPONSE", id: data.id, controlRequestId: p.controlRequestId, status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString("base64") });
    });
  });
  req.on("error", err => safeSend(ws, { type: "TUNNEL_RESPONSE", id: data.id, controlRequestId: p.controlRequestId, status: 502, headers: { "content-type": "text/plain" }, body: Buffer.from(err.message).toString("base64") }));
  if (body) req.write(body);
  req.end();
}

function register(ws) {
  const config = loadConfig();
  ws.lastSeenAt = Date.now();
  ws.sendJson(nativeRegistrationPacket({
    config,
    agentVersion: AGENT_VERSION,
    limits: {
      maxInflight: MAX_INFLIGHT,
      strictOrdering: STRICT_ORDERING,
      maxQueue: MAX_QUEUE,
      requestMaxAgeMs: REQUEST_MAX_AGE_MS,
      maxProxyBytes: MAX_PROXY_BYTES,
      reconnectMinMs: RECONNECT_MIN_MS,
      reconnectMaxMs: RECONNECT_MAX_MS,
      watchdogMs: WATCHDOG_MS,
      staleMs: WATCHDOG_STALE_MS,
      inlineLimitBytes: inlineLimit()
    }
  }));
  wasEverConnected = true;
  reconnectAttempt = 0;
  log("Tunnel connected:", config.tunnelName, "root:", config.root || HOME);
}

function enqueueRequest(ws, data) {
  if (requestQueue.length >= MAX_QUEUE) {
    return safeSend(ws, { type: "TUNNEL_RESPONSE", id: data.id, ...correlationFields(data.payload || {}), ok: false, status: 429, error: "agent_queue_full", inflight: inflight.size, queued: requestQueue.length, maxInflight: MAX_INFLIGHT, maxQueue: MAX_QUEUE });
  }
  requestQueue.push({ ws, data, enqueuedAt: Date.now() });
  drainQueue();
}

function drainQueue() {
  while (inflight.size < MAX_INFLIGHT && requestQueue.length) {
    const item = requestQueue.shift();
    if (!item.ws || !item.ws.opened) continue;
    const ageMs = Date.now() - item.enqueuedAt;
    if (ageMs > REQUEST_MAX_AGE_MS) {
      safeSend(item.ws, { type: "TUNNEL_RESPONSE", id: item.data.id, ...correlationFields(item.data.payload || {}), ok: false, status: 504, error: "agent_queue_timeout", queuedMs: ageMs, maxQueuedMs: REQUEST_MAX_AGE_MS });
      continue;
    }
    runRequest(item.ws, item.data, item.enqueuedAt);
  }
}

async function runRequest(ws, data, enqueuedAt) {
  const token = data.id || Date.now() + "_" + Math.random().toString(36).slice(2);
  inflight.add(token);
  try {
    const payload = data.payload || {};
    const payloadKind = normalizePayloadKind(payload);
    let result;
    if (payloadKind === "fs") result = await handleFs({ ...payload, kind: payloadKind }, ws);
    else if (payloadKind === "command") result = await handleCommand({ ...payload, kind: payloadKind });
    else if (payloadKind === "chrome") result = await handleChrome({ ...payload, kind: payloadKind });
    else if (payloadKind === "relay") result = await handleRelay({ ...payload, kind: payloadKind }, loadConfig());
    else if (payloadKind === "streaming") result = await handleStreaming({ ...payload, kind: payloadKind });
    else {
      safeSend(ws, responseEnvelope(data, payload, { ok: false, status: 400, action: payload.action || "unknown", error: "unknown_payload_kind", receivedKind: payload.kind, normalizedKind: payloadKind }, enqueuedAt));
      return;
    }
    safeSend(ws, responseEnvelope(data, payload, result, enqueuedAt));
  } catch (e) {
    safeSend(ws, { type: "TUNNEL_RESPONSE", id: data.id, ...correlationFields(data.payload || {}), ok: false, status: 500, error: e.message, stack: e.stack });
  } finally {
    inflight.delete(token);
    setImmediate(drainQueue);
  }
}

function reconnectDelayMs() {
  const raw = Math.min(RECONNECT_MAX_MS, RECONNECT_MIN_MS * Math.pow(2, Math.max(0, reconnectAttempt - 1)));
  return Math.min(RECONNECT_MAX_MS, raw + Math.floor(Math.random() * Math.max(1, Math.floor(raw * 0.25))));
}

function scheduleReconnect(reason) {
  clearTimeout(reconnectTimer);
  clearInterval(watchdogTimer);
  reconnectAttempt += 1;
  const delay = wasEverConnected ? reconnectDelayMs() : RECONNECT_MIN_MS;
  log("Tunnel reconnect scheduled:", reason || "unknown", "delayMs:", delay, JSON.stringify(memorySnapshot()));
  reconnectTimer = setTimeout(connect, delay);
  reconnectTimer.unref?.();
}

function closeActiveSocket(force = true) {
  if (!activeWs) return;
  try { activeWs.removeAllListeners(); } catch (_) {}
  try { activeWs.close(force); } catch (_) {}
  activeWs = null;
}

function startWatchdog(ws, myGeneration) {
  clearInterval(watchdogTimer);
  watchdogTimer = setInterval(() => {
    if (myGeneration !== generation || !ws || ws.closed) return;
    const staleMs = Date.now() - Number(ws.lastSeenAt || 0);
    if (ws.opened && staleMs < WATCHDOG_STALE_MS) return;
    log("Tunnel watchdog reconnect:", JSON.stringify({ staleMs, opened: ws.opened, closed: ws.closed }));
    try { ws.close(true); } catch (_) {}
    if (myGeneration === generation) scheduleReconnect("watchdog_stale_socket");
  }, WATCHDOG_MS);
  watchdogTimer.unref?.();
}

function exitBecauseNewerConnectionOwnsTunnel() {
  clearTimeout(reconnectTimer);
  clearInterval(watchdogTimer);
  closeActiveSocket(true);
  log("Tunnel replaced by newer connection; exiting this older process.");
  process.exit(0);
}

function connect() {
  generation += 1;
  closeActiveSocket(true);
  const myGeneration = generation;
  const config = loadConfig();
  const ws = new TinyWebSocket(config.relay);
  ws.lastSeenAt = Date.now();
  activeWs = ws;
  startWatchdog(ws, myGeneration);
  ws.on("open", () => { if (myGeneration === generation) register(ws); });
  ws.on("message", msg => {
    if (myGeneration !== generation) return;
    ws.lastSeenAt = Date.now();
    let data;
    try { data = JSON.parse(msg); } catch (_) { return; }
    if (data.type === "TUNNEL_REPLACED") return exitBecauseNewerConnectionOwnsTunnel();
    if (data.type === "TUNNEL_REQUEST") enqueueRequest(ws, data);
  });
  ws.once("close", () => { if (myGeneration === generation) scheduleReconnect("close"); });
  ws.on("error", err => { if (myGeneration === generation) log("Tunnel error:", err.message); });
  ws.connect();
}

function main() {
  const config = loadConfig();
  log('B"H Awtsmoos split agent starting.');
  log("Config root dir:", ROOT);
  log("Tunnel name:", config.tunnelName);
  log("Project root:", config.root || HOME);
  log("Limits:", JSON.stringify({ MAX_INFLIGHT, MAX_QUEUE, REQUEST_MAX_AGE_MS, MAX_PROXY_BYTES, RECONNECT_MIN_MS, RECONNECT_MAX_MS, WATCHDOG_MS, WATCHDOG_STALE_MS, inlineLimitBytes: inlineLimit() }));
  startLocalApiServer({ log });
  if (process.argv.includes("--open-control")) openHostedControl(config);
  connect();
}

process.on("uncaughtException", err => log("Uncaught exception:", err.stack || err.message));
process.on("unhandledRejection", err => log("Unhandled rejection:", err && (err.stack || err.message || String(err))));

main();
