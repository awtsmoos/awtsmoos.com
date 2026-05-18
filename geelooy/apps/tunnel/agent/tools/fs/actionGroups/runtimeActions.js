// B"H
const path = require("path");

const servicePath = path.join(
  __dirname,
  "../../../../../../scripts/awtsmoos/MerkavaExecutor/merkava-service"
);

const MerkavaService = require(servicePath);

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
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
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

/**
 * B"H
 * Reveals the Chrome-free Merkava runtime actions to the local tunnel agent.
 *
 * @param {object} ctx Agent context containing payload.
 * @returns {object} Action handlers.
 */
function buildRuntimeActions(ctx) {
  const { payload } = ctx;

  return {
    async simulateRuntime() {
      return await MerkavaService.simulateRuntime(collectOptions(payload));
    },

    async runtimeWorkflow() {
      return await MerkavaService.runtimeWorkflow(collectOptions(payload));
    },

    async testRuntimeOnce() {
      return await MerkavaService.simulateRuntime(collectOptions(payload));
    }
  };
}

module.exports = { buildRuntimeActions };
