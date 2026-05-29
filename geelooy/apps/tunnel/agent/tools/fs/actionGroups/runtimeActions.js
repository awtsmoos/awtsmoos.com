// B"H
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { stabilizeRemoteModuleSource } = require("./remoteModuleCompat.js");
const { buildRuntimeVirtualEnv } = require("../runtimeVirtualEnv.js");

function json64(value, fallback) {
  if (!value) return fallback;
  try { return JSON.parse(Buffer.from(String(value), "base64").toString("utf8")); } catch (_) { return fallback; }
}

function jsonMaybe(value, fallback) {
  if (value == null || value === "") return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

/**
 * B"H
 * Chapter 15: The runner refused to lose the JSON scroll in transit.
 *
 * Older runtime plumbing only forwarded `interactions`; this collector now
 * preserves browserActions/pageActions/actionsJson too, so a huge Playwright
 * style payload reaches the Merkava browser intact.
 */
function browserActionsFrom(payload) {
  return jsonMaybe(
    payload.browserActions || payload.pageActions || payload.actionsJson,
    payload.browserActions || payload.pageActions || payload.actions || json64(payload.browserActions64, null)
  );
}

function collectOptions(payload = {}, config = {}) {
  const env = buildRuntimeVirtualEnv(payload, config);
  return {
    runtime: payload.runtime || "browser",
    engine: payload.engine || "merkava",
    entry: env.entry || payload.entry || payload.path || payload.p || payload.target || "index.html",
    files: Object.keys(env.files || {}).length ? env.files : jsonMaybe(payload.files, json64(payload.files64, {})),
    virtualEnv: env,
    workflow: jsonMaybe(payload.workflow, payload.steps && payload.steps.length ? { steps: payload.steps } : json64(payload.workflow64, null)),
    probes: jsonMaybe(payload.probes, json64(payload.probes64, [])),
    interactions: jsonMaybe(payload.interactions, json64(payload.interactions64, [])),
    browserActions: browserActionsFrom(payload),
    pageActions: browserActionsFrom(payload),
    origin: payload.origin || process.env.AWTSMOOS_BASE_URL || "https://awtsmoos.com",
    url: payload.url || process.env.AWTSMOOS_BASE_URL || "https://awtsmoos.com",
    headless: payload.headless !== false,
    waitMs: Number(payload.waitMs || 800),
    timeoutMs: Number(payload.timeoutMs || 30000),
    returnValues: jsonMaybe(payload.returnValues, json64(payload.returnValues64, [])),
    values: jsonMaybe(payload.values, json64(payload.values64, []))
  };
}

function resolveMerkavaServiceUrl(payload = {}) {
  const base = payload.origin || payload.url || process.env.AWTSMOOS_BASE_URL || "https://awtsmoos.com";
  return new URL("/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js", base).href;
}

const moduleCache = new Map();

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed loading remote Merkava module ${url}: HTTP ${response.status}`);
  return await response.text();
}

function rewriteImports(source, baseUrl) {
  return String(source || "").replace(/(import\s+[^"']*?["']|export\s+[^"']*?from\s+["'])(\.{1,2}\/[^"']+)(["'])/g, (_, prefix, rel, suffix) => `${prefix}${new URL(rel, baseUrl).href}${suffix}`);
}

function collectRemoteDeps(source, baseUrl) {
  const deps = new Set();
  for (const match of String(source || "").matchAll(/(?:import|export)\s+[^"']*?["'](https?:\/\/[^"']+)["']/g)) deps.add(match[1]);
  for (const match of String(source || "").matchAll(/require\(["'](\.{1,2}\/[^"']+)["']\)/g)) deps.add(new URL(match[1], baseUrl).href);
  return [...deps];
}

async function importHttpModule(url) {
  if (moduleCache.has(url)) { const cached = await moduleCache.get(url); return cached.module || cached; }
  const pending = (async () => {
    let source = rewriteImports(stabilizeRemoteModuleSource(await fetchText(url), url), url);
    for (const dep of collectRemoteDeps(source, url)) await importHttpModule(dep);
    source = source.replace(/(["'])(https?:\/\/[^"']+)(["'])/g, (_, q1, dep, q2) => {
      const cached = moduleCache.get(dep);
      return cached && cached.dataUrl ? `${q1}${cached.dataUrl}${q2}` : `${q1}${dep}${q2}`;
    });
    const dataUrl = "data:text/javascript;base64," + Buffer.from(source, "utf8").toString("base64");
    const mod = await import(dataUrl);
    const resolved = { module: mod, dataUrl };
    moduleCache.set(url, resolved);
    return resolved;
  })();
  moduleCache.set(url, pending);
  return (await pending).module;
}

function findLocalMerkavaService(start) {
  const candidates = [];
  let dir = path.resolve(start || process.cwd());
  while (dir && dir !== path.dirname(dir)) {
    candidates.push(path.join(dir, "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js"));
    candidates.push(path.join(dir, "scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js"));
    dir = path.dirname(dir);
  }
  return candidates.find(file => fs.existsSync(file)) || null;
}

async function loadMerkavaService(payload = {}, config = {}) {
  const localPath = findLocalMerkavaService(config.root || process.cwd());
  if (localPath) return await import(pathToFileURL(localPath).href + "?awtsmoos=" + Date.now());
  return await importHttpModule(resolveMerkavaServiceUrl(payload));
}

function fallback(error, payload) {
  return { ok: false, engine: "merkava", error: "merkava_runtime_failed", message: error?.message || String(error), stack: error?.stack || "", retryWith: "chrome", chromeRecommended: true, suggestion: { action: "simulateRuntime", engine: "chrome", reason: "Merkava runtime failed; retry with browser-backed runtime." }, options: collectOptions(payload, {}) };
}

async function runService(payload, method, config = {}) {
  const options = collectOptions(payload, config);
  if (options.virtualEnv && options.virtualEnv.ok === false) return { ok: false, action: method, engine: "merkava", error: "runtime_preflight_failed", diagnostics: options.virtualEnv.diagnostics || [], virtualEnv: options.virtualEnv, options };
  try {
    const service = await loadMerkavaService(payload, config);
    const fn = service && service[method];
    if (typeof fn !== "function") throw new Error(`Remote Merkava service missing method: ${method}`);
    const result = await fn(options);
    return { ...result, virtualEnv: options.virtualEnv };
  } catch (error) { return fallback(error, payload); }
}

function buildRuntimeActions(ctx) {
  const { payload, config } = ctx;
  return {
    async simulateRuntime() { return await runService(payload, "simulateRuntime", config); },
    async runtimeWorkflow() { return await runService(payload, "runtimeWorkflow", config); },
    async merkavaWorkflowRun() { return await runService(payload, "runtimeWorkflow", config); },
    async aiWorkflowRun() { return await runService(payload, "runtimeWorkflow", config); },
    async testRuntimeOnce() { return await runService(payload, "simulateRuntime", config); }
  };
}

module.exports = { buildRuntimeActions, collectOptions, browserActionsFrom };
