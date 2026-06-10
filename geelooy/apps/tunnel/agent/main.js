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

const log = makeLogger(ROOT);

const CPU_COUNT = Math.max(1, os.cpus?.().length || 1);
const MAX_INFLIGHT = boundedNumber(process.env.AWTSMOOS_MAX_INFLIGHT, Math.min(16, Math.max(8, CPU_COUNT * 2)), 1, 64);
const MAX_QUEUE = boundedNumber(process.env.AWTSMOOS_MAX_QUEUE, 1000, 0, 10000);
const REQUEST_MAX_AGE_MS = boundedNumber(process.env.AWTSMOOS_REQUEST_MAX_AGE_MS, 45000, 1000, 240000);
const MAX_RESPONSE_BYTES = boundedNumber(process.env.AWTSMOOS_MAX_RESPONSE_BYTES, 80 * 1024 * 1024, 1024 * 1024, 512 * 1024 * 1024);
const MAX_PROXY_BYTES = boundedNumber(process.env.AWTSMOOS_MAX_PROXY_BYTES, 32 * 1024 * 1024, 1024 * 1024, 256 * 1024 * 1024);

let activeWs = null;
let reconnectTimer = null;
let reconnecting = false;
let generation = 0;
const inflight = new Set();
const requestQueue = [];

