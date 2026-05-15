
// B"H
const os = require("os");
const http = require("http");
const https = require("https");
const { loadConfig, ROOT, HOME } = require("./lib/config.js");
const { makeLogger } = require("./lib/log.js");
const { openHostedControl } = require("./lib/open.js");
const { TinyWebSocket } = require("./lib/ws.js");
const { handleFs } = require("./tools/fs/index.js");
const { handleCommand } = require("./tools/command/index.js");
const { handleChrome } = require("./tools/chrome/index.js");
const { AGENT_VERSION } = require("./tools/fs/actions.js");

const log = makeLogger(ROOT);

const MAX_INFLIGHT = Number(process.env.AWTSMOOS_MAX_INFLIGHT || 4);
const MAX_RESPONSE_BYTES = Number(process.env.AWTSMOOS_MAX_RESPONSE_BYTES || 80 * 1024 * 1024);
const MAX_PROXY_BYTES = Number(process.env.AWTSMOOS_MAX_PROXY_BYTES || 32 * 1024 * 1024);

let activeWs = null;
let reconnectTimer = null;
let reconnecting = false;
let generation = 0;
const inflight = new Set();

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
      guidance: "Read with smaller maxChars, offsets, read64 chunks, or smaller bulk groups."
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
    inflight: inflight.size
  };
}

setInterval(() => {
  const m = memorySnapshot();
  log("Memory:", JSON.stringify(m));
}, 60000).unref();

function proxyLocalHttp(config, data, ws) {
  if (!config.enableLocalHttpProxy || !config.tools.httpProxy) {
    safeSend(ws, {
      type: "TUNNEL_RESPONSE",
      id: data.id,
      ok: false,
      status: 403,
      error: "Local HTTP proxy disabled."
    });
    return;
  }

  const p = data.payload || {};
  const target = new URL(p.url || "/", config.local);
  const lib = target.protocol === "https:" ? https : http;
  const body = p.body ? Buffer.from(p.body, "base64") : null;

  const req = lib.request(
    target,
    {
      method: p.method || "GET",
      headers: { ...(p.headers || {}), host: target.host }
    },
    res => {
      const chunks = [];
      let total = 0;
      let aborted = false;

      res.on("data", c => {
        total += c.length;

        if (total > MAX_PROXY_BYTES) {
          aborted = true;
          req.destroy();
          safeSend(ws, {
            type: "TUNNEL_RESPONSE",
            id: data.id,
            ok: false,
            status: 413,
            error: "local_proxy_response_too_large",
            bytes: total,
            maxBytes: MAX_PROXY_BYTES
          });
          return;
        }

        chunks.push(c);
      });

      res.on("end", () => {
        if (aborted) return;

        safeSend(ws, {
          type: "TUNNEL_RESPONSE",
          id: data.id,
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString("base64")
        });
      });
    }
  );

  req.on("error", err => {
    safeSend(ws, {
      type: "TUNNEL_RESPONSE",
      id: data.id,
      status: 502,
      headers: { "content-type": "text/plain" },
      body: Buffer.from(err.message).toString("base64")
    });
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
    command: config.command
  });

  log("Tunnel connected:", config.tunnelName, "root:", config.root || HOME);
}

async function handleRequest(ws, data) {
  if (inflight.size >= MAX_INFLIGHT) {
    safeSend(ws, {
      type: "TUNNEL_RESPONSE",
      id: data.id,
      ok: false,
      status: 429,
      error: "agent_busy",
      inflight: inflight.size,
      maxInflight: MAX_INFLIGHT,
      guidance: "Wait for current requests to finish or split testing into smaller batches."
    });
    return;
  }

  const token = data.id || Date.now() + "_" + Math.random().toString(36).slice(2);
  inflight.add(token);

  try {
    const payload = data.payload || {};
    let result;

    if (payload.kind === "fs") result = await handleFs(payload, ws);
    else if (payload.kind === "command") result = await handleCommand(payload);
    else if (payload.kind === "chrome") result = await handleChrome(payload);
    else {
      proxyLocalHttp(loadConfig(), data, ws);
      return;
    }

    safeSend(ws, {
      type: "TUNNEL_RESPONSE",
      id: data.id,
      ...result
    });
  } catch (e) {
    safeSend(ws, {
      type: "TUNNEL_RESPONSE",
      id: data.id,
      ok: false,
      status: 500,
      error: e.message,
      stack: e.stack
    });
  } finally {
    inflight.delete(token);
  }
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
  log("Limits:", JSON.stringify({
    MAX_INFLIGHT,
    MAX_RESPONSE_BYTES,
    MAX_PROXY_BYTES
  }));

  if (process.argv.includes("--open-control")) {
    openHostedControl(config);
  }

  connect();
}

process.on("uncaughtException", err => {
  log("Uncaught exception:", err.stack || err.message);
});

process.on("unhandledRejection", err => {
  log("Unhandled rejection:", err && (err.stack || err.message || String(err)));
});

main();
