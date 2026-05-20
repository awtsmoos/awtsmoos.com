// B"H
const { stabilizeRemoteModuleSource } = require("./remoteModuleCompat.js");

function json64(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(Buffer.from(String(value), "base64").toString("utf8"));
  } catch (_) {
    return fallback;
  }
}

function jsonMaybe(value, fallback) {
  if (value == null || value === "") return fallback;
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
    workflow: jsonMaybe(
      payload.workflow,
      payload.steps && payload.steps.length ? { steps: payload.steps } : json64(payload.workflow64, null)
    ),
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

const moduleCache = new Map();

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed loading remote Merkava module ${url}: HTTP ${response.status}`);
  }
  return await response.text();
}

function rewriteImports(source, baseUrl) {
  return String(source || "").replace(
    /(import\s+[^"']*?["']|export\s+[^"']*?from\s+["'])(\.{1,2}\/[^"']+)(["'])/g,
    (_, prefix, rel, suffix) => `${prefix}${new URL(rel, baseUrl).href}${suffix}`
  );
}

function collectRemoteDeps(source, baseUrl) {
  const deps = new Set();
  for (const match of String(source || "").matchAll(/(?:import|export)\s+[^"']*?["'](https?:\/\/[^"']+)["']/g)) deps.add(match[1]);
  for (const match of String(source || "").matchAll(/require\(["'](\.{1,2}\/[^"']+)["']\)/g)) deps.add(new URL(match[1], baseUrl).href);
  return [...deps];
}

async function importHttpModule(url) {
  if (moduleCache.has(url)) {
    const cached = await moduleCache.get(url);
    return cached.module || cached;
  }

  const pending = (async () => {
    let source = await fetchText(url);
    source = stabilizeRemoteModuleSource(source, url);
    source = rewriteImports(source, url);

    const deps = collectRemoteDeps(source, url);

    for (const dep of deps) {
      await importHttpModule(dep);
    }

    source = source.replace(/(["'])(https?:\/\/[^"']+)(["'])/g, (_, q1, dep, q2) => {
      const cached = moduleCache.get(dep);
      if (!cached || !cached.dataUrl) return `${q1}${dep}${q2}`;
      return `${q1}${cached.dataUrl}${q2}`;
    });

    const dataUrl = "data:text/javascript;base64," + Buffer.from(source, "utf8").toString("base64");
    const mod = await import(dataUrl);
    const resolved = { module: mod, dataUrl };
    moduleCache.set(url, resolved);
    return resolved;
  })();

  moduleCache.set(url, pending);
  const resolved = await pending;
  return resolved.module;
}

async function loadMerkavaService(payload = {}) {
  return await importHttpModule(resolveMerkavaServiceUrl(payload));
}

function fallback(error, payload) {
  return {
    ok: false,
    engine: "merkava",
    error: "merkava_runtime_failed",
    message: error && error.message ? error.message : String(error),
    stack: error && error.stack ? error.stack : "",
    retryWith: "chrome",
    chromeRecommended: true,
    suggestion: {
      action: "simulateRuntime",
      engine: "chrome",
      reason: "Merkava runtime failed; retry with browser-backed runtime."
    },
    options: collectOptions(payload)
  };
}

async function runService(payload, method) {
  try {
    const service = await loadMerkavaService(payload);
    const fn = service && service[method];
    if (typeof fn !== "function") {
      throw new Error(`Remote Merkava service missing method: ${method}`);
    }
    return await fn(collectOptions(payload));
  } catch (error) {
    return fallback(error, payload);
  }
}

function buildRuntimeActions(ctx) {
  const { payload } = ctx;

  return {
    async simulateRuntime() {
      return await runService(payload, "simulateRuntime");
    },

    async runtimeWorkflow() {
      return await runService(payload, "runtimeWorkflow");
    },

    async merkavaWorkflowRun() {
      return await runService(payload, "runtimeWorkflow");
    },

    async aiWorkflowRun() {
      return await runService(payload, "runtimeWorkflow");
    },


    async testRuntimeOnce() {
      return await runService(payload, "simulateRuntime");
    }
  };
}

module.exports = { buildRuntimeActions };