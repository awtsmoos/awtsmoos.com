
// B"H
// Awtsmoos Local Tunnel Control App.
// Runs locally at http://127.0.0.1:<port> and guides the user through setup.

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const http = require("http");
const https = require("https");
const os = require("os");
const net = require("net");
const tls = require("tls");
const crypto = require("crypto");
const childProcess = require("child_process");
const EventEmitter = require("events");

const HOME = os.homedir();
const ROOT = path.join(HOME, ".awtsmoos-tunnel");
const CONFIG_PATH = path.join(ROOT, "config.json");
const LOG_PATH = path.join(ROOT, "logs.txt");
const DEFAULT_RELAY = "wss://awtsmoos.com";
const DEFAULT_LOCAL = "http://localhost:3000";

const SKIP = new Set([
  "node_modules",
  ".git",
  ".DS_Store",
  "dist",
  "build",
  ".next",
  "coverage"
]);

const SECRET_FILES = new Set([
  ".env",
  ".env.local",
  ".env.production",
  ".npmrc",
  "id_rsa",
  "id_dsa",
  "id_ed25519",
  "credentials.json"
]);

const BIN = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
  ".pdf", ".zip", ".exe", ".dll", ".so", ".node",
  ".woff", ".woff2", ".ttf", ".mp4", ".mov", ".mp3"
]);

/**
 * B"H
 * Small local logger. It keeps a memory ring and writes to disk.
 *
 * @param {Array<string>} parts Log parts.
 * @returns {void}
 */
const logLines = [];
function log(...parts) {
  const line = "[" + new Date().toISOString() + "] " + parts.join(" ");
  logLines.push(line);
  while (logLines.length > 500) logLines.shift();
  console.log(line);
  try {
    fs.appendFileSync(LOG_PATH, line + "\n", "utf8");
  } catch (e) {}
}

/**
 * B"H
 * Generates a clean default tunnel name.
 *
 * @returns {string} Clean random tunnel name.
 */
function defaultTunnelName() {
  const user = String(os.userInfo().username || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "user";

  return "awt-" + user + "-" + Math.floor(1000 + Math.random() * 9000);
}

/**
 * B"H
 * Reads JSON safely.
 *
 * @param {string} file File path.
 * @param {*} fallback Fallback value.
 * @returns {*} Parsed JSON or fallback.
 */
function readJson(file, fallback) {
  try {
    const text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    return JSON.parse(text);
  } catch (e) {
    return fallback;
  }
}

/**
 * B"H
 * Writes JSON without BOM.
 *
 * @param {string} file File path.
 * @param {*} data Data to save.
 * @returns {void}
 */
function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

/**
 * B"H
 * Loads config with defaults.
 *
 * @returns {object} Config.
 */
function loadConfig() {
  const old = readJson(CONFIG_PATH, {});

  return {
    relay: old.relay || DEFAULT_RELAY,
    tunnelName: old.tunnelName || defaultTunnelName(),
    local: old.local || DEFAULT_LOCAL,
    root: old.root || process.cwd(),
    allowWrite: old.allowWrite !== false,
    allowSecrets: !!old.allowSecrets,
    enableLocalHttpProxy: old.enableLocalHttpProxy !== false,
    enableChromeDebugTools: !!old.enableChromeDebugTools,
    customInstructions: old.customInstructions || "",
    customResponses: old.customResponses || {},
    tools: {
      fsList: old.tools?.fsList !== false,
      fsTree: old.tools?.fsTree !== false,
      fsRead: old.tools?.fsRead !== false,
      fsWrite: old.tools?.fsWrite !== false,
      fsBulk: old.tools?.fsBulk !== false,
      httpProxy: old.tools?.httpProxy !== false,
      browserDebug: !!old.tools?.browserDebug
    }
  };
}

/**
 * B"H
 * Saves config.
 *
 * @param {object} patch Config patch or full config.
 * @returns {object} Saved config.
 */
function saveConfig(patch) {
  const current = loadConfig();
  const next = {
    ...current,
    ...patch,
    tools: {
      ...current.tools,
      ...(patch.tools || {})
    }
  };

  writeJson(CONFIG_PATH, next);
  return next;
}

/**
 * B"H
 * Chapter 481: The control app stopped wearing a nameless cloak.
 *
 * The browser page may keep a virtual storage vessel, and the hosted account may
 * keep a Virtual OS, but this process is the native local machine. It declares
 * that truth as plain JSON so routing can remain exact when multiple vessels
 * share a tunnel name, a prompt, or a moment of confusing thunder.
 *
 * @param {object} config Local app config.
 * @returns {object} Native local registration packet.
 */
function nativeRegistrationPacket(config) {
  return {
    type: "TUNNEL_REGISTER",
    protocolVersion: "awtsmoos-tunnel-v2",
    name: config.tunnelName,
    tunnelName: config.tunnelName,
    vesselType: "native-local",
    targetVessel: "local-tunnel",
    localTunnel: true,
    browserAgent: false,
    virtualOs: false,
    deviceName: os.hostname(),
    root: config.root,
    allowWrite: config.allowWrite,
    allowSecrets: config.allowSecrets,
    allowCommands: false,
    capabilities: {
      vesselType: "native-local",
      targetVessel: "local-tunnel",
      fsList: config.tools?.fsList !== false,
      fsTree: config.tools?.fsTree !== false,
      fsRead: config.tools?.fsRead !== false,
      fsWrite: config.tools?.fsWrite !== false && config.allowWrite !== false,
      fsBulk: config.tools?.fsBulk !== false,
      httpProxy: config.tools?.httpProxy !== false && config.enableLocalHttpProxy !== false,
      chrome: !!config.enableChromeDebugTools,
      storage: "native-filesystem"
    },
    tools: config.tools
  };
}

/**
 * B"H
 * Sends JSON from local server.
 *
 * @param {object} res HTTP response.
 * @param {object} obj JSON data.
 * @param {number} status HTTP status.
 * @returns {void}
 */
function sendJson(res, obj, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(obj, null, 2));
}

