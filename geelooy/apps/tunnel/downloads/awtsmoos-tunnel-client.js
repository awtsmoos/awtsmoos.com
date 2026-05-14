
// B"H
// Awtsmoos Tunnel Client

const fs = require("fs/promises");
const path = require("path");
const http = require("http");
const https = require("https");
const os = require("os");
const WebSocket = require("ws");

const HOME = os.homedir();
const CONFIG_PATH = path.join(HOME, ".awtsmoos-tunnel", "config.json");
const DEFAULT_RELAY = "wss://awtsmoos.com";
const SKIP = new Set(["node_modules", ".git", ".DS_Store", "dist", "build", ".next", "coverage"]);
const BIN = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".zip", ".exe", ".dll", ".so", ".node", ".woff", ".woff2", ".ttf", ".mp4", ".mov", ".mp3"]);

/**
 * B"H
 * Reads tunnel configuration from the user's home folder.
 *
 * @returns {Promise<object>} Tunnel config.
 */
async function readConfig() {
  const text = await fs.readFile(CONFIG_PATH, "utf8");
  const config = JSON.parse(text);

  return {
    relay: config.relay || DEFAULT_RELAY,
    tunnelName: config.tunnelName || "my-local",
    local: config.local || "http://localhost:3000",
    root: config.root || process.cwd(),
    allowWrite: !!config.allowWrite
  };
}

/**
 * B"H
 * Resolves a user path inside the chosen project root.
 *
 * @param {object} config Tunnel config.
 * @param {string} given Path from remote request.
 * @returns {string} Safe absolute path.
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

/**
 * B"H
 * Converts absolute path to slash-style relative path.
 *
 * @param {object} config Tunnel config.
 * @param {string} full Absolute path.
 * @returns {string} Relative slash path.
 */
function rel(config, full) {
  return path.relative(config.root, full).replace(/\\/g, "/") || ".";
}

/**
 * B"H
 * Lists a directory compactly.
 *
 * @param {object} config Tunnel config.
 * @param {string} p Directory path.
 * @returns {Promise<Array<string>>} Items.
 */
async function listDir(config, p) {
  const full = safePath(config, p);
  const entries = await fs.readdir(full, { withFileTypes: true });

  return entries
    .filter(e => !SKIP.has(e.name))
    .map(e => e.isDirectory() ? e.name + "/" : e.name);
}

/**
 * B"H
 * Builds a compact text tree.
 *
 * @param {object} config Tunnel config.
 * @param {string} p Root path.
 * @param {number} depth Max depth.
 * @param {number} limit Max nodes.
 * @param {object} state Counter state.
 * @param {string} prefix Tree prefix.
 * @returns {Promise<string>} Tree text.
 */
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
    const childRel = path.join(rel(config, full), e.name);
    out += "\n" + await treeText(config, childRel, depth - 1, limit, state, prefix + "  ");
  }

  return out;
}

/**
 * B"H
 * Reads a text file with binary refusal.
 *
 * @param {object} config Tunnel config.
 * @param {string} p File path.
 * @param {number} maxChars Max chars.
 * @returns {Promise<object>} Content result.
 */
async function readText(config, p, maxChars = 12000) {
  const full = safePath(config, p);
  const ext = path.extname(full).toLowerCase();

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

/**
 * B"H
 * Handles filesystem tunnel actions.
 *
 * @param {object} config Tunnel config.
 * @param {object} payload Tunnel payload.
 * @returns {Promise<object>} Action result.
 */
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
      if (!config.allowWrite) throw new Error("Writes disabled in config.json.");
      const full = safePath(config, p);
      await fs.mkdir(path.dirname(full), { recursive: true });
      await fs.writeFile(full, payload.content || "", "utf8");
      return { ok: true, action, path: p, bytes: Buffer.byteLength(payload.content || "") };
    }
  };

  if (!actions[action]) {
    return { ok: false, status: 400, error: "Unknown action: " + action };
  }

  return await actions[action]();
}

/**
 * B"H
 * Proxies an HTTP request to the local server configured by the user.
 *
 * @param {object} config Tunnel config.
 * @param {object} data Tunnel message.
 * @param {WebSocket} ws Relay socket.
 * @returns {void}
 */
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

/**
 * B"H
 * Connects to the Awtsmoos relay and keeps reconnecting.
 *
 * @returns {Promise<void>} Resolves when initial config is loaded.
 */
async function connect() {
  const config = await readConfig();
  const ws = new WebSocket(config.relay);

  ws.on("open", () => {
    ws.send(JSON.stringify({
      type: "TUNNEL_REGISTER",
      name: config.tunnelName,
      deviceName: os.hostname(),
      root: config.root,
      allowWrite: config.allowWrite
    }));

    console.log("B\"H Awtsmoos tunnel connected.");
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
}

connect().catch(err => {
  console.error(err);
  process.exit(1);
});
