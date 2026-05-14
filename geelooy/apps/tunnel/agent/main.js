
// B"H
const os = require("os");
const http = require("http");
const https = require("https");

const { ROOT, loadConfig } = require("./lib/config.js");
const { makeLogger } = require("./lib/log.js");
const { openHostedControl } = require("./lib/open.js");
const { TinyWebSocket } = require("./lib/ws.js");
const { handleFs } = require("./tools/fs.js");
const { handleChrome } = require("./tools/chrome.js");

const log = makeLogger(ROOT);

function proxyLocalHttp(config, data, ws) {
  if (!config.enableLocalHttpProxy || !config.tools.httpProxy) {
    ws.sendJson({
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

  const req = lib.request(target, {
    method: p.method || "GET",
    headers: { ...(p.headers || {}), host: target.host }
  }, res => {
    const chunks = [];
    res.on("data", c => chunks.push(c));
    res.on("end", () => {
      ws.sendJson({
        type: "TUNNEL_RESPONSE",
        id: data.id,
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks).toString("base64")
      });
    });
  });

  req.on("error", err => {
    ws.sendJson({
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
    root: config.root,
    allowWrite: config.allowWrite,
    allowSecrets: config.allowSecrets,
    agentVersion: "split-agent-0.2.0"
  });

  log("Tunnel connected:", config.tunnelName, "root:", config.root);
}

function connect() {
  const config = loadConfig();
  const ws = new TinyWebSocket(config.relay);

  ws.on("open", () => register(ws));

  ws.on("message", async msg => {
    let data;

    try {
      data = JSON.parse(msg);
    } catch (e) {
      return;
    }

    if (data.type !== "TUNNEL_REQUEST") return;

    try {
      const payload = data.payload || {};
      let result;

      if (payload.kind === "fs") {
        result = await handleFs(payload, ws);
      } else if (payload.kind === "chrome") {
        result = await handleChrome(payload);
      } else {
        proxyLocalHttp(loadConfig(), data, ws);
        return;
      }

      ws.sendJson({ type: "TUNNEL_RESPONSE", id: data.id, ...result });
    } catch (e) {
      ws.sendJson({
        type: "TUNNEL_RESPONSE",
        id: data.id,
        ok: false,
        status: 500,
        error: e.message,
        stack: e.stack
      });
    }
  });

  ws.on("close", () => {
    log("Tunnel closed. Reconnecting in 2 seconds...");
    setTimeout(connect, 2000);
  });

  ws.on("error", err => {
    log("Tunnel error:", err.message);
  });

  ws.connect();
}

function main() {
  const config = loadConfig();

  log('B"H Awtsmoos split agent starting.');
  log("Tunnel name:", config.tunnelName);
  log("Project root:", config.root);

  if (process.argv.includes("--open-control")) {
    openHostedControl(config);
  }

  connect();
}

main();