function boundedNumber(value, fallback, min, max) {
  const n = Number(value || fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function bytesOfJson(obj) {
  try { return Buffer.byteLength(JSON.stringify(obj), "utf8"); }
  catch (_e) { return 0; }
}

function safeSend(ws, obj) {
  if (!ws || !ws.opened) return;
  const size = bytesOfJson(obj);
  if (size > MAX_RESPONSE_BYTES) {
    ws.sendJson({
      type: "TUNNEL_RESPONSE",
      id: obj.id,
      ok: false,
      status: 413,
      error: "agent_response_too_large",
      bytes: size,
      maxBytes: MAX_RESPONSE_BYTES,
      guidance: "Read with smaller maxChars, offsets, read64 chunks, smaller bulk groups, or outputRef chunks."
    });
    return;
  }
  ws.sendJson(obj);
}

function memorySnapshot() {
  const m = process.memoryUsage();
  return {
    rssMB: Math.round(m.rss / 1024 / 1024),
    heapUsedMB: Math.round(m.heapUsed / 1024 / 1024),
    heapTotalMB: Math.round(m.heapTotal / 1024 / 1024),
    externalMB: Math.round(m.external / 1024 / 1024),
    inflight: inflight.size,
    queued: requestQueue.length,
    maxInflight: MAX_INFLIGHT,
    maxQueue: MAX_QUEUE
  };
}

setInterval(() => {
  log("Memory:", JSON.stringify(memorySnapshot()));
}, 60000).unref();

function proxyLocalHttp(config, data, ws) {
  if (!config.enableLocalHttpProxy || !config.tools.httpProxy) {
    safeSend(ws, { type: "TUNNEL_RESPONSE", id: data.id, ok: false, status: 403, error: "Local HTTP proxy disabled." });
    return;
  }

  const p = data.payload || {};
  const target = new URL(p.url || "/", config.local);
  const lib = target.protocol === "https:" ? https : http;
  const body = p.body ? Buffer.from(p.body, "base64") : null;

  const req = lib.request(target, { method: p.method || "GET", headers: { ...(p.headers || {}), host: target.host } }, res => {
    const chunks = [];
    let total = 0;
    let aborted = false;

    res.on("data", c => {
      total += c.length;
      if (total > MAX_PROXY_BYTES) {
        aborted = true;
        req.destroy();
        safeSend(ws, { type: "TUNNEL_RESPONSE", id: data.id, ok: false, status: 413, error: "local_proxy_response_too_large", bytes: total, maxBytes: MAX_PROXY_BYTES });
        return;
      }
      chunks.push(c);
    });

    res.on("end", () => {
      if (aborted) return;
      safeSend(ws, { type: "TUNNEL_RESPONSE", id: data.id, status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString("base64") });
    });
  });

  req.on("error", err => {
    safeSend(ws, { type: "TUNNEL_RESPONSE", id: data.id, status: 502, headers: { "content-type": "text/plain" }, body: Buffer.from(err.message).toString("base64") });
  });

  if (body) req.write(body);
  req.end();
}

function register(ws) {
  const config = loadConfig();
  ws.sendJson({
    type: "TUNNEL_REGISTER",
    name: config.tunnelName,
    deviceName: os.hostname(),
    root: config.root || HOME,
    allowWrite: config.allowWrite,
    allowSecrets: config.allowSecrets,
    allowCommands: config.allowCommands,
    agentVersion: AGENT_VERSION,
    tools: config.tools,
    chrome: config.chrome,
    command: config.command,
    limits: { maxInflight: MAX_INFLIGHT, maxQueue: MAX_QUEUE, requestMaxAgeMs: REQUEST_MAX_AGE_MS, maxResponseBytes: MAX_RESPONSE_BYTES, maxProxyBytes: MAX_PROXY_BYTES }
  });
  log("Tunnel connected:", config.tunnelName, "root:", config.root || HOME);
}

function enqueueRequest(ws, data) {
  if (requestQueue.length >= MAX_QUEUE) {
    safeSend(ws, {
      type: "TUNNEL_RESPONSE",
      id: data.id,
      ok: false,
      status: 429,
      error: "agent_queue_full",
      inflight: inflight.size,
      queued: requestQueue.length,
      maxInflight: MAX_INFLIGHT,
      maxQueue: MAX_QUEUE,
      guidance: "The agent accepted many requests already. Retry after the queue drains, or raise AWTSMOOS_MAX_QUEUE carefully."
    });
    return;
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
      safeSend(item.ws, {
        type: "TUNNEL_RESPONSE",
        id: item.data.id,
        ok: false,
        status: 504,
        error: "agent_queue_timeout",
        queuedMs: ageMs,
        maxQueuedMs: REQUEST_MAX_AGE_MS,
        guidance: "The request waited too long in the local queue. Retry with smaller work or raise AWTSMOOS_REQUEST_MAX_AGE_MS carefully."
      });
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
    let result;
    if (payload.kind === "fs") result = await handleFs(payload, ws);
    else if (payload.kind === "command") result = await handleCommand(payload);
    else if (payload.kind === "chrome") result = await handleChrome(payload);
    else if (payload.kind === "relay") result = await handleRelay(payload, loadConfig());
    else {
      proxyLocalHttp(loadConfig(), data, ws);
      return;
    }

    safeSend(ws, {
      type: "TUNNEL_RESPONSE",
      id: data.id,
      queuedMs: Math.max(0, Date.now() - enqueuedAt),
      queueStats: { inflight: inflight.size, queued: requestQueue.length, maxInflight: MAX_INFLIGHT, maxQueue: MAX_QUEUE },
      ...result
    });
  } catch (e) {
    safeSend(ws, { type: "TUNNEL_RESPONSE", id: data.id, ok: false, status: 500, error: e.message, stack: e.stack });
  } finally {
    inflight.delete(token);
    setImmediate(drainQueue);
  }
}

function handleRequest(ws, data) {
  enqueueRequest(ws, data);
}

function scheduleReconnect(reason) {
  if (reconnecting) return;
  reconnecting = true;
  clearTimeout(reconnectTimer);
  log("Tunnel reconnect scheduled:", reason || "unknown", JSON.stringify(memorySnapshot()));
  reconnectTimer = setTimeout(() => {
    reconnecting = false;
    connect();
  }, 2000);
  reconnectTimer.unref?.();
}

function connect() {
  generation++;
  if (activeWs) {
    try { activeWs.removeAllListeners(); } catch (_e) {}
    try { activeWs.close(true); } catch (_e) {}
    activeWs = null;
  }

  const myGeneration = generation;
  const config = loadConfig();
  const ws = new TinyWebSocket(config.relay);
  activeWs = ws;

  ws.on("open", () => {
    if (myGeneration !== generation) return;
    register(ws);
  });

  ws.on("message", msg => {
    if (myGeneration !== generation) return;
    let data;
    try { data = JSON.parse(msg); }
    catch (_e) { return; }
    if (data.type === "TUNNEL_REPLACED") {
      log("Tunnel replaced by newer connection.");
      return;
    }
    if (data.type !== "TUNNEL_REQUEST") return;
    handleRequest(ws, data);
  });

  ws.once("close", () => {
    if (myGeneration !== generation) return;
    scheduleReconnect("close");
  });

  ws.on("error", err => {
    if (myGeneration !== generation) return;
    log("Tunnel error:", err.message);
  });

  ws.connect();
}

function main() {
  const config = loadConfig();
  log('B"H Awtsmoos split agent starting.');
  log("Config root dir:", ROOT);
  log("Tunnel name:", config.tunnelName);
  log("Project root:", config.root || HOME);
  log("Limits:", JSON.stringify({ MAX_INFLIGHT, MAX_QUEUE, REQUEST_MAX_AGE_MS, MAX_RESPONSE_BYTES, MAX_PROXY_BYTES }));
  startLocalApiServer({ log });
  if (process.argv.includes("--open-control")) openHostedControl(config);
  connect();
}

process.on("uncaughtException", err => {
  log("Uncaught exception:", err.stack || err.message);
});

process.on("unhandledRejection", err => {
  log("Unhandled rejection:", err && (err.stack || err.message || String(err)));
});

main();
