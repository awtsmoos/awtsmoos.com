
// B"H
// Awtsmoos quiet local agent.
// Hosted control panel: https://awtsmoos.com/apps/tunnel-control

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const os = require("os");
const net = require("net");
const tls = require("tls");
const http = require("http");
const https = require("https");
const crypto = require("crypto");
const childProcess = require("child_process");
const EventEmitter = require("events");

const HOME = os.homedir();
const ROOT = path.join(HOME, ".awtsmoos-tunnel");
const CONFIG_PATH = path.join(ROOT, "config.json");
const LOG_PATH = path.join(ROOT, "logs.txt");

const SKIP = new Set(["node_modules", ".git", ".DS_Store", "dist", "build", ".next", "coverage"]);
const SECRET_FILES = new Set([".env", ".env.local", ".env.production", ".npmrc", "id_rsa", "id_dsa", "id_ed25519", "credentials.json"]);
const BIN = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".zip", ".exe", ".dll", ".so", ".node", ".woff", ".woff2", ".ttf", ".mp4", ".mov", ".mp3"]);

function log(...parts) {
  const line = "[" + new Date().toISOString() + "] " + parts.join(" ");
  console.log(line);
  try {
    fs.mkdirSync(ROOT, { recursive: true });
    fs.appendFileSync(LOG_PATH, line + "\n", "utf8");
  } catch (e) {}
}