/**
 * B"H
 * Sends text/html.
 *
 * @param {object} res HTTP response.
 * @param {string} body Body.
 * @param {string} type Content type.
 * @returns {void}
 */
function sendText(res, body, type = "text/plain; charset=utf-8") {
  res.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": "no-store"
  });
  res.end(body);
}

/**
 * B"H
 * Reads request body.
 *
 * @param {object} req HTTP request.
 * @returns {Promise<string>} Body text.
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

/**
 * B"H
 * Opens a browser to a local URL.
 *
 * @param {string} url URL to open.
 * @returns {void}
 */
function openBrowser(url) {
  const platform = process.platform;

  try {
    if (platform === "win32") {
      childProcess.spawn("cmd", ["/c", "start", "", url], {
        detached: true,
        stdio: "ignore"
      }).unref();
    } else if (platform === "darwin") {
      childProcess.spawn("open", [url], {
        detached: true,
        stdio: "ignore"
      }).unref();
    } else {
      childProcess.spawn("xdg-open", [url], {
        detached: true,
        stdio: "ignore"
      }).unref();
    }
  } catch (e) {
    log("Could not open browser:", e.message);
  }
}

/**
 * B"H
 * Finds an available localhost port.
 *
 * @param {number} start Starting port.
 * @returns {Promise<number>} Available port.
 */
function findPort(start = 3967) {
  return new Promise(resolve => {
    const tryOne = port => {
      const srv = net.createServer();

      srv.once("error", () => tryOne(port + 1));
      srv.once("listening", () => {
        srv.close(() => resolve(port));
      });

      srv.listen(port, "127.0.0.1");
    };

    tryOne(start);
  });
}

/**
 * B"H
 * Tiny custom WebSocket client. No npm dependency.
 */
class TinyWebSocket extends EventEmitter {
  constructor(urlText) {
    super();
    this.url = new URL(urlText);
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.opened = false;
    this.handshakeDone = false;
  }

  connect() {
    const isSecure = this.url.protocol === "wss:";
    const port = Number(this.url.port || (isSecure ? 443 : 80));
    const host = this.url.hostname;
    const onConnect = () => this.sendHandshake();

    this.socket = isSecure
      ? tls.connect({ host, port, servername: host }, onConnect)
      : net.connect({ host, port }, onConnect);

    this.socket.on("data", chunk => this.onData(chunk));
    this.socket.on("error", err => this.emit("error", err));
    this.socket.on("close", () => this.emit("close"));
  }

  sendHandshake() {
    const key = crypto.randomBytes(16).toString("base64");
    const pathName = (this.url.pathname || "/") + (this.url.search || "");

    this.socket.write([
      "GET " + pathName + " HTTP/1.1",
      "Host: " + this.url.host,
      "Upgrade: websocket",
      "Connection: Upgrade",
      "Sec-WebSocket-Key: " + key,
      "Sec-WebSocket-Version: 13",
      "",
      ""
    ].join("\r\n"));
  }

  onData(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);

