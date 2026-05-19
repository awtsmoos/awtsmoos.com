// B"H

const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const net = require("net");
const { staticServerStart, staticServerStop } = require("../staticServers.js");
const { chromeLaunch, chromeStatus, chromeNavigate, chromeEval, chromeLogs, chromeSnapshot } = require("../../chrome/actions.js");

function json64(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(Buffer.from(String(value), "base64").toString("utf8"));
  } catch (_) {
    return fallback;
  }
}

function jsonMaybe(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(String(value));
  } catch (_) {
    return fallback;
  }
}

function collectOptions(payload = {}) {
  return {
    runtime: payload.runtime || "browser",
    engine: payload.engine || "merkava",
    entry: payload.entry || payload.path || payload.p || payload.target || "index.html",
    files: jsonMaybe(payload.files, json64(payload.files64, {})),
    workflow: jsonMaybe(payload.workflow, payload.steps?.length ? { steps: payload.steps } : json64(payload.workflow64, null)),
    probes: jsonMaybe(payload.probes, json64(payload.probes64, [])),
    interactions: jsonMaybe(payload.interactions, json64(payload.interactions64, [])),
    origin: payload.origin || process.env.AWTSMOOS_BASE_URL || "https://awtsmoos.com",
    url: payload.url || process.env.AWTSMOOS_BASE_URL || "https://awtsmoos.com",
    headless: payload.headless !== false,
    waitMs: Number(payload.waitMs || 800),
    timeoutMs: Number(payload.timeoutMs || 30000)
  };
}

function resolveMerkavaServiceUrl(payload = {}) {
  const base = payload.origin || payload.url || process.env.AWTSMOOS_BASE_URL || "https://awtsmoos.com";
  return new URL("/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js", base).href;
}

const httpModuleCache = new Map();

function rewriteImports(source, baseUrl) {
  return source.replace(/(import\s+[^"']*?["']|export\s+[^"']*?from\s+["'])(\.\.?\/[^"']+)(["'])/g, (_, prefix, rel, suffix) => {
    return `${prefix}${new URL(rel, baseUrl).href}${suffix}`;
  });
}

