// B"H
/**
 * @file simulateRuntime.js
 * @description The public runtime gate. Browser URLs now default to a real
 * Chrome/CDP witness; explicit Merkava/MD2 requests still descend into bytecode.
 * Thus the Awtsmoos has two vessels: living browser proof and compiled Merkava
 * execution, each named honestly.
 */
import RuntimeAssemblerModule from "../../merkava-runtime/RuntimeAssembler.js";
const { RuntimeAssembler } = RuntimeAssemblerModule;
import { executeWorkflow } from "../flow/executeWorkflow.js";
import { createActionRegistry } from "../actions/actionRegistry.js";
import { normalizeRuntimeResult } from "../snapshots/normalizeRuntimeResult.js";
import { instrumentSource } from "../instrumentation/instrumentSource.js";
import { applyInteractions } from "../interactions/applyInteractions.js";
import { simulateRealBrowserRuntime, wantsRealBrowser } from "./realBrowserRuntime.js";

function decodeJsonMaybe(value, fallback) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

function readPath(root, key) {
  if (!root || !key) return undefined;
  return String(key).split(".").reduce((value, part) => value == null ? undefined : value[part], root);
}

function cloneValue(value) {
  if (value === undefined) return undefined;
  try { return JSON.parse(JSON.stringify(value)); } catch (_) { return String(value); }
}

function normalizeBrowserActionInput(options) {
  return decodeJsonMaybe(
    options.browserActions || options.pageActions || options.actionsJson,
    options.browserActions || options.pageActions || options.actions || options.interactions || []
  );
}

function normalizeList(value) {
  const decoded = decodeJsonMaybe(value, value || []);
  if (Array.isArray(decoded)) return decoded;
  return String(decoded || "").split(",").map(item => item.trim()).filter(Boolean);
}

function extractRequestedValues(raw, runOptions = {}) {
  const runtime = raw?.runtime;
  const windowObj = runtime?.window || null;
  const nodeSnapshot = runtime?.snapshot ? runtime.snapshot() : null;
  const requested = Array.isArray(runOptions.returnValues) ? runOptions.returnValues : Array.isArray(runOptions.values) ? runOptions.values : [];
  const sources = { window: windowObj, globalThis, result: raw?.result?.result, snapshot: nodeSnapshot };
  const values = {};
  for (const key of requested) {
    const plain = String(key);
    values[plain] = cloneValue(readPath(sources, plain) ?? readPath(windowObj, plain) ?? readPath(raw?.result?.result, plain) ?? readPath(nodeSnapshot, plain));
  }
  const awtsmoosResult = cloneValue(windowObj?.__awtsmoosResult ?? raw?.result?.result?.__awtsmoosResult ?? globalThis.__awtsmoosResult);
  return { values, awtsmoosResult };
}

export function normalizeOptions(options = {}) {
  const values = normalizeList(options.returnValues || options.values || options.returnValues64 || options.values64);
  return {
    ...options,
    runtime: options.runtime || "browser",
    engine: options.engine || options.provider || options.mode || (options.url ? "real-browser" : "merkava"),
    entry: options.entry || "index.html",
    files: decodeJsonMaybe(options.files, options.files || {}),
    workflow: decodeJsonMaybe(options.workflow, options.workflow || null),
    probes: decodeJsonMaybe(options.probes, options.probes || []),
    interactions: normalizeBrowserActionInput(options),
    returnValues: values,
    values
  };
}

export function instrumentFiles(files = {}, probes = []) {
  if (!Array.isArray(probes) || !probes.length) return files;
  const next = { ...files };
  for (const file of Object.keys(next)) if (file.endsWith(".js")) next[file] = instrumentSource(file, next[file], probes);
  return next;
}

async function runOnce(runOptions) {
  const files = instrumentFiles(runOptions.files, runOptions.probes);
  const assembler = new RuntimeAssembler({ ...runOptions, files });
  const raw = await assembler.run(runOptions.entry);
  let interactionLog = [];
  let interactionError = null;
  try {
    interactionLog = await applyInteractions(raw.runtime, runOptions.interactions || []);
  } catch (error) {
    interactionError = error;
    raw.ok = false;
    raw.result = { ...(raw.result || {}), ok: false, error: error.message, stack: error.stack || "" };
  }
  if (raw.runtime?.snapshot) raw.result.snapshot = raw.runtime.snapshot();
  const result = normalizeRuntimeResult({ ...raw, interactionLog }, { ...runOptions, files });
  const extracted = extractRequestedValues(raw, runOptions);
  result.values = extracted.values;
  if (extracted.awtsmoosResult !== undefined) result.awtsmoosResult = extracted.awtsmoosResult;
  result.interactions = runOptions.interactions || [];
  result.interactionLog = interactionLog;
  result.browserActionLog = interactionLog;
  result.interactionError = interactionError ? { message: interactionError.message, stack: interactionError.stack || "" } : null;
  result.epochs = [{ id: 0, name: "boot", ok: raw.ok !== false }, { id: 1, name: "browser-actions", count: interactionLog.length, ok: !interactionError }];
  return result;
}

export async function simulateRuntime(options = {}) {
  const normalized = normalizeOptions(options);
  if (wantsRealBrowser(normalized)) return simulateRealBrowserRuntime(normalized);
  if (isMerkavaMode(normalized)) {
    const { simulateMerkavaRuntime } = await import("../merkava/merkavaRuntime.js");
    return simulateMerkavaRuntime(normalized);
  }
  if (normalized.workflow) {
    const ctx = { ...normalized, options: normalized, result: null };
    const actions = createActionRegistry(runOnce);
    const workflowResult = await executeWorkflow(normalized.workflow, ctx, actions);
    return ctx.result || workflowResult || { ok: true, workflow: true };
  }
  return runOnce(normalized);
}

function isMerkavaMode(options = {}) {
  const value = String(options.engine || options.bytecode || options.mode || "").toLowerCase();
  return ["merkava", "md2", "bytecode"].includes(value) || options.bytecode === true;
}

export async function runtimeWorkflow(options = {}) { return simulateRuntime(options); }
