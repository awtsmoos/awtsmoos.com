// B"H

import { RuntimeAssembler } from "../../merkava-runtime/RuntimeAssembler.js";
import { executeWorkflow } from "../flow/executeWorkflow.js";
import { createActionRegistry } from "../actions/actionRegistry.js";
import { normalizeRuntimeResult } from "../snapshots/normalizeRuntimeResult.js";
import { instrumentSource } from "../instrumentation/instrumentSource.js";
import { applyInteractions } from "../interactions/applyInteractions.js";

function decodeJsonMaybe(value, fallback) {
  if (!value) return fallback;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(String(value));
  } catch (_) {
    return fallback;
  }
}

export function normalizeOptions(options = {}) {
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

export function instrumentFiles(files = {}, probes = []) {
  if (!Array.isArray(probes) || !probes.length) {
    return files;
  }

  const next = { ...files };

  for (const file of Object.keys(next)) {
    if (file.endsWith(".js")) {
      next[file] = instrumentSource(file, next[file], probes);
    }
  }

  return next;
}

async function runOnce(runOptions) {
  const files = instrumentFiles(runOptions.files, runOptions.probes);

  const assembler = new RuntimeAssembler({
    ...runOptions,
    files
  });

  const raw = await assembler.run(runOptions.entry);

  const interactionLog = await applyInteractions(
    raw.runtime,
    runOptions.interactions || []
  );

  if (raw.runtime?.snapshot) {
    raw.result.snapshot = raw.runtime.snapshot();
  }

  const result = normalizeRuntimeResult(
    { ...raw, interactionLog },
    { ...runOptions, files }
  );

  result.interactions = runOptions.interactions || [];
  result.interactionLog = interactionLog;
  result.epochs = [
    { id: 0, name: "boot", ok: raw.ok !== false },
    { id: 1, name: "interactions", count: interactionLog.length, ok: true }
  ];

  return result;
}

export async function simulateRuntime(options = {}) {
  const normalized = normalizeOptions(options);

  if (normalized.workflow) {
    const ctx = {
      ...normalized,
      options: normalized,
      result: null
    };

    const actions = createActionRegistry(runOnce);

    const workflowResult = await executeWorkflow(
      normalized.workflow,
      ctx,
      actions
    );

    return ctx.result || workflowResult || {
      ok: true,
      workflow: true
    };
  }

  return runOnce(normalized);
}

export async function runtimeWorkflow(options = {}) {
  return simulateRuntime(options);
}
