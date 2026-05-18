// B"H
const { RuntimeAssembler } = require("../../merkava-runtime/RuntimeAssembler.js");
const { executeWorkflow } = require("../flow/executeWorkflow.js");
const { createActionRegistry } = require("../actions/actionRegistry.js");
const { normalizeRuntimeResult } = require("../snapshots/normalizeRuntimeResult.js");
const { instrumentSource } = require("../instrumentation/instrumentSource.js");
const { applyInteractions } = require("../interactions/applyInteractions.js");

function decodeJsonMaybe(value, fallback) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

function normalizeOptions(options = {}) {
  return {
    ...options,
    runtime: options.runtime || "browser",
    entry: options.entry || "index.html",
    files: decodeJsonMaybe(options.files, options.files || {}),
    workflow: decodeJsonMaybe(options.workflow, options.workflow || null),
    probes: decodeJsonMaybe(options.probes, options.probes || []),
    interactions: decodeJsonMaybe(options.interactions, options.interactions || [])
  };
}

function instrumentFiles(files = {}, probes = []) {
  if (!Array.isArray(probes) || !probes.length) return files;
  const next = { ...files };
  for (const file of Object.keys(next)) {
    if (file.endsWith(".js")) next[file] = instrumentSource(file, next[file], probes);
  }
  return next;
}

/**
 * B"H
 * Runs Merkava as a Chrome-free headless runtime, then lets the Awtsmoos-revealed
 * service layer observe the afterglow: probes, interactions, epochs, and snapshots.
 *
 * @param {object} options Runtime, entry, files, workflow, probes, interactions.
 * @returns {Promise<object>} Stable report.
 */
async function simulateRuntime(options = {}) {
  const normalized = normalizeOptions(options);

  async function runOnce(runOptions) {
    const files = instrumentFiles(runOptions.files, runOptions.probes);
    const assembler = new RuntimeAssembler({ ...runOptions, files });
    const raw = await assembler.run(runOptions.entry);
    const interactionLog = await applyInteractions(raw.runtime, runOptions.interactions || []);
    if (raw.runtime?.snapshot) raw.result.snapshot = raw.runtime.snapshot();

    const result = normalizeRuntimeResult({ ...raw, interactionLog }, { ...runOptions, files });
    result.interactions = runOptions.interactions || [];
    result.interactionLog = interactionLog;
    result.epochs = [
      { id: 0, name: "boot", ok: raw.ok !== false },
      { id: 1, name: "interactions", count: interactionLog.length, ok: true }
    ];
    return result;
  }

  if (normalized.workflow) {
    const ctx = { ...normalized, options: normalized, result: null };
    const actions = createActionRegistry(runOnce);
    const workflowResult = await executeWorkflow(normalized.workflow, ctx, actions);
    return ctx.result || workflowResult || { ok: true, workflow: true };
  }

  return await runOnce(normalized);
}

async function runtimeWorkflow(options = {}) {
  return await simulateRuntime(options);
}

module.exports = { simulateRuntime, runtimeWorkflow, normalizeOptions, instrumentFiles };
