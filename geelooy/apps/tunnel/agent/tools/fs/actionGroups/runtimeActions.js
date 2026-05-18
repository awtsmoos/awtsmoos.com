// B"H
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
    origin: payload.origin || "http://localhost:8080/",
    url: payload.url || "http://localhost:8080/"
  };
}

function loadMerkavaService() {
  try {
    const servicePath = path.join(
      __dirname,
      "../../../../../../scripts/awtsmoos/MerkavaExecutor/merkava-service"
    );

    return require(servicePath);
  } catch (e) {
    e.status = 503;
    e.message = "Merkava runtime service unavailable in this installed tunnel agent: " + e.message;
    throw e;
  }
}

function unavailable(e) {
  return {
    ok: false,
    status: e.status || 503,
    error: "merkava_runtime_unavailable",
    message: e.message
  };
}

function buildRuntimeActions(ctx) {
  const { payload } = ctx;

  return {
    async simulateRuntime() {
      try {
        return await loadMerkavaService().simulateRuntime(collectOptions(payload));
      } catch (e) {
        return unavailable(e);
      }
    },

    async runtimeWorkflow() {
      try {
        return await loadMerkavaService().runtimeWorkflow(collectOptions(payload));
      } catch (e) {
        return unavailable(e);
      }
    },

    async testRuntimeOnce() {
      try {
        return await loadMerkavaService().simulateRuntime(collectOptions(payload));
      } catch (e) {
        return unavailable(e);
      }
    }
  };
}

module.exports = { buildRuntimeActions };