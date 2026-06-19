
// B"H
// Awtsmoos Tunnel Client with custom WebSocket implementation.

const fs = require("fs/promises");
const path = require("path");
const http = require("http");
const https = require("https");
const os = require("os");
const net = require("net");
const tls = require("tls");
const crypto = require("crypto");
const EventEmitter = require("events");

const HOME = os.homedir();
const CONFIG_PATH = path.join(HOME, ".awtsmoos-tunnel", "config.json");
const DEFAULT_RELAY = "wss://awtsmoos.com";

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
 * Tiny custom WebSocket client.
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
    const host = this.url.host;

    this.socket.write([
      "GET " + pathName + " HTTP/1.1",
      "Host: " + host,
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

    for (let i = 0; i < payload.length; i++) {
      out[i] = payload[i] ^ mask[i % 4];
    }

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

    for (let i = 0; i < payload.length; i++) {
      masked[i] = payload[i] ^ mask[i % 4];
    }

    this.socket.write(Buffer.concat([header, mask, masked]));
  }

  close() {
    this.opened = false;

    try {
      this.sendFrame(8, Buffer.alloc(0));
    } catch {}

    try {
      this.socket.end();
    } catch {}
  }
}

/**
 * B"H
 * Reads config JSON and strips BOM if Windows ever put one there.
 */
async function readConfig() {
  const text = (await fs.readFile(CONFIG_PATH, "utf8")).replace(/^\uFEFF/, "");
  const config = JSON.parse(text);

  return {
    relay: config.relay || DEFAULT_RELAY,
    tunnelName: config.tunnelName || "my-local",
    local: config.local || "http://localhost:3000",
    root: config.root || process.cwd(),
    allowWrite: !!config.allowWrite,
    allowSecrets: !!config.allowSecrets
  };
}

/**
 * B"H
 * Chapter 480: Even the small client received a passport.
 *
 * The relay must never guess whether this is a hosted Virtual OS, browser
 * storage, or the user's native machine. The old lightweight client therefore
 * declares its vessel identity in data before any request begins its journey.
 *
 * @param {object} config Local client config.
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
    capabilities: {
      vesselType: "native-local",
      targetVessel: "local-tunnel",
      fsList: true,
      fsTree: true,
      fsRead: true,
      fsWrite: config.allowWrite !== false,
      fsBulk: true,
      httpProxy: true,
      storage: "native-filesystem"
    },
    tools: { fsList: true, fsTree: true, fsRead: true, fsWrite: config.allowWrite !== false, fsBulk: true, httpProxy: true }
  };
}

function safePath(config, given) {
  const root = path.resolve(config.root);
  const input = given || ".";
  const full = path.isAbsolute(input)
    ? path.resolve(input)
    : path.resolve(root, input);

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

  if (SECRET_FILES.has(name)) {
    throw new Error("Refusing secret-like file by default: " + name);
  }
}

async function listDir(config, p) {
  const full = safePath(config, p);
  const entries = await fs.readdir(full, { withFileTypes: true });

  return entries
    .filter(e => !SKIP.has(e.name))
    .filter(e => config.allowSecrets || !SECRET_FILES.has(e.name))
    .map(e => e.isDirectory() ? e.name + "/" : e.name);
}

async function treeText(config, p, depth, limit, state = { count: 0 }, prefix = "") {
  const full = safePath(config, p);
  const stat = await fs.stat(full);
  const name = path.basename(full) || rel(config, full);

  if (state.count++ >= limit) return prefix + "...limit reached";
  if (!stat.isDirectory()) return prefix + name;

  let out = prefix + name + "/";

  if (depth <= 0) return out;

  const entries = await fs.readdir(full, { withFileTypes: true });

  for (const e of entries) {
    if (SKIP.has(e.name)) continue;
    if (!config.allowSecrets && SECRET_FILES.has(e.name)) continue;

    const childRel = path.join(rel(config, full), e.name);
    out += "\n" + await treeText(config, childRel, depth - 1, limit, state, prefix + "  ");
  }

  return out;
}

async function readText(config, p, maxChars = 12000) {
  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();

  assertNotSecret(config, full);

  if (BIN.has(ext)) {
    throw new Error("Refusing to read binary file as text: " + ext);
  }

  const text = await fs.readFile(full, "utf8");
  const truncated = text.length > maxChars;

  return {
    content: truncated ? text.slice(0, maxChars) : text,
    truncated
  };
}

async function writeText(config, p, content) {
  if (!config.allowWrite) {
    throw new Error("Writes disabled in config.json.");
  }

  const full = safePath(config, p);

  assertNotSecret(config, full);

  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, content || "", "utf8");

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
    return Object.entries(payload.files)
      .map(([filePath, content]) => ({
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
      return {
        ok: true,
        action,
        path: p,
        content: "```" + lang + "\n" + got.content + "\n```",
        truncated: got.truncated
      };
    },

    async bulk() {
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
      const writes = normalizeWrites(payload);
      const results = {};

      for (const one of writes) {
        try {
          results[one.path] = await writeText(config, one.path, one.content);
        } catch (e) {
          results[one.path] = { error: e.message };
        }
      }

      return {
        ok: true,
        action,
        count: writes.length,
        results
      };
    }
  };

  if (!actions[action]) {
    return { ok: false, status: 400, error: "Unknown action: " + action };
  }

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
      status: 502,
      headers: { "content-type": "text/plain" },
      body: Buffer.from(err.message).toString("base64")
    }));
  });

  if (body) req.write(body);
  req.end();
}

async function connect() {
  const config = await readConfig();
  const ws = new TinyWebSocket(config.relay);

  ws.on("open", () => {
    ws.send(JSON.stringify(nativeRegistrationPacket(config)));

    console.log('B"H Awtsmoos tunnel connected.');
    console.log("Tunnel name:", config.tunnelName);
    console.log("Project root:", config.root);
    console.log("Writes:", config.allowWrite ? "enabled" : "disabled");
  });

  ws.on("message", async msg => {
    const data = JSON.parse(msg);

    if (data.type !== "TUNNEL_REQUEST") return;

    try {
      if (data.payload && data.payload.kind === "fs") {
        const result = await handleFs(config, data.payload);
        ws.send(JSON.stringify({ type: "TUNNEL_RESPONSE", id: data.id, ...result }));
        return;
      }

      proxyLocalHttp(config, data, ws);
    } catch (e) {
      ws.send(JSON.stringify({
        type: "TUNNEL_RESPONSE",
        id: data.id,
        ok: false,
        status: 500,
        error: e.message,
        stack: e.stack
      }));
    }
  });

  ws.on("close", () => {
    console.log("Tunnel closed. Reconnecting in 2 seconds...");
    setTimeout(() => connect().catch(console.error), 2000);
  });

  ws.on("error", err => {
    console.log("Tunnel socket error:", err.message);
  });

  ws.connect();
}

connect().catch(err => {
  console.error(err);
  process.exit(1);
});