    if (!this.handshakeDone) {
      const marker = this.buffer.indexOf("\r\n\r\n");
      if (marker === -1) return;

      const head = this.buffer.slice(0, marker).toString("utf8");
      this.buffer = this.buffer.slice(marker + 4);

      if (!/^HTTP\/1\.1 101/i.test(head)) {
        this.emit("error", new Error("WebSocket handshake failed: " + head));
        this.socket.destroy();
        return;
      }

      this.handshakeDone = true;
      this.opened = true;
      this.emit("open");
    }

    this.readFrames();
  }

  readFrames() {
    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      const opcode = first & 15;
      const masked = !!(second & 128);
      let offset = 2;
      let length = second & 127;

      if (length === 126) {
        if (this.buffer.length < offset + 2) return;
        length = this.buffer.readUInt16BE(offset);
        offset += 2;
      } else if (length === 127) {
        if (this.buffer.length < offset + 8) return;
        const high = this.buffer.readUInt32BE(offset);
        const low = this.buffer.readUInt32BE(offset + 4);
        length = high * 4294967296 + low;
        offset += 8;
      }

      let mask = null;

      if (masked) {
        if (this.buffer.length < offset + 4) return;
        mask = this.buffer.slice(offset, offset + 4);
        offset += 4;
      }

      if (this.buffer.length < offset + length) return;

      let payload = this.buffer.slice(offset, offset + length);
      this.buffer = this.buffer.slice(offset + length);

      if (masked) payload = this.unmask(payload, mask);

      if (opcode === 1) {
        this.emit("message", payload.toString("utf8"));
      } else if (opcode === 8) {
        this.close();
        return;
      } else if (opcode === 9) {
        this.sendFrame(10, payload);
      }
    }
  }

  unmask(payload, mask) {
    const out = Buffer.alloc(payload.length);
    for (let i = 0; i < payload.length; i++) out[i] = payload[i] ^ mask[i % 4];
    return out;
  }

  send(data) {
    this.sendFrame(1, Buffer.from(String(data), "utf8"));
  }

  sendFrame(opcode, payload) {
    if (!this.socket || !this.opened) return;

    const length = payload.length;
    let header;

    if (length < 126) {
      header = Buffer.alloc(2);
      header[1] = 128 | length;
    } else if (length < 65536) {
      header = Buffer.alloc(4);
      header[1] = 128 | 126;
      header.writeUInt16BE(length, 2);
    } else {
      header = Buffer.alloc(10);
      header[1] = 128 | 127;
      header.writeUInt32BE(0, 2);
      header.writeUInt32BE(length, 6);
    }

    header[0] = 128 | opcode;

    const mask = crypto.randomBytes(4);
    const masked = Buffer.alloc(payload.length);

    for (let i = 0; i < payload.length; i++) masked[i] = payload[i] ^ mask[i % 4];

    this.socket.write(Buffer.concat([header, mask, masked]));
  }

  close() {
    this.opened = false;
    try { this.sendFrame(8, Buffer.alloc(0)); } catch (e) {}
    try { this.socket.end(); } catch (e) {}
  }
}

/**
 * B"H
 * Main local tunnel runtime.
 */
class TunnelRuntime extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.connected = false;
    this.started = false;
    this.lastError = "";
  }

  status() {
    const config = loadConfig();
    return {
      started: this.started,
      connected: this.connected,
      lastError: this.lastError,
      tunnelName: config.tunnelName,
      root: config.root,
      allowWrite: config.allowWrite,
      allowSecrets: config.allowSecrets,
      relay: config.relay,
      local: config.local,
      logs: logLines.slice(-100)
    };
  }

  start() {
    if (this.started) return;
    this.started = true;
    this.connect();
  }

  stop() {
    this.started = false;
    this.connected = false;
    if (this.ws) this.ws.close();
    this.ws = null;
    log("Tunnel stopped.");
  }

  restart() {
    this.stop();
    setTimeout(() => this.start(), 350);
  }

  connect() {
    if (!this.started) return;

    const config = loadConfig();
    const ws = new TinyWebSocket(config.relay);
    let tunnelQueue = Promise.resolve();
    this.ws = ws;

    ws.on("open", () => {
      this.connected = true;
      this.lastError = "";

      ws.send(JSON.stringify(nativeRegistrationPacket(config)));

      log("Tunnel connected:", config.tunnelName, "root:", config.root);
      this.emit("change");
    });

    ws.on("message", msg => {
      const data = JSON.parse(msg);
      if (data.type !== "TUNNEL_REQUEST") return;
      tunnelQueue = tunnelQueue.then(() => answerTunnelRequest(config, ws, data)).catch(error => {
        log("Tunnel FIFO handler error:", error.message);
      });
    });

    async function answerTunnelRequest(currentConfig, currentWs, data) {
      try {
        if (data.payload && data.payload.kind === "fs") {
          const result = await handleFs(currentConfig, data.payload);
          currentWs.send(JSON.stringify({ type: "TUNNEL_RESPONSE", id: data.id, controlRequestId: data.payload?.controlRequestId, ...result }));
          return;
        }

        if (currentConfig.enableLocalHttpProxy) {
          proxyLocalHttp(currentConfig, data, currentWs);
        } else {
          currentWs.send(JSON.stringify({
            type: "TUNNEL_RESPONSE",
            id: data.id,
            controlRequestId: data.payload?.controlRequestId,
            ok: false,
            status: 403,
            error: "Local HTTP proxy disabled."
          }));
        }
      } catch (e) {
        currentWs.send(JSON.stringify({
          type: "TUNNEL_RESPONSE",
          id: data.id,
          controlRequestId: data.payload?.controlRequestId,
          ok: false,
          status: 500,
          error: e.message,
          stack: e.stack
        }));
      }
    }

    ws.on("close", () => {
      this.connected = false;
      log("Tunnel closed.");
      this.emit("change");

      if (this.started) {
        setTimeout(() => this.connect(), 2000);
      }
    });

    ws.on("error", err => {
      this.connected = false;
      this.lastError = err.message;
      log("Tunnel error:", err.message);
      this.emit("change");
    });

    ws.connect();
  }
}

const runtime = new TunnelRuntime();

/**
 * B"H
 * Path helpers.
 */
function safePath(config, given) {
  const root = path.resolve(config.root);
  const input = given || ".";
  const full = path.isAbsolute(input) ? path.resolve(input) : path.resolve(root, input);

  if (!full.toLowerCase().startsWith(root.toLowerCase())) {
    throw new Error("Path outside allowed project root: " + full);
  }

  return full;
}

function rel(config, full) {
  return path.relative(config.root, full).replace(/\\/g, "/") || ".";
}

function assertNotSecret(config, full) {
  if (config.allowSecrets) return;
  const name = path.basename(full);
  if (SECRET_FILES.has(name)) throw new Error("Refusing secret-like file by default: " + name);
}

async function listDir(config, p) {
  if (!config.tools.fsList) throw new Error("fsList disabled.");
  const full = safePath(config, p);
  const entries = await fsp.readdir(full, { withFileTypes: true });

  return entries
    .filter(e => !SKIP.has(e.name))
    .filter(e => config.allowSecrets || !SECRET_FILES.has(e.name))
    .map(e => e.isDirectory() ? e.name + "/" : e.name);
}

async function treeText(config, p, depth, limit, state = { count: 0 }, prefix = "") {
  if (!config.tools.fsTree) throw new Error("fsTree disabled.");
  const full = safePath(config, p);
  const stat = await fsp.stat(full);
  const name = path.basename(full) || rel(config, full);

  if (state.count++ >= limit) return prefix + "...limit reached";
  if (!stat.isDirectory()) return prefix + name;

  let out = prefix + name + "/";
  if (depth <= 0) return out;

  const entries = await fsp.readdir(full, { withFileTypes: true });

  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    if (!config.allowSecrets && SECRET_FILES.has(e.name)) continue;
    const childRel = path.join(rel(config, full), e.name);
    out += "\n" + await treeText(config, childRel, depth - 1, limit, state, prefix + "  ");
  }

  return out;
}

async function readText(config, p, maxChars = 12000) {
  if (!config.tools.fsRead) throw new Error("fsRead disabled.");
  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();

  assertNotSecret(config, full);

  if (BIN.has(ext)) throw new Error("Refusing binary file as text: " + ext);

  const text = await fsp.readFile(full, "utf8");
  const truncated = text.length > maxChars;

  return {
    content: truncated ? text.slice(0, maxChars) : text,
    truncated
  };
}

async function writeText(config, p, content) {
  if (!config.tools.fsWrite) throw new Error("fsWrite disabled.");
  if (!config.allowWrite) throw new Error("Writes disabled.");
  const full = safePath(config, p);

  assertNotSecret(config, full);

  await fsp.mkdir(path.dirname(full), { recursive: true });
  await fsp.writeFile(full, content || "", "utf8");

  return {
    path: p,
    bytes: Buffer.byteLength(content || "")
  };
}

