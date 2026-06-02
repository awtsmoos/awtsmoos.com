// B"H
/**
 * @file simulateRuntime.js
 * @description
 * Simulates Merkava and emits values, DOM, canvas/WebGL ledgers, and PNG
 * snapshots. DOM snapshotting is custom, not generic circular cloning, so style
 * and children do not collapse into [DepthLimit] and canvas boxes stay visible.
 */
import RuntimeAssemblerModule from "../../merkava-runtime/RuntimeAssembler.js";
const { RuntimeAssembler } = RuntimeAssemblerModule;
import { executeWorkflow } from "../flow/executeWorkflow.js";
import { createActionRegistry } from "../actions/actionRegistry.js";
import { normalizeRuntimeResult } from "../snapshots/normalizeRuntimeResult.js";
import { instrumentSource } from "../instrumentation/instrumentSource.js";
import { applyInteractions } from "../interactions/applyInteractions.js";
import { collectUrlFiles } from "./collectUrlFiles.js";
import { enrichSnapshotImage, wantsSnapshotImage } from "../snapshots/snapshotImage.js";
import ProbeEvaluatorModule from "../../merkava-binary/MerkavaProbeEvaluator.js";
const { evaluateMerkavaProbeExpressions, cloneProbeValue } = ProbeEvaluatorModule;

function decodeJsonMaybe(value, fallback) { if (!value) return fallback; if (typeof value === "object") return value; try { return JSON.parse(String(value)); } catch { return fallback; } }
function readPath(root, key) { return !root || !key ? undefined : String(key).split(".").reduce((v, p) => v == null ? undefined : v[p], root); }
function cloneValue(value) { return cloneProbeValue(value); }
function fileCount(files = {}) { return Object.keys(files || {}).length; }
function normalizeActionInput(options) { return decodeJsonMaybe(options.browserActions || options.pageActions || options.actionsJson, options.browserActions || options.pageActions || options.actions || options.interactions || []); }

function safeClone(value, seen = new WeakSet(), depth = 0) {
  if (value == null || typeof value !== "object") return value;
  if (seen.has(value)) return "[Circular]";
  if (depth > 6) return "[DepthLimit]";
  seen.add(value);
  if (Array.isArray(value)) return value.slice(0, 200).map(item => safeClone(item, seen, depth + 1));
  const out = {};
  for (const key of Object.keys(value).slice(0, 240)) {
    if (["window", "document", "parent", "self", "globalThis", "interactions", "ownerDocument", "parentNode", "children", "childNodes"].includes(key)) continue;
    try { out[key] = safeClone(value[key], seen, depth + 1); } catch (error) { out[key] = `[Uncloneable:${error.message}]`; }
  }
  return out;
}

