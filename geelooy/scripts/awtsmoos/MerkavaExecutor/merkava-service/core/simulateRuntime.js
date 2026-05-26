// B"H

import RuntimeAssemblerModule from "../../merkava-runtime/RuntimeAssembler.js";

const { RuntimeAssembler } = RuntimeAssemblerModule;
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

function readPath(root, key) {
  if (!root || !key) return undefined;
  return String(key).split(".").reduce((value, part) => value == null ? undefined : value[part], root);
}

function cloneValue(value) {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_) {
    return String(value);
  }
}

function extractRequestedValues(raw, runOptions = {}) {
  const runtime = raw?.runtime;
  const windowObj = runtime?.window || null;
  const nodeSnapshot = runtime?.snapshot ? runtime.snapshot() : null;
  const requested = Array.isArray(runOptions.returnValues)
    ? runOptions.returnValues
    : Array.isArray(runOptions.values)
      ? runOptions.values
      : [];
  const sources = {
    window: windowObj,
    globalThis: globalThis,
    result: raw?.result?.result,
    snapshot: nodeSnapshot
  };
  const values = {};
  for (const key of requested) {
    const plain = String(key);
    values[plain] = cloneValue(
      readPath(sources, plain) ??
      readPath(windowObj, plain) ??
      readPath(raw?.result?.result, plain) ??
      readPath(nodeSnapshot, plain)
    );
  }
  const awtsmoosResult = cloneValue(
    windowObj?.__awtsmoosResult ??
    raw?.result?.result?.__awtsmoosResult ??
    globalThis.__awtsmoosResult
  );
  return { values, awtsmoosResult };
}

export function normalizeOptions(options = {}) {
  return {
    ...options,
    runtime: options.runtime || "browser",
    engine: options.engine || "merkava",
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

  let interactionLog = [];
  let interactionError = null;
  try {
    interactionLog = await applyInteractions(
      raw.runtime,
      runOptions.interactions || []
    );
  } catch (error) {
    interactionError = error;
    raw.ok = false;
    raw.result = {
      ...(raw.result || {}),
      ok: false,
      error: error.message,
      stack: error.stack || ""
    };
  }

  if (raw.runtime?.snapshot) {
    raw.result.snapshot = raw.runtime.snapshot();
  }

  const result = normalizeRuntimeResult(
    { ...raw, interactionLog },
    { ...runOptions, files }
  );

  const extracted = extractRequestedValues(raw, runOptions);
  result.values = extracted.values;
  if (extracted.awtsmoosResult !== undefined) result.awtsmoosResult = extracted.awtsmoosResult;

  result.interactions = runOptions.interactions || [];
  result.interactionLog = interactionLog;
  result.interactionError = interactionError ? { message: interactionError.message, stack: interactionError.stack || "" } : null;
  result.epochs = [
    { id: 0, name: "boot", ok: raw.ok !== false },
    { id: 1, name: "interactions", count: interactionLog.length, ok: true }
  ];

  return result;
}

export async function simulateRuntime(options = {}) {
  const normalized = normalizeOptions(options);

  if (normalized.engine === "merkava" || normalized.engine === "md2" || normalized.bytecode === "merkava" || normalized.bytecode === "md2" || normalized.mode === "merkava" || normalized.mode === "md2") {
    const { simulateMerkavaRuntime } = await import("../merkava/merkavaRuntime.js");
    return simulateMerkavaRuntime(normalized);
  }

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
