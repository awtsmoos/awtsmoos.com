// B"H
/**
 * @file simulateRuntime.js
 * @description Chapter 80: The action log fell through a crack in the world,
 * and the Awtsmoos revealed the crack by letting a form succeed while its
 * evidence vanished. This service keeps URL collection, runtime assembly,
 * probes, return values, and Puppeteer-like action records inside one
 * Merkava-only vessel. No Chromium is summoned.
 */
import RuntimeAssemblerModule from "../../merkava-runtime/RuntimeAssembler.js";
const { RuntimeAssembler } = RuntimeAssemblerModule;
import { executeWorkflow } from "../flow/executeWorkflow.js";
import { createActionRegistry } from "../actions/actionRegistry.js";
import { normalizeRuntimeResult } from "../snapshots/normalizeRuntimeResult.js";
import { instrumentSource } from "../instrumentation/instrumentSource.js";
import { applyInteractions } from "../interactions/applyInteractions.js";
import { collectUrlFiles } from "./collectUrlFiles.js";
import ProbeEvaluatorModule from "../../merkava-binary/MerkavaProbeEvaluator.js";
const { evaluateMerkavaProbeExpressions, cloneProbeValue } = ProbeEvaluatorModule;

function decodeJsonMaybe(value, fallback) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try { return JSON.parse(String(value)); } catch (_) { return fallback; }
}

function readPath(root, key) {
  if (!root || !key) return undefined;
  return String(key).split(".").reduce((value, part) => value == null ? undefined : value[part], root);
}

function cloneValue(value) { return cloneProbeValue(value); }

function normalizeActionInput(options) {
  return decodeJsonMaybe(
    options.browserActions || options.pageActions || options.actionsJson,
    options.browserActions || options.pageActions || options.actions || options.interactions || []
  );
}

function fileCount(files = {}) { return Object.keys(files || {}).length; }

async function extractRequestedValues(raw, runOptions = {}) {
  const runtime = raw?.runtime;
  const windowObj = runtime?.window || null;
  const nodeSnapshot = runtime?.snapshot ? runtime.snapshot() : null;
  const requested = Array.isArray(runOptions.returnValues) ? runOptions.returnValues : Array.isArray(runOptions.values) ? runOptions.values : [];
  const sources = { window: windowObj, globalThis, result: raw?.result?.result, snapshot: nodeSnapshot };
  const values = {};
  const expressionKeys = [];
  for (const key of requested) {
    const plain = String(key);
    const pathValue = readPath(sources, plain) ?? readPath(windowObj, plain) ?? readPath(raw?.result?.result, plain) ?? readPath(nodeSnapshot, plain);
    if (pathValue !== undefined && !/[()!?|&+\-*/%<>=]/.test(plain)) values[plain] = cloneValue(pathValue);
    else expressionKeys.push(plain);
  }
  const probe = expressionKeys.length ? await evaluateMerkavaProbeExpressions({ windowObj, expressions: expressionKeys }) : { values: {}, errors: {} };
  Object.assign(values, probe.values || {});
  const awtsmoosResult = cloneValue(windowObj?.__awtsmoosResult ?? raw?.result?.result?.__awtsmoosResult ?? globalThis.__awtsmoosResult);
  return { values, valueErrors: probe.errors || {}, awtsmoosResult };
}

export function normalizeOptions(options = {}) {
  return {
    ...options,
    runtime: options.runtime || "browser",
    engine: "merkava",
    entry: options.entry || "index.html",
    files: decodeJsonMaybe(options.files, options.files || {}),
    workflow: decodeJsonMaybe(options.workflow, options.workflow || null),
    probes: decodeJsonMaybe(options.probes, options.probes || []),
    returnValues: decodeJsonMaybe(options.returnValues || options.values, options.returnValues || options.values || []),
    values: decodeJsonMaybe(options.values || options.returnValues, options.values || options.returnValues || []),
    interactions: normalizeActionInput(options)
  };
}

export function instrumentFiles(files = {}, probes = []) {
  if (!Array.isArray(probes) || !probes.length) return files;
  const next = { ...files };
  for (const file of Object.keys(next)) if (file.endsWith(".js")) next[file] = instrumentSource(file, next[file], probes);
  return next;
}

async function hydrateUrlOptions(options) {
  if (!options.url || fileCount(options.files) > 0) return options;
  const collected = await collectUrlFiles(options);
  return {
    ...options,
    files: collected.files,
    entry: collected.entry || options.entry || "index.html",
    origin: collected.origin || options.origin,
    url: collected.url || options.url,
    urlCollection: { fetchedCount: collected.fetchedCount, diagnostics: collected.diagnostics || [] }
  };
}

function assemblerFailure(error) {
  return {
    ok: false,
    assembly: null,
    result: { ok: false, error: error.message, stack: error.stack || '', code: error.code || null, trace: error.trace || null, snapshot: null },
    runtime: null,
    graph: null,
    console: []
  };
}

async function bootRuntime(hydrated, files) {
  const assembler = new RuntimeAssembler({ ...hydrated, files });
  try { return await assembler.run(hydrated.entry); }
  catch (error) { return assemblerFailure(error); }
}

async function runActions(raw, hydrated) {
  try {
    return { interactionLog: await applyInteractions(raw.runtime, hydrated.interactions || []), interactionError: null };
  } catch (error) {
    raw.ok = false;
    raw.result = { ...(raw.result || {}), ok: false, error: error.message, stack: error.stack || "" };
    return {
      interactionLog: Array.isArray(error.browserActionLog) ? error.browserActionLog : [],
      interactionError: error
    };
  }
}

function decorateResult(result, raw, hydrated, files, extracted, actionReport) {
  result.engine = "merkava";
  result.browserRuntime = false;
  result.urlCollection = hydrated.urlCollection || null;
  result.values = extracted.values;
  result.valueErrors = extracted.valueErrors || {};
  if (extracted.awtsmoosResult !== undefined) result.awtsmoosResult = extracted.awtsmoosResult;
  result.interactions = hydrated.interactions || [];
  result.interactionLog = actionReport.interactionLog;
  result.browserActionLog = actionReport.interactionLog;
  result.interactionError = actionReport.interactionError ? { message: actionReport.interactionError.message, stack: actionReport.interactionError.stack || "" } : null;
  result.epochs = [
    { id: 0, name: "url-collect", ok: !hydrated.urlCollection?.diagnostics?.length, fetchedCount: hydrated.urlCollection?.fetchedCount || fileCount(files) },
    { id: 1, name: "merkava-boot", ok: raw.ok !== false },
    { id: 2, name: "actions", count: actionReport.interactionLog.length, ok: !actionReport.interactionError }
  ];
  return result;
}

async function runMerkavaAssemblerOnce(runOptions) {
  const hydrated = await hydrateUrlOptions(runOptions);
  const files = instrumentFiles(hydrated.files, hydrated.probes);
  const raw = await bootRuntime(hydrated, files);
  const actionReport = await runActions(raw, hydrated);
  if (raw.runtime?.snapshot) raw.result.snapshot = raw.runtime.snapshot();
  const result = normalizeRuntimeResult({ ...raw, interactionLog: actionReport.interactionLog }, { ...hydrated, files });
  const extracted = await extractRequestedValues(raw, hydrated);
  return decorateResult(result, raw, hydrated, files, extracted, actionReport);
}

export async function simulateRuntime(options = {}) {
  try {
    const normalized = normalizeOptions(options);
    if (normalized.workflow) {
      const ctx = { ...normalized, options: normalized, result: null };
      const actions = createActionRegistry(runMerkavaAssemblerOnce);
      const workflowResult = await executeWorkflow(normalized.workflow, ctx, actions);
      return ctx.result || workflowResult || { ok: true, workflow: true, engine: "merkava" };
    }
    return await runMerkavaAssemblerOnce(normalized);
  } catch (error) {
    return { ok: false, engine: "merkava", browserRuntime: false, error: error.message, code: error.code || null, trace: error.trace || null, stack: error.stack || "", errors: [{ message: error.message, code: error.code || null, trace: error.trace || null, stack: error.stack || "" }], epochs: [{ id: 0, name: "simulateRuntime-public-catch", ok: false }] };
  }
}

export async function runtimeWorkflow(options = {}) { return simulateRuntime(options); }
