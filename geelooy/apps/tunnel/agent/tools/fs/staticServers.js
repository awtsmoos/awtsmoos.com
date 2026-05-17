// B"H
const http = require("http");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { safePath, assertNotSecret } = require("./pathGuard.js");

const SERVERS = new Map();

const MIMES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json" ,
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

/**
 * B"H
 * Resolves a url path into a safe file path under the served directory.
 */
function resolveRequest(root, requestPath, index) {
  const clean = decodeURIComponent(requestPath.split("?")[0])    .replace(/^\/+/, "")
    .replace(/\/+/g, "/");

  const full = path.resolve(root, clean || ".");
  const rel = path.relative(root, full);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return full;
}

async function serveFile(res, file, maxBytes) {
  const st = await fsp.stat(file);
  if (st.size > maxBytes) {
    res.writeHead(413);
    res.end("File too large");
    return;
  }

  res.writeHead(200, { "Content-Type": MIMES[path.extname(file).toLowerCase()] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}

function log(info, entry) {
  info.logs.push({ ts: Date.now(), ...entry });
  if (info.logs.length > 1000) info.logs.splice(0, info.logs.length - 1000);
}

function serverId(port, path) {
  return "static-" + port + "-" + Buffer.from(path).toString("hex").slice(0, 8);
}

/**
 * B"H
 * Starts a managed static HTTP server for Chrome/HTTP smoke tests.
 */
async function staticServerStart(config, payload = {}) {
  const dir = safePath(config, payload.path || payload.p || ".");
  assertNotSecret(config, dir);
  if (!(await fsp.stat(dir)).isDirectory()) return { ok: false, action: "staticServerStart", error: "not_directory" };

  const port = Number(payload.port || 5180);
  const host = payload.host === "0.0.0.0" ? "0.0.0.0" : "127.0.0.1";
  const id = payload.serverId || serverId(port, dir);
  if (SERVERS.has(id)) return { ok: true, action: "staticServerStart", alreadyRunning: true, ...SERVERS.get(id).public };

  const index = payload.index || "index.html";
  const maxBytes = Math.max(1, Math.min(Number(payload.maxBytes || 2 * 1024 * 1024), 50 * 1024 * 1024));
  const spaFallback = payload.spaFallback === true;
  const info = { logs: [], public: null, server: null };

  const server = http.createServer(async (req, res) => {
    try {
      if (payload.cors === true) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS");
      }

      let file = resolveRequest(dir, new URL(req.url, "http://localhost").pathname, index);
      if (!file) { res.writeHead(403); res.end("Forbidden"); return; }

      let st = await fsp.stat(file).catch(() => null);
      if (st && st.isDirectory()) {
        file = path.join(file, index);
        st = await fsp.stat(file).catch(() => null);
      }

      if (!st && spaFallback) {
        file = path.join(dir, index);
        st = await fsp.stat(file).catch(() => null);
      }

      if (!st || !st.isFile()) { res.writeHead(404); res.end("Not found"); return; }
      await serveFile(res, file, maxBytes);
      log(info, { method: req.method, url: req.url, status: 200 });
    } catch (e) {
      log(info, { method: req.method, url: req.url, status: 500, error: e.message });
      res.writeHead(500);
      res.end(e.message);
    }
  });

  await new Promise((resolve, reject) => server.once("error", reject).listen(port, host, resolve));

  const actualPort = server.address().port;

  const public = {
    serverId: id,
    url: "http://" + host + ":" + actualPort + "/",
    path: path.relative(config.root, dir).replace(/\\/g, "/"),
    absolutePath: dir,
    port: actualPort,
    host,
    index,
    spaFallback,
    startedAt: Date.now()
  };

  info.server = server;
  info.public = public;
  SERVERS.set(id, info);

  return { ok: true, action: "staticServerStart", ...public };
}

async function staticServerList() {
  return { ok: true, action: "staticServerList", servers: [...SERVERS.values()].map(x => x.public) };
}

async function staticServerLogs(payload = {}) {
  const id = payload.serverId;
  const maxLogs = Math.max(1, Math.min(Number(payload.maxLogs || 200), 1000));
  if (id && SERVERS.has(id)) return { ok: true, action: "staticServerLogs", serverId: id, logs: SERVERS.get(id).logs.slice(-maxLogs) };
  return { ok: true, action: "staticServerLogs", servers: [...SERVERS.entries()].map(([serverId, info]) => ({ serverId, logs: info.logs.slice(-maxLogs) })) };
}

async function staticServerStop(payload = {}) {
  const id = payload.serverId;
  if (!id) return { ok: false, action: "staticServerStop", error: "missing_serverId" };
  const info = SERVERS.get(id);
  if (!info) return { ok: true, action: "staticServerStop", serverId: id, alreadyStopped: true };
  await new Promise(resolve => info.server.close(resolve));
  SERVERS.delete(id);
  return { ok: true, action: "staticServerStop", serverId: id, stopped: true };
}

module.exports = { staticServerStart, staticServerList, staticServerStop, staticServerLogs };