function normalizeWrites(payload) {
  if (Array.isArray(payload.writes)) {
    return payload.writes
      .filter(x => x && x.path)
      .map(x => ({ path: x.path, content: String(x.content || "") }));
  }

  if (payload.files && typeof payload.files === "object") {
    return Object.entries(payload.files).map(([filePath, content]) => ({
      path: filePath,
      content: String(content || "")
    }));
  }

  return [];
}

async function handleFs(config, payload) {
  const action = payload.action || "list";
  const p = payload.path || ".";
  const maxChars = Number(payload.maxChars || 12000);

  const actions = {
    async list() {
      return { ok: true, action, path: p, items: await listDir(config, p) };
    },

    async tree() {
      return {
        ok: true,
        action,
        path: p,
        treeText: await treeText(config, p, Number(payload.depth || 2), Number(payload.limit || 150))
      };
    },

    async read() {
      const got = await readText(config, p, maxChars);
      return { ok: true, action, path: p, ...got };
    },

    async md() {
      const got = await readText(config, p, maxChars);
      const lang = path.extname(p).replace(".", "");
      return { ok: true, action, path: p, content: "```" + lang + "\n" + got.content + "\n```", truncated: got.truncated };
    },

    async bulk() {
      if (!config.tools.fsBulk) throw new Error("fsBulk disabled.");
      const files = {};
      for (const one of payload.paths || []) {
        try {
          files[one] = await readText(config, one, maxChars);
        } catch (e) {
          files[one] = { error: e.message };
        }
      }
      return { ok: true, action, files };
    },

    async write() {
      const content = payload.content !== undefined ? payload.content : payload.text;
      const wrote = await writeText(config, p, content ?? "");
      return { ok: true, action, ...wrote };
    },

    async bulkWrite() {
      if (!config.tools.fsBulk) throw new Error("fsBulk disabled.");
      const writes = normalizeWrites(payload);
      const results = {};
      for (const one of writes) {
        try {
          results[one.path] = await writeText(config, one.path, one.content);
        } catch (e) {
          results[one.path] = { error: e.message };
        }
      }
      return { ok: true, action, count: writes.length, results };
    }
  };

  if (!actions[action]) return { ok: false, status: 400, error: "Unknown action: " + action };

  return await actions[action]();
}

function proxyLocalHttp(config, data, ws) {
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
      ws.send(JSON.stringify({
        type: "TUNNEL_RESPONSE",
        id: data.id,
        controlRequestId: data.payload?.controlRequestId,
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks).toString("base64")
      }));
    });
  });

  req.on("error", err => {
    ws.send(JSON.stringify({
      type: "TUNNEL_RESPONSE",
      id: data.id,
      controlRequestId: data.payload?.controlRequestId,
      status: 502,
      headers: { "content-type": "text/plain" },
      body: Buffer.from(err.message).toString("base64")
    }));
  });

  if (body) req.write(body);
  req.end();
}

/**
 * B"H
 * Runs Chrome in remote debug mode if enabled.
 *
 * @returns {object} Launch result.
 */
function launchChromeDebug() {
  const config = loadConfig();

  if (!config.enableChromeDebugTools && !config.tools.browserDebug) {
    return { ok: false, error: "Chrome debug tools disabled." };
  }

  const userDir = path.join(ROOT, "chrome-debug-profile");
  const args = [
    "--remote-debugging-port=9222",
    "--user-data-dir=" + userDir,
    "about:blank"
  ];

  const candidates = process.platform === "win32"
    ? [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
      ]
    : process.platform === "darwin"
      ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
      : ["google-chrome", "chromium", "chromium-browser"];

  for (const bin of candidates) {
    try {
      const child = childProcess.spawn(bin, args, {
        detached: true,
        stdio: "ignore"
      });
      child.unref();
      return { ok: true, command: bin, port: 9222 };
    } catch (e) {}
  }

  return { ok: false, error: "Chrome executable not found." };
}

/**
 * B"H
 * HTML UI.
 */