async function importHttpModule(url) {
  if (httpModuleCache.has(url)) {
    const cached = await httpModuleCache.get(url);
    return cached.module || cached;
  }

  const pending = (async () => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed loading runtime module ${url}: HTTP ${response.status}`);

    let source = await response.text();
    source = rewriteImports(source, url);

    const nested = [...source.matchAll(/(?:import|export)\s+[^"']*?["'](https?:\/\/[^"']+)["']/g)]
      .map(m => m[1]);

    for (const dep of nested) {
      await importHttpModule(dep);
    }

    source = source.replace(/(["'])(https?:\/\/[^"']+)(["'])/g, (_, q1, dep, q2) => {
      const cached = httpModuleCache.get(dep);
      if (!cached?.dataUrl) return `${q1}${dep}${q2}`;
      return `${q1}${cached.dataUrl}${q2}`;
    });
    const dataUrl = "data:text/javascript;base64," + Buffer.from(source, "utf8").toString("base64");
    const mod = await import(dataUrl);
    const resolved = { module: mod, dataUrl };
    httpModuleCache.set(url, resolved);
    return resolved;
  })();

  httpModuleCache.set(url, pending);
  const resolved = await pending;
  return resolved.module;
}

async function loadMerkavaService(config, payload = {}) {
  return importHttpModule(resolveMerkavaServiceUrl(payload));
}
function chromeFallback(error, options) {
  return {
    ok: false,
    engine: "merkava",
    retryWith: "chrome",
    chromeRecommended: true,
    error: "merkava_runtime_failed",
    message: error.message,
    stack: error.stack,
    suggestion: {
      action: "simulateRuntime",
      engine: "chrome",
      reason: "Merkava runtime could not execute this graph. Retry with real headless Chrome."
    },
    options
  };
}

    ok: false,
    status: error.status || 503,
    error: "runtime_unavailable",
    message: error.message,
    stack: error.stack
  };
}

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

function safeVirtualPath(filePath) {
  const clean = String(filePath || "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .split("/")
    .filter(part => part && part !== "." && part !== "..")
    .join("/");

  return clean || "index.html";
}

async function materializeFiles(root, files) {
  const entries = Object.entries(files || {});

  if (!entries.length) {
    await fs.writeFile(path.join(root, "index.html"), "<!doctype html><title>Awtsmoos Runtime</title><body>B\"H runtime</body>");
    return;
  }

  for (const [name, content] of entries) {
    const target = path.join(root, safeVirtualPath(name));
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, String(content ?? ""));
  }
}

function browserErrors(logs = {}) {
  const list = Array.isArray(logs.logs) ? logs.logs : [];
  return list.filter(item => ["error", "exception", "warning"].includes(String(item.level || "").toLowerCase()));
}

async function runMerkava(config, payload) {
  const merkava = await loadMerkavaService(config, payload);
  return merkava.simulateRuntime(collectOptions(payload));
}

async function runChrome(config, payload) {
  const options = collectOptions(payload);
  const files = options.files || {};
  const hasVirtualFiles = Object.keys(files).length > 0;
  const tempRoot = path.join(config.root, ".awtsmoos-tmp", "runtime-sim-" + Date.now() + "-" + Math.random().toString(16).slice(2));
  let server = null;
  let url = options.entry;

  try {
    if (hasVirtualFiles || !/^https?:\/\//i.test(url)) {
      await fs.mkdir(tempRoot, { recursive: true });
      await materializeFiles(tempRoot, files);
      const port = await freePort();
      server = await staticServerStart(config, {
        path: path.relative(config.root, tempRoot).replace(/\\/g, "/"),
        port,
        host: "127.0.0.1",
        index: safeVirtualPath(options.entry || "index.html"),
        spaFallback: true,
        cors: true,
        maxBytes: payload.maxBytes || 50 * 1024 * 1024
      });

      if (!server.ok) return server;
      url = new URL(safeVirtualPath(options.entry || "index.html"), server.url).href;
    }

    const status = await chromeStatus({ maxLogs: 20 });
    if (!status.connected) {
      const launch = await chromeLaunch({ headless: options.headless, url: "about:blank", startupWaitMs: 1800, maxLogs: 50 });
      if (!launch.ok) return { ...launch, engine: "chrome" };
    }

    const nav = await chromeNavigate({
      url,
      timeoutMs: options.timeoutMs,
      waitMs: options.waitMs,
      snapshot: true,
      clearLogs: true,
      maxLogs: 300
    });

    const evalResult = await chromeEval({
      expression: `(() => ({
        title: document.title,
        url: location.href,
        readyState: document.readyState,
        bodyText: document.body ? document.body.innerText.slice(0, 2000) : "",
        scripts: [...document.scripts].map(s => s.src || "inline").slice(0, 50)
      }))()`,
      timeoutMs: options.timeoutMs,
      maxLogs: 300
    });

    const logs = await chromeLogs({ maxLogs: 500 });
    const errors = browserErrors(logs);
    const snapshot = await chromeSnapshot({ maxLogs: 100 }).catch(error => ({ ok: false, error: error.message }));

    return {
      ok: nav.ok !== false && evalResult.ok !== false && errors.length === 0,
      engine: "chrome",
      url,
      server,
      navigation: nav,
      evaluation: evalResult.result?.result?.value || evalResult.result,
      errors,
      logs,
      snapshot
    };
  } catch (error) {
    return unavailable(error);
  } finally {
    if (server?.serverId) await staticServerStop({ serverId: server.serverId }).catch(() => null);
    if (hasVirtualFiles) await fs.rm(tempRoot, { recursive: true, force: true }).catch(() => null);
  }
}

function buildRuntimeActions(ctx) {
  const { config, payload } = ctx;

  return {
    async simulateRuntime() {
      const options = collectOptions(payload);

      try {
        if (options.engine === "chrome") return await runChrome(config, payload);
        return await runMerkava(config, payload);
      } catch (error) {
        return chromeFallback(error, options);
      }
    },

    async runtimeWorkflow() {
      return this.simulateRuntime();
    },

    async merkavaWorkflowRun() {
      return this.simulateRuntime();
    },

    async aiWorkflowRun() {
      return this.simulateRuntime();
    },

    async aiCommandBatch() {
      return this.simulateRuntime();
    },

    async testRuntimeOnce() {
      return this.simulateRuntime();
    }
  };
}

module.exports = { buildRuntimeActions };