function defaultTunnelName() {
  const user = String(os.userInfo().username || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "user";

  return "awt-" + user + "-" + Math.floor(1000 + Math.random() * 9000);
}

function readJson(file, fallback) {
  try {
    const text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    return JSON.parse(text);
  } catch (e) {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function normalizeConfig(old) {
  return {
    relay: old?.relay || "wss://awtsmoos.com",
    tunnelName: old?.tunnelName || defaultTunnelName(),
    local: old?.local || "http://localhost:3000",
    root: old?.root || process.cwd(),
    allowWrite: old?.allowWrite !== false,
    allowSecrets: !!old?.allowSecrets,
    enableLocalHttpProxy: old?.enableLocalHttpProxy !== false,
    tools: {
      fsList: old?.tools?.fsList !== false,
      fsTree: old?.tools?.fsTree !== false,
      fsRead: old?.tools?.fsRead !== false,
      fsWrite: old?.tools?.fsWrite !== false,
      fsBulk: old?.tools?.fsBulk !== false,
      httpProxy: old?.tools?.httpProxy !== false
    }
  };
}

function loadConfig() {
  const old = readJson(CONFIG_PATH, null);
  const cfg = normalizeConfig(old);
  if (!old) writeJson(CONFIG_PATH, cfg);
  return cfg;
}

function saveConfigPatch(patch) {
  const current = loadConfig();
  const next = normalizeConfig({
    ...current,
    ...patch,
    tools: {
      ...current.tools,
      ...(patch.tools || {})
    }
  });

  writeJson(CONFIG_PATH, next);
  return next;
}

function openHostedControl(config) {
  const url =
    "https://awtsmoos.com/apps/tunnel-control" +
    "?tunnelName=" + encodeURIComponent(config.tunnelName);

  try {
    if (process.platform === "win32") {
      childProcess.spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
    } else if (process.platform === "darwin") {
      childProcess.spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
    } else {
      childProcess.spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
    }
  } catch (e) {
    log("Could not open browser:", e.message);
  }
}

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
    const secure = this.url.protocol === "wss:";
    const port = Number(this.url.port || (secure ? 443 : 80));
    const host = this.url.hostname;

    this.socket = secure
      ? tls.connect({ host, port, servername: host }, () => this.sendHandshake())
      : net.connect({ host, port }, () => this.sendHandshake());

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

function safePath(config, given) {
  const root = path.resolve(config.root);
  const input = given || root;
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

function itemKind(entry) {
  if (entry.isDirectory()) return "directory";
  if (entry.isFile()) return "file";
  if (entry.isSymbolicLink()) return "link";
  return "other";
}

async function listDirDetailed(config, p) {
  if (!config.tools.fsList) throw new Error("fsList disabled.");
  const full = safePath(config, p);
  const entries = await fsp.readdir(full, { withFileTypes: true });

  const items = entries
    .filter(e => !SKIP.has(e.name))
    .filter(e => config.allowSecrets || !SECRET_FILES.has(e.name))
    .slice(0, 250)
    .map(e => {
      const child = path.join(full, e.name);
      return {
        name: e.name,
        type: itemKind(e),
        path: rel(config, child),
        absolutePath: child,
        isDirectory: e.isDirectory()
      };
    });

  items.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return items;
}

async function listDir(config, p) {
  const detailed = await listDirDetailed(config, p);
  return detailed.map(x => x.isDirectory ? x.name + "/" : x.name);
}

async function treeText(config, p, depth, limit, state = { count: 0 }, prefix = "") {
  if (!config.tools.fsTree) throw new Error("fsTree disabled.");

  depth = Math.min(Number(depth || 2), 4);
  limit = Math.min(Number(limit || 150), 600);

  const full = safePath(config, p);
  const stat = await fsp.stat(full);
  const name = path.basename(full) || rel(config, full);

  if (state.count++ >= limit) return prefix + "...limit reached";
  if (!stat.isDirectory()) return prefix + name;

  let out = prefix + name + "/";
  if (depth <= 0) return out;

  const entries = await fsp.readdir(full, { withFileTypes: true });

  for (const e of entries.slice(0, 120)) {
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
    absolutePath: full,
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

function driveRoots() {
  if (process.platform !== "win32") {
    return ["/", HOME];
  }

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return letters
    .map(letter => letter + ":\\")
    .filter(root => {
      try {
        fs.accessSync(root);
        return true;
      } catch (e) {
        return false;
      }
    });
}

function publicConfig(config) {
  return {
    tunnelName: config.tunnelName,
    relay: config.relay,
    local: config.local,
    root: config.root,
    allowWrite: config.allowWrite,
    allowSecrets: config.allowSecrets,
    enableLocalHttpProxy: config.enableLocalHttpProxy,
    tools: config.tools,
    platform: process.platform,
    hostname: os.hostname(),
    home: HOME,
    roots: driveRoots()
  };
}

async function handleFs(config, payload, ws) {
  const action = payload.action || "list";
  const p = payload.path || ".";
  const maxChars = Number(payload.maxChars || 12000);

  const actions = {
    async configGet() {
      return { ok: true, action, config: publicConfig(loadConfig()) };
    },

    async configSet() {
      const patch = {};

      if (payload.root) patch.root = String(payload.root);
      if (payload.local) patch.local = String(payload.local);
      if (payload.relay) patch.relay = String(payload.relay);
      if (payload.tunnelName) patch.tunnelName = String(payload.tunnelName);
      if (typeof payload.allowWrite === "boolean") patch.allowWrite = payload.allowWrite;
      if (typeof payload.allowSecrets === "boolean") patch.allowSecrets = payload.allowSecrets;
      if (typeof payload.enableLocalHttpProxy === "boolean") patch.enableLocalHttpProxy = payload.enableLocalHttpProxy;
      if (payload.tools && typeof payload.tools === "object") patch.tools = payload.tools;

      if (patch.root) {
        const stat = await fsp.stat(patch.root);
        if (!stat.isDirectory()) throw new Error("Root must be a directory.");
      }

      const next = saveConfigPatch(patch);

      if (ws && ws.opened) {
        ws.send(JSON.stringify({
          type: "TUNNEL_REGISTER",
          name: next.tunnelName,
          deviceName: os.hostname(),
          root: next.root,
          allowWrite: next.allowWrite,
          allowSecrets: next.allowSecrets,
          agentVersion: "hosted-control-config-v2"
        }));
      }

      return { ok: true, action, config: publicConfig(next) };
    },

    async roots() {
      return { ok: true, action, roots: driveRoots(), home: HOME, cwd: process.cwd() };
    },

    async list() {
      return {
        ok: true,
        action,
        root: config.root,
        path: p,
        absolutePath: safePath(config, p),
        items: await listDir(config, p),
        detailedItems: await listDirDetailed(config, p)
      };
    },

    async tree() {
      return {
        ok: true,
        action,
        root: config.root,
        path: p,
        absolutePath: safePath(config, p),
        treeText: await treeText(config, p, payload.depth, payload.limit)
      };
    },

    async read() {
      const got = await readText(config, p, maxChars);
      return { ok: true, action, root: config.root, path: p, absolutePath: safePath(config, p), ...got };
    },

    async md() {
      const got = await readText(config, p, maxChars);
      const lang = path.extname(p).replace(".", "");
      return { ok: true, action, root: config.root, path: p, content: "```" + lang + "\n" + got.content + "\n```", truncated: got.truncated };
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
      return { ok: true, action, root: config.root, files };
    },

    async write() {
      const wrote = await writeText(config, p, payload.content || "");
      return { ok: true, action, root: config.root, ...wrote };
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
      return { ok: true, action, root: config.root, count: writes.length, results };
    }
  };

  if (!actions[action]) return { ok: false, status: 400, error: "Unknown action: " + action };
  return await actions[action]();
}

function proxyLocalHttp(config, data, ws) {
  if (!config.enableLocalHttpProxy || !config.tools.httpProxy) {
    ws.send(JSON.stringify({
      type: "TUNNEL_RESPONSE",
      id: data.id,
      ok: false,
      status: 403,
      error: "Local HTTP proxy disabled."
    }));
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

function connect() {
  const config = loadConfig();
  const ws = new TinyWebSocket(config.relay);

  ws.on("open", () => {
    ws.send(JSON.stringify({
      type: "TUNNEL_REGISTER",
      name: config.tunnelName,
      deviceName: os.hostname(),
      root: config.root,
      allowWrite: config.allowWrite,
      allowSecrets: config.allowSecrets,
      agentVersion: "hosted-control-config-v2"
    }));

    log("Tunnel connected:", config.tunnelName, "root:", config.root);
  });

  ws.on("message", async msg => {
    const data = JSON.parse(msg);
    if (data.type !== "TUNNEL_REQUEST") return;

    try {
      if (data.payload && data.payload.kind === "fs") {
        const result = await handleFs(loadConfig(), data.payload, ws);
        ws.send(JSON.stringify({ type: "TUNNEL_RESPONSE", id: data.id, ...result }));
        return;
      }

      proxyLocalHttp(loadConfig(), data, ws);
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
    log("Tunnel closed. Reconnecting in 2 seconds...");
    setTimeout(connect, 2000);
  });

  ws.on("error", err => {
    log("Tunnel error:", err.message);
  });

  ws.connect();
}

function main() {
  fs.mkdirSync(ROOT, { recursive: true });
  const config = loadConfig();

  log('B"H Awtsmoos agent starting.');
  log("Tunnel name:", config.tunnelName);
  log("Project root:", config.root);

  if (process.argv.includes("--open-control")) {
    openHostedControl(config);
  }

  connect();
}

main();
