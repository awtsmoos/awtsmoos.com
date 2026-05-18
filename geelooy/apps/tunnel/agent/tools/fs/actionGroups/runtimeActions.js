// B"H

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

function resolveMerkavaServiceUrl(payload = {}) {
  const base = payload.origin
    || payload.url
    || process.env.AWTSMOOS_BASE_URL
    || "https://awtsmoos.com";

  return new URL(
    "/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js",
    base
  ).href;
}

async function importHttpModule(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed loading runtime module ${url}: HTTP ${response.status}`);
  }

  const source = await response.text();

  const rewritten = source.replace(
    /from\s+["'](\.\/[^"']+)["']/g,
    (_, rel) => {
      const absolute = new URL(rel, url).href;
      return `from "${absolute}"`;
    }
  );

  const dataUrl = "data:text/javascript;base64,"
    + Buffer.from(rewritten, "utf8").toString("base64");

  return import(dataUrl);
}

async function loadMerkavaService(payload = {}) {
  return importHttpModule(resolveMerkavaServiceUrl(payload));
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