function htmlPage() {
  return String.raw`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Awtsmoos Local Tunnel Control</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root{--bg:#070913;--panel:rgba(255,255,255,.075);--panel2:rgba(255,255,255,.12);--text:#f6f7ff;--muted:#b7bdd2;--line:rgba(255,255,255,.16);--a:#8bd3ff;--b:#d7a7ff;--bad:#ffb4b4;--good:#b9ffd8}
    *{box-sizing:border-box} body{margin:0;background:radial-gradient(circle at 10% 0%,rgba(139,211,255,.22),transparent 35%),radial-gradient(circle at 90% 0%,rgba(215,167,255,.20),transparent 30%),linear-gradient(135deg,#070913,#11182d);color:var(--text);font-family:system-ui,-apple-system,Segoe UI,sans-serif}
    .wrap{width:min(1180px,calc(100% - 26px));margin:auto;padding:30px 0 70px}.hero,.card{border:1px solid var(--line);background:var(--panel);border-radius:26px;box-shadow:0 24px 90px rgba(0,0,0,.35);backdrop-filter:blur(16px)}
    .hero{padding:38px;margin-bottom:18px;overflow:hidden}.eyebrow{color:var(--a);font-size:12px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;margin:0 0 9px}h1{font-size:clamp(38px,7vw,78px);line-height:.95;letter-spacing:-.07em;margin:0}h2{margin:0;font-size:28px;letter-spacing:-.04em}.lead{max-width:760px;color:var(--muted);font-size:19px;line-height:1.55}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.card{padding:22px}.full{grid-column:1/-1}.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.status{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:999px;padding:9px 12px;font-weight:800}.dot{width:10px;height:10px;border-radius:50%;background:var(--bad);box-shadow:0 0 18px var(--bad)}.online .dot{background:var(--good);box-shadow:0 0 18px var(--good)}
    label{display:grid;gap:7px;margin:12px 0;color:var(--muted);font-weight:750}input,textarea{width:100%;border:1px solid var(--line);border-radius:15px;padding:12px 13px;background:rgba(0,0,0,.28);color:var(--text);font:inherit}textarea{min-height:120px}
    button{border:1px solid var(--line);border-radius:14px;padding:11px 14px;background:var(--panel2);color:var(--text);font:inherit;font-weight:850;cursor:pointer}.primary{background:linear-gradient(135deg,var(--a),var(--b));color:#08111f;border:0}.danger{color:#250909;background:#ffb4b4;border:0}.small{font-size:13px;padding:8px 10px}
    pre{white-space:pre-wrap;overflow:auto;background:rgba(0,0,0,.32);border:1px solid var(--line);border-radius:16px;padding:14px;color:#eaf3ff;min-height:90px}.muted{color:var(--muted)}.checks{display:grid;grid-template-columns:1fr 1fr;gap:8px}.check{display:flex;gap:8px;align-items:center;color:var(--muted);font-weight:700}.check input{width:auto}.tabs{display:flex;gap:8px;flex-wrap:wrap;margin:13px 0}.tab{border-radius:999px}.tab.on{background:#fff;color:#070913}.hide{display:none}@media(max-width:850px){.grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <p class="eyebrow">B"H • Awtsmoos Local Control</p>
      <h1>Your tunnel command center.</h1>
      <p class="lead">Choose a project root, start or stop the tunnel, test reads and writes, copy Custom GPT instructions, and control which local powers are enabled.</p>
      <div class="row">
        <span id="pill" class="status"><span class="dot"></span><span id="statusText">Checking...</span></span>
        <button class="primary" id="startBtn">Start Tunnel</button>
        <button id="stopBtn">Stop</button>
        <button id="restartBtn">Restart</button>
      </div>
    </section>

    <div class="grid">
      <section class="card">
        <p class="eyebrow">Setup</p>
        <h2>Config</h2>
        <label>Tunnel name<input id="tunnelName"></label>
        <label>Project root<input id="root"></label>
        <label>Local HTTP app<input id="local"></label>
        <label>Relay<input id="relay"></label>
        <div class="checks">
          <label class="check"><input type="checkbox" id="allowWrite"> allow write</label>
          <label class="check"><input type="checkbox" id="allowSecrets"> allow secret files</label>
          <label class="check"><input type="checkbox" id="enableLocalHttpProxy"> local HTTP proxy</label>
          <label class="check"><input type="checkbox" id="enableChromeDebugTools"> chrome debug tools</label>
        </div>
        <div class="row">
          <button class="primary" id="saveBtn">Save Config</button>
          <button id="saveStartBtn">Save + Restart</button>
        </div>
      </section>

      <section class="card">
        <p class="eyebrow">Tools</p>
        <h2>Enabled actions</h2>
        <div class="checks">
          <label class="check"><input type="checkbox" id="tool_fsList"> fs list</label>
          <label class="check"><input type="checkbox" id="tool_fsTree"> fs tree</label>
          <label class="check"><input type="checkbox" id="tool_fsRead"> fs read</label>
          <label class="check"><input type="checkbox" id="tool_fsWrite"> fs write</label>
          <label class="check"><input type="checkbox" id="tool_fsBulk"> fs bulk</label>
          <label class="check"><input type="checkbox" id="tool_httpProxy"> http proxy</label>
          <label class="check"><input type="checkbox" id="tool_browserDebug"> browser debug</label>
        </div>
        <div class="row">
          <button id="chromeBtn">Open Chrome Debug</button>
          <button id="copyPromptBtn">Copy GPT Prompt</button>
        </div>
      </section>

      <section class="card full">
        <p class="eyebrow">Test</p>
        <h2>Local tunnel tests</h2>
        <div class="row">
          <button id="testListBtn">Test list .</button>
          <button id="testTreeBtn">Test tree .</button>
          <button id="testReadBtn">Test read package.json</button>
          <button id="testWriteBtn">Test write debugging/tunnel-test.txt</button>
        </div>
        <pre id="testOut">Ready.</pre>
      </section>

      <section class="card">
        <p class="eyebrow">Custom GPT</p>
        <h2>Instructions</h2>
        <textarea id="customInstructions"></textarea>
        <div class="row">
          <button id="saveInstructionsBtn">Save Instructions</button>
        </div>
        <pre id="gptPrompt"></pre>
      </section>

      <section class="card">
        <p class="eyebrow">Logs</p>
        <h2>Status stream</h2>
        <pre id="logs">Loading...</pre>
      </section>
    </div>
  </div>

<script>
const $ = id => document.getElementById(id);

async function api(path, data) {
  const opts = data ? {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  } : {};
  const r = await fetch(path, opts);
  return await r.json();
}

function gptPrompt(c) {
  return [
    'B"H',
    '',
    'Use my Awtsmoos tunnel.',
    '',
    'tunnelName: ' + c.tunnelName,
    'project path: .',
    'targetVessel: native-local',
    'conversationName: choose a short stable task name and send it on every action.',
    'Route memory: once you successfully call this concrete tunnel with conversationName, later calls in the same conversation may use tunnelName auto and will stay on the selected native tunnel. To switch, explicitly call a different tunnel or targetVessel.',
    '',
    'Start by listing the project folder with targetVessel native-local.',
    'Then inspect package.json, README files, and the main entry files.',
    'Do not read node_modules, .git, dist, build, .next, coverage, or private secret files.',
    'If you need to edit, explain the file changes first.',
    'After building or fixing a visible app, create a preview through previewExposeLocalServer, previewFile, previewFolder, or previewPage and return the verified viewUrl.',
    '',
    'Custom instructions:',
    c.customInstructions || '(none)'
  ].join("\\n");
}

function pullConfigFromForm() {
  return {
    tunnelName: $("tunnelName").value,
    root: $("root").value,
    local: $("local").value,
    relay: $("relay").value,
    allowWrite: $("allowWrite").checked,
    allowSecrets: $("allowSecrets").checked,
    enableLocalHttpProxy: $("enableLocalHttpProxy").checked,
    enableChromeDebugTools: $("enableChromeDebugTools").checked,
    customInstructions: $("customInstructions").value,
    tools: {
      fsList: $("tool_fsList").checked,
      fsTree: $("tool_fsTree").checked,
      fsRead: $("tool_fsRead").checked,
      fsWrite: $("tool_fsWrite").checked,
      fsBulk: $("tool_fsBulk").checked,
      httpProxy: $("tool_httpProxy").checked,
      browserDebug: $("tool_browserDebug").checked
    }
  };
}

function pushConfigToForm(c) {
  $("tunnelName").value = c.tunnelName || "";
  $("root").value = c.root || "";
  $("local").value = c.local || "";
  $("relay").value = c.relay || "";
  $("allowWrite").checked = !!c.allowWrite;
  $("allowSecrets").checked = !!c.allowSecrets;
  $("enableLocalHttpProxy").checked = !!c.enableLocalHttpProxy;
  $("enableChromeDebugTools").checked = !!c.enableChromeDebugTools;
  $("customInstructions").value = c.customInstructions || "";
  $("tool_fsList").checked = c.tools?.fsList !== false;
  $("tool_fsTree").checked = c.tools?.fsTree !== false;
  $("tool_fsRead").checked = c.tools?.fsRead !== false;
  $("tool_fsWrite").checked = c.tools?.fsWrite !== false;
  $("tool_fsBulk").checked = c.tools?.fsBulk !== false;
  $("tool_httpProxy").checked = c.tools?.httpProxy !== false;
  $("tool_browserDebug").checked = !!c.tools?.browserDebug;
  $("gptPrompt").textContent = gptPrompt(c);
}

async function refresh() {
  const s = await api("/api/status");
  const c = s.config;
  pushConfigToForm(c);

  $("pill").classList.toggle("online", !!s.tunnel.connected);
  $("statusText").textContent = s.tunnel.connected ? "Connected" : (s.tunnel.started ? "Reconnecting" : "Stopped");
  $("logs").textContent = (s.tunnel.logs || []).join("\\n") || "No logs yet.";
}

async function save() {
  const out = await api("/api/config", pullConfigFromForm());
  pushConfigToForm(out.config);
  return out;
}

$("saveBtn").onclick = async () => { await save(); await refresh(); };
$("saveStartBtn").onclick = async () => { await save(); await api("/api/restart", {}); await refresh(); };
$("startBtn").onclick = async () => { await api("/api/start", {}); await refresh(); };
$("stopBtn").onclick = async () => { await api("/api/stop", {}); await refresh(); };
$("restartBtn").onclick = async () => { await api("/api/restart", {}); await refresh(); };
$("saveInstructionsBtn").onclick = async () => { await save(); await refresh(); };
$("copyPromptBtn").onclick = async () => { await navigator.clipboard.writeText($("gptPrompt").textContent); };
$("chromeBtn").onclick = async () => { $("testOut").textContent = JSON.stringify(await api("/api/chrome", {}), null, 2); };

$("testListBtn").onclick = async () => {
  $("testOut").textContent = JSON.stringify(await api("/api/test", { action: "list", path: "." }), null, 2);
};

$("testTreeBtn").onclick = async () => {
  $("testOut").textContent = JSON.stringify(await api("/api/test", { action: "tree", path: ".", depth: 2, limit: 100 }), null, 2);
};

$("testReadBtn").onclick = async () => {
  $("testOut").textContent = JSON.stringify(await api("/api/test", { action: "read", path: "package.json" }), null, 2);
};

$("testWriteBtn").onclick = async () => {
  $("testOut").textContent = JSON.stringify(await api("/api/test", {
    action: "write",
    path: "debugging/tunnel-test.txt",
    content: 'B"H\\nTunnel write test at ' + new Date().toISOString() + "\\n"
  }), null, 2);
};

setInterval(refresh, 2500);
refresh();
</script>
</body>
</html>`;
}