function liveDocument(raw) { return raw?.runtime?.window?.document || null; }
function liveDomSnapshot(raw) { const doc = liveDocument(raw); return { html: doc?.documentElement?.outerHTML || null, text: doc?.body?.innerText || doc?.body?.textContent || null }; }
function compactDomTree(raw) { return compactNode(liveDocument(raw)?.documentElement || null, 0); }
function compactNode(node, depth) {
  if (!node || depth > 80) return null;
  const localName = String(node.localName || node.tagName || "").toLowerCase();
  const children = Array.from(node.children || []).map(child => compactNode(child, depth + 1)).filter(Boolean);
  return {
    tagName: node.tagName || localName,
    localName,
    nodeType: node.nodeType || 1,
    id: node.id || "",
    className: node.className || node.attributes?.class || "",
    textContent: localName === "script" || localName === "style" ? String(node._textContent || node.textContent || "") : ownText(node),
    width: Number(node.width || node.attributes?.width || 0) || 0,
    height: Number(node.height || node.attributes?.height || 0) || 0,
    attributes: { ...(node.attributes || {}) },
    style: node.style?.toJSON?.() || { ...(node.style || {}) },
    children
  };
}
function ownText(node) { if (!node) return ""; if (!Array.from(node.children || []).length) return String(node.textContent || ""); return String(node._textContent || ""); }
function canvasSnapshot(raw) { return compactCanvasSnapshot(liveDocument(raw)?.textureArena?.snapshot?.() || null); }
function compactCanvasSnapshot(snapshot) {
  if (!snapshot) return null;
  const commands = Array.isArray(snapshot.commands) ? snapshot.commands.map(compactCanvasCommand) : [];
  const textures = Array.isArray(snapshot.textures) ? snapshot.textures.map(texture => ({
    id: texture.id,
    kind: texture.kind,
    ownerTag: texture.ownerTag,
    width: texture.width,
    height: texture.height,
    commands: Array.isArray(texture.commands) ? texture.commands.map(compactCanvasCommand) : []
  })) : [];
  return { textures, commands };
}
function compactCanvasCommand(command = {}) {
  const out = {};
  for (const [key, value] of Object.entries(command)) {
    if (key === 'state') out.state = compactCanvasState(value);
    else if (key === 'path') out.path = clonePathArray(value);
    else if (key === 'fillStyle' || key === 'strokeStyle') out[key] = compactPaint(value);
    else out[key] = clonePlainCanvasValue(value, 0);
  }
  return out;
}
function compactCanvasState(state = {}) {
  const out = {};
  for (const [key, value] of Object.entries(state || {})) out[key] = compactPaint(value);
  return out;
}
function compactPaint(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(item => clonePlainCanvasValue(item, 0));
  const out = {};
  for (const [key, inner] of Object.entries(value)) {
    if (key === 'image') continue;
    out[key] = clonePlainCanvasValue(inner, 0);
  }
  return out;
}
function clonePathArray(value) { return Array.isArray(value) ? value.map(step => Array.isArray(step) ? step.map(item => clonePlainCanvasValue(item, 0)) : clonePlainCanvasValue(step, 0)) : []; }
function clonePlainCanvasValue(value, depth) {
  if (value == null || typeof value !== 'object') return value;
  if (depth > 8) return '[DepthLimit]';
  if (Array.isArray(value)) return value.map(item => clonePlainCanvasValue(item, depth + 1));
  const out = {};
  for (const [key, inner] of Object.entries(value)) {
    if (['window','document','ownerDocument','parentNode','children','childNodes','self','globalThis'].includes(key)) continue;
    out[key] = clonePlainCanvasValue(inner, depth + 1);
  }
  return out;
}
function cssTextFromFiles(hydrated = {}) {
  const files = hydrated.files || {};
  const entry = hydrated.entry || "index.html";
  const html = String(files[entry] || files[`/${entry}`] || Object.entries(files).find(([k]) => k.endsWith(".html"))?.[1] || "");
  return [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(match => match[1]).join("\n");
}

async function makeSnapshot(raw, result, hydrated, extracted) {
  const live = liveDomSnapshot(raw);
  const runtimeSnapshot = raw.runtime?.snapshot ? safeClone(raw.runtime.snapshot()) : null;
  const resultSnapshot = safeClone(raw.result?.snapshot || result.snapshot || null);
  const base = {
    format: hydrated.format || "json",
    fullPage: Boolean(hydrated.fullPage),
    html: live.html || null,
    text: live.text || null,
    dom: compactDomTree(raw),
    values: extracted.values || {},
    console: safeClone(raw.console || result.console || []),
    errors: safeClone(result.errors || raw.result?.errors || []),
    canvas: canvasSnapshot(raw),
    cssText: cssTextFromFiles(hydrated),
    runtime: runtimeSnapshot,
    result: resultSnapshot
  };
  return await enrichSnapshotImage(base, { wantImage: wantsSnapshotImage(hydrated), width: hydrated.width || hydrated.viewportWidth || 960, height: hydrated.height || hydrated.viewportHeight || 640, timeoutMs: hydrated.screenshotTimeoutMs || 20000, backend: hydrated.snapshotBackend || hydrated.screenshotBackend || "merkava" });
}

async function extractRequestedValues(raw, runOptions = {}) {
  const runtime = raw?.runtime;
  const windowObj = runtime?.window || null;
  const nodeSnapshot = runtime?.snapshot ? runtime.snapshot() : null;
  const requested = Array.isArray(runOptions.returnValues) ? runOptions.returnValues : Array.isArray(runOptions.values) ? runOptions.values : [];
  const sources = { window: windowObj, globalThis, result: raw?.result?.result, snapshot: nodeSnapshot };
  const values = {}, expressionKeys = [];
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
  return { ...options, runtime: options.runtime || "browser", engine: "merkava", entry: options.entry || "index.html", files: decodeJsonMaybe(options.files, options.files || {}), workflow: decodeJsonMaybe(options.workflow, options.workflow || null), probes: decodeJsonMaybe(options.probes, options.probes || []), returnValues: decodeJsonMaybe(options.returnValues || options.values, options.returnValues || options.values || []), values: decodeJsonMaybe(options.values || options.returnValues, options.values || options.returnValues || []), interactions: normalizeActionInput(options), snapshot: Boolean(options.snapshot), format: options.format || "json", fullPage: Boolean(options.fullPage), snapshotBackend: options.snapshotBackend || options.screenshotBackend || "merkava" };
}
export function instrumentFiles(files = {}, probes = []) { if (!Array.isArray(probes) || !probes.length) return files; const next = { ...files }; for (const file of Object.keys(next)) if (file.endsWith(".js")) next[file] = instrumentSource(file, next[file], probes); return next; }
async function hydrateUrlOptions(options) { if (!options.url || fileCount(options.files) > 0) return options; const collected = await collectUrlFiles(options); return { ...options, files: collected.files, entry: collected.entry || options.entry || "index.html", origin: collected.origin || options.origin, url: collected.url || options.url, urlCollection: { fetchedCount: collected.fetchedCount, diagnostics: collected.diagnostics || [] } }; }
function assemblerFailure(error) { return { ok: false, assembly: null, result: { ok: false, error: error.message, stack: error.stack || "", code: error.code || null, trace: error.trace || null, snapshot: null }, runtime: null, graph: null, console: [] }; }
async function bootRuntime(hydrated, files) { const assembler = new RuntimeAssembler({ ...hydrated, files }); try { return await assembler.run(hydrated.entry); } catch (error) { return assemblerFailure(error); } }
async function runActions(raw, hydrated) { try { return { interactionLog: await applyInteractions(raw.runtime, hydrated.interactions || []), interactionError: null }; } catch (error) { raw.ok = false; raw.result = { ...(raw.result || {}), ok: false, error: error.message, stack: error.stack || "" }; return { interactionLog: Array.isArray(error.browserActionLog) ? error.browserActionLog : [], interactionError: error }; } }
async function decorateResult(result, raw, hydrated, files, extracted, actionReport) {
  result.engine = "merkava"; result.browserRuntime = false; result.urlCollection = hydrated.urlCollection || null; result.values = extracted.values; result.valueErrors = extracted.valueErrors || {};
  if (extracted.awtsmoosResult !== undefined) result.awtsmoosResult = extracted.awtsmoosResult;
  result.interactions = hydrated.interactions || []; result.interactionLog = actionReport.interactionLog; result.browserActionLog = actionReport.interactionLog; result.interactionError = actionReport.interactionError ? { message: actionReport.interactionError.message, stack: actionReport.interactionError.stack || "" } : null;
  result.epochs = [{ id: 0, name: "url-collect", ok: !hydrated.urlCollection?.diagnostics?.length, fetchedCount: hydrated.urlCollection?.fetchedCount || fileCount(files) }, { id: 1, name: "merkava-boot", ok: raw.ok !== false }, { id: 2, name: "actions", count: actionReport.interactionLog.length, ok: !actionReport.interactionError }];
  if (hydrated.snapshot) result.snapshot = await makeSnapshot(raw, result, hydrated, extracted);
  return result;
}
async function runMerkavaAssemblerOnce(runOptions) { const hydrated = await hydrateUrlOptions(runOptions); const files = instrumentFiles(hydrated.files, hydrated.probes); const raw = await bootRuntime(hydrated, files); const actionReport = await runActions(raw, hydrated); if (raw.runtime?.snapshot && raw.result) raw.result.snapshot = raw.runtime.snapshot(); const result = normalizeRuntimeResult({ ...raw, interactionLog: actionReport.interactionLog }, { ...hydrated, files }); const extracted = await extractRequestedValues(raw, hydrated); return await decorateResult(result, raw, hydrated, files, extracted, actionReport); }
export async function simulateRuntime(options = {}) { try { const normalized = normalizeOptions(options); if (normalized.workflow) { const ctx = { ...normalized, options: normalized, result: null }; const actions = createActionRegistry(runMerkavaAssemblerOnce); const workflowResult = await executeWorkflow(normalized.workflow, ctx, actions); return ctx.result || workflowResult || { ok: true, workflow: true, engine: "merkava" }; } return await runMerkavaAssemblerOnce(normalized); } catch (error) { return { ok: false, engine: "merkava", browserRuntime: false, error: error.message, code: error.code || null, trace: error.trace || null, stack: error.stack || "", errors: [{ message: error.message, code: error.code || null, trace: error.trace || null, stack: error.stack || "" }], epochs: [{ id: 0, name: "simulateRuntime-public-catch", ok: false }] }; } }
export async function runtimeWorkflow(options = {}) { return simulateRuntime(options); }
