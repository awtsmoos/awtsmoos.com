// B"H
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { stabilizeRemoteModuleSource } = require("./remoteModuleCompat.js");
const { buildRuntimeVirtualEnv } = require("../runtimeVirtualEnv.js");
const { buildRuntimeUrlEnv } = require("../runtimeUrlEnv.js");
const { isNodeDomEngine } = require("../nodeDomRuntime/engineAliases.js");
const { simulateNodeDomRuntime } = require("../nodeDomRuntime/index.js");
const { simulateChromeRuntime } = require("../chromeRuntime.js");

/**
 * B"H
 * Chapter 386: Runtime wore three garments in order.
 * Auto mode tries real headless Chrome first, then Node DOM, then Merkava. Each
 * failed garment leaves a diagnostic, so fallback is not a hidden lie.
 */
function json64(value, fallback) {
  if (!value) return fallback;
  try { return JSON.parse(Buffer.from(String(value), "base64").toString("utf8")); } catch (_) { return fallback; }
}

function jsonMaybe(value, fallback) {
  if (value == null || value === "") return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

function firstJson(payload, names, fallback) {
  for (const name of names) if (payload[name] != null && payload[name] !== "") return jsonMaybe(payload[name], fallback);
  for (const name of names.map(name => name + "64")) if (payload[name] != null && payload[name] !== "") return json64(payload[name], fallback);
  return fallback;
}

function expandRuntimePayload(payload = {}) {
  const params = jsonMaybe(payload.params, json64(payload.params64, {}));
  if (!params || typeof params !== "object" || Array.isArray(params)) return payload;
  return { ...params, ...payload };
}

async function collectOptions(payload = {}, config = {}) {
  payload = expandRuntimePayload(payload);
  const env = await collectRuntimeEnv(payload, config);
  const actions = browserActionsFrom(payload);
  return {
    runtime: payload.runtime || "browser",
    engine: payload.engine || payload.runtimeEngine || "auto",
    entry: env.entry || payload.entry || payload.path || payload.p || payload.target || "index.html",
    files: Object.keys(env.files || {}).length ? env.files : jsonMaybe(payload.files, json64(payload.files64, {})),
    virtualEnv: env,
    workflow: jsonMaybe(payload.workflow, payload.steps && payload.steps.length ? { steps: payload.steps } : json64(payload.workflow64, null)),
    probes: firstJson(payload, ["probes"], []),
    interactions: actions || firstJson(payload, ["interactions"], []),
    browserActions: actions,
    pageActions: actions,
    origin: payload.origin || runtimeOrigin(payload),
    url: payload.url || process.env.AWTSMOOS_BASE_URL || "https://awtsmoos.com",
    headless: payload.headless !== false && payload.headless !== "false",
    waitMs: Number(payload.waitMs || 0),
    timeoutMs: Number(payload.timeoutMs || 30000),
    returnValues: firstJson(payload, ["returnValues", "values"], []),
    values: firstJson(payload, ["values", "returnValues"], []),
    compactModules: payload.compactModules,
    networkRewrite: payload.networkRewrite || null,
    format: payload.format || payload.returnFormat || payload.outputFormat || null,
    port: payload.port || payload.chromePort || 9222
  };
}

async function collectRuntimeEnv(payload, config) {
  payload = expandRuntimePayload(payload);
  const urlEnv = await buildRuntimeUrlEnv(payload);
  if (urlEnv) return urlEnv;
  return buildRuntimeVirtualEnv(payload, config);
}

function runtimeOrigin(payload = {}) {
  if (payload.url) { try { return new URL(String(payload.url)).origin; } catch (_) {} }
  return process.env.AWTSMOOS_BASE_URL || "https://awtsmoos.com";
}

function browserActionsFrom(payload = {}) {
  payload = expandRuntimePayload(payload);
  return firstJson(payload, ["browserActions", "pageActions", "actionsJson", "actions", "steps"], null);
}

function engineName(value = "") { return String(value || "auto").trim().toLowerCase(); }
function wantsChrome(engine) { return ["chrome", "headless-chrome", "browser"].includes(engineName(engine)); }
function wantsAuto(engine) { return ["", "auto", "best", "default"].includes(engineName(engine)); }
function wantsMerkava(engine) { return ["merkava", "synthetic"].includes(engineName(engine)); }

async function runChromeAttempt(options) {
  return await simulateChromeRuntime({ ...options, engine: "chrome", headless: options.headless !== false });
}

async function runNodeDomAttempt(options) {
  return await simulateNodeDomRuntime({ ...options, engine: "node-dom" });
}

async function runMerkavaAttempt(payload, method, config, options) {
  try {
    const service = await loadMerkavaService(payload, config);
    const fn = service && service[method];
    if (typeof fn !== "function") throw new Error(`Remote Merkava service missing method: ${method}`);
    const result = await fn({ ...options, engine: "merkava" });
    return { ...result, engine: result.engine || "merkava", virtualEnv: options.virtualEnv };
  } catch (error) {
    return fallback(error, payload, options);
  }
}

async function runEngineAttempt(name, payload, method, config, options) {
  if (name === "chrome") return await runChromeAttempt(options);
  if (name === "node-dom") return await runNodeDomAttempt(options);
  return await runMerkavaAttempt(payload, method, config, options);
}

async function runAuto(payload, method, config, options) {
  const attemptedEngines = [];
  for (const name of ["chrome", "node-dom", "merkava"]) {
    try {
      const result = await runEngineAttempt(name, payload, method, config, options);
      attemptedEngines.push({ engine: name, ok: result.ok !== false, error: result.error || null });
      if (result.ok !== false) return { ...result, engine: result.engine || name, attemptedEngines, autoRuntime: true };
    } catch (error) {
      attemptedEngines.push({ engine: name, ok: false, error: error.message });
    }
  }
  return { ok: false, action: method, engine: "auto", error: "all_runtime_engines_failed", attemptedEngines };
}

async function runService(payload, method, config = {}) {
  payload = expandRuntimePayload(payload);
  const options = await collectOptions(payload, config);
  if (options.virtualEnv && options.virtualEnv.ok === false) return { ok: false, action: method, engine: options.engine || "auto", error: "runtime_preflight_failed", diagnostics: options.virtualEnv.diagnostics || [], virtualEnv: options.virtualEnv, options };
  if (method !== "simulateRuntime") return await runMerkavaAttempt(payload, method, config, options);
  if (wantsAuto(options.engine)) return await runAuto(payload, method, config, options);
  if (wantsChrome(options.engine)) return await runChromeAttempt(options);
  if (isNodeDomEngine(options.engine)) return await runNodeDomAttempt(options);
  if (wantsMerkava(options.engine)) return await runMerkavaAttempt(payload, method, config, options);
  return await runAuto(payload, method, config, options);
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
  payload = expandRuntimePayload(payload);
  const localPath = findLocalMerkavaService(config.root || process.cwd());
  if (localPath) return await import(pathToFileURL(localPath).href + "?awtsmoos=" + Date.now());
  return await importHttpModule(resolveMerkavaServiceUrl(payload));
}
async function fallback(error, payload, options = null) {
  payload = expandRuntimePayload(payload);
  return { ok: false, engine: "merkava", error: "merkava_runtime_failed", message: error?.message || String(error), stack: error?.stack || "", chromeRecommended: false, suggestion: { action: "simulateRuntime", engine: "auto", reason: "Merkava runtime failed before completion." }, options: options || await collectOptions(payload, {}) };
}

function buildRuntimeActions(ctx) {
  const { payload, config } = ctx;
  return {
    async runtime() { return await runService({ ...payload, action: "simulateRuntime" }, "simulateRuntime", config); },
    async simulateRuntime() { return await runService(payload, "simulateRuntime", config); },
    async runtimeWorkflow() { return await runService(payload, "runtimeWorkflow", config); },
    async merkavaWorkflowRun() { return await runService(payload, "runtimeWorkflow", config); },
    async aiWorkflowRun() { return await runService(payload, "runtimeWorkflow", config); },
    async testRuntimeOnce() { return await runService(payload, "simulateRuntime", config); }
  };
}

module.exports = { buildRuntimeActions, collectOptions, browserActionsFrom, expandRuntimePayload, runService, runAuto };