/**
 * B"H
 * Local server API.
 */
async function handleApi(req, res, pathname) {
  if (pathname === "/api/status") {
    return sendJson(res, {
      ok: true,
      config: loadConfig(),
      tunnel: runtime.status()
    });
  }

  if (pathname === "/api/config" && req.method === "POST") {
    const body = JSON.parse(await readBody(req) || "{}");
    const config = saveConfig(body);
    return sendJson(res, { ok: true, config });
  }

  if (pathname === "/api/start" && req.method === "POST") {
    runtime.start();
    return sendJson(res, { ok: true, tunnel: runtime.status() });
  }

  if (pathname === "/api/stop" && req.method === "POST") {
    runtime.stop();
    return sendJson(res, { ok: true, tunnel: runtime.status() });
  }

  if (pathname === "/api/restart" && req.method === "POST") {
    runtime.restart();
    return sendJson(res, { ok: true, tunnel: runtime.status() });
  }

  if (pathname === "/api/chrome" && req.method === "POST") {
    return sendJson(res, launchChromeDebug());
  }

  if (pathname === "/api/test" && req.method === "POST") {
    const body = JSON.parse(await readBody(req) || "{}");
    const config = loadConfig();

    try {
      const result = await handleFs(config, {
        kind: "fs",
        action: body.action,
        path: body.path,
        depth: body.depth,
        limit: body.limit,
        content: body.content
      });

      return sendJson(res, result);
    } catch (e) {
      return sendJson(res, { ok: false, error: e.message, stack: e.stack }, 500);
    }
  }

  return sendJson(res, { ok: false, error: "Unknown API route: " + pathname }, 404);
}

/**
 * B"H
 * Starts local control server.
 */
async function main() {
  fs.mkdirSync(ROOT, { recursive: true });

  if (!fs.existsSync(CONFIG_PATH)) {
    writeJson(CONFIG_PATH, loadConfig());
  }

  const port = await findPort(3967);

  const server = http.createServer(async (req, res) => {
    try {
      const u = new URL(req.url, "http://127.0.0.1:" + port);

      if (u.pathname.startsWith("/api/")) {
        return await handleApi(req, res, u.pathname);
      }

      return sendText(res, htmlPage(), "text/html; charset=utf-8");
    } catch (e) {
      return sendJson(res, { ok: false, error: e.message, stack: e.stack }, 500);
    }
  });

  server.listen(port, "127.0.0.1", () => {
    const url = "http://127.0.0.1:" + port + "/";
    log("Local control panel:", url);
    openBrowser(url);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
