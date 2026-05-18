// B"H

const vm = require("vm");
const path = require("path");

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
    entry: payload.entry || "index.html",
    files: jsonMaybe(payload.files, json64(payload.files64, {})),
    workflow: jsonMaybe(payload.workflow, json64(payload.workflow64, null)),
    probes: jsonMaybe(payload.probes, json64(payload.probes64, [])),
    interactions: jsonMaybe(payload.interactions, json64(payload.interactions64, [])),
    origin: payload.origin || process.env.AWTSMOOS_BASE_URL || "https://awtsmoos.com",
    url: payload.url || process.env.AWTSMOOS_BASE_URL || "https://awtsmoos.com"
  };
}

function resolveMerkavaBase(payload = {}) {
  const base = payload.origin
    || payload.url
    || process.env.AWTSMOOS_BASE_URL
    || "https://awtsmoos.com";

  return new URL(
    "/scripts/awtsmoos/MerkavaExecutor/merkava-service/",
    base
  ).href;
}

async function fetchText(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed fetching ${url}: HTTP ${response.status}`);
  }

  return response.text();
}

async function loadCommonJsModule(url, cache = new Map()) {
  if (cache.has(url)) {
    return cache.get(url).exports;
  }

  const source = await fetchText(url);

  const module = { exports: {} };
  cache.set(url, module);

  const dirname = url.substring(0, url.lastIndexOf("/") + 1);

  async function localRequire(specifier) {
    if (!specifier.startsWith(".")) {
      return require(specifier);
    }

    const nextUrl = new URL(specifier, dirname).href;
    return loadCommonJsModule(nextUrl, cache);
  }

  const wrapped = `(async function(exports, module, require, __dirname, __filename){\n${source}\n})`;

  const fn = vm.runInThisContext(wrapped, {
    filename: url
  });

  await fn(
    module.exports,
    module,
    localRequire,
    dirname,
    url
  );

  return module.exports;
}

async function loadMerkavaService(payload = {}) {
  const base = resolveMerkavaBase(payload);
  return loadCommonJsModule(new URL("index.js", base).href);
}

function unavailable(error) {
  return {
    ok: false,
    status: error.status || 503,
    error: "merkava_runtime_unavailable",
    message: error.message,
    stack: error.stack
  };
}

function buildRuntimeActions(ctx) {
  const { payload } = ctx;

  return {
    async simulateRuntime() {
      try {
        const merkava = await loadMerkavaService(payload);
        return await merkava.simulateRuntime(collectOptions(payload));
      } catch (error) {
        return unavailable(error);
      }
    },

    async runtimeWorkflow() {
      try {
        const merkava = await loadMerkavaService(payload);
        return await merkava.runtimeWorkflow(collectOptions(payload));
      } catch (error) {
        return unavailable(error);
      }
    },

    async testRuntimeOnce() {
      try {
        const merkava = await loadMerkavaService(payload);
        return await merkava.simulateRuntime(collectOptions(payload));
      } catch (error) {
        return unavailable(error);
      }
    }
  };
}

module.exports = { buildRuntimeActions };
