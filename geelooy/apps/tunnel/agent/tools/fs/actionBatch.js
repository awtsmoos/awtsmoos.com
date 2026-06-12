// B"H

const CARRIER_KEYS = ["params", "content", "body", "query", "goal", "text", "actionsJson", "workflow", "commandTree", "tree", "steps", "actions", "do"];
const B64_KEYS = ["params64", "content64", "actionsJson64", "workflow64", "steps64"];

/**
 * B"H
 * Chapter 422: The Command Tree Accepted Every Honest Scroll.
 *
 * A tree may arrive as a native array, JSON text, base64 JSON, `content`,
 * `params`, `actionsJson`, `workflow`, `steps`, or `do`. The Awtsmoos fuses the
 * carriers, runs nested branches, and leaves a next agent no hidden ritual.
 */
async function runActionBatch(payload = {}, runAction) {
  const fused = fusePayload(payload);
  const steps = normalizeSteps(fused);
  const ctx = { ok: true, vars: objectish(fused.vars), policy: objectish(fused.policy), results: [], named: {}, last: null, error: null, dryRun: !!(fused.dryRun || fused.explainOnly || fused.validateOnly) };
  const options = { stopOnError: fused.stopOnError !== false && fused.stopOnError !== "false", maxSteps: Number(fused.maxSteps || fused.policy?.maxSteps || 200), retryDelayMs: Number(fused.retryDelayMs || 0) };
  if (fused.validateOnly) return { ok: true, action: fused.action || "actionBatch", validated: true, plan: explainSteps(steps), acceptedCarriers: CARRIER_KEYS };
  try { await runSteps(steps, ctx, runAction, options); }
  finally { if (fused.finally) await runSteps(asSteps(fused.finally), ctx, runAction, options); }
  ctx.ok = ctx.results.every(item => item.ok !== false);
  return batchReturn(fused, ctx);
}

async function runSteps(steps, ctx, runAction, options) {
  for (const step of asSteps(steps)) await runOneStep(step, ctx, runAction, options);
}

async function runOneStep(step, ctx, runAction, options) {
  if (ctx.results.length >= options.maxSteps) throw new Error(`actionBatch maxSteps exceeded: ${options.maxSteps}`);
  if (!step || typeof step !== "object") return;
  if (step.if || step.when || step.condition) {
    const passed = await evaluateCondition(step.if || step.when || step.condition, ctx, runAction);
    if (step.then || step.else || step.do) return await runSteps(passed ? (step.then || step.do) : step.else, ctx, runAction, options);
    if (!passed) return;
  }
  if (step.parallel) return await runParallel(step, ctx, runAction, options);
  if (step.forEach) return await runForEach(step, ctx, runAction, options);
  if (step.until) return await runLoop("until", step, ctx, runAction, options);
  if (step.while) return await runLoop("while", step, ctx, runAction, options);
  if (step.assert) return await runAssert(step, ctx, runAction, options);
  if (step.do && !step.action && !step.type && !step.call) return await runSteps(step.do, ctx, runAction, options);
  return await runActionStep(step, ctx, runAction, options);
}

async function runParallel(step, ctx, runAction, options) {
  const branches = asSteps(step.parallel);
  if (ctx.dryRun) return record(ctx, step, { ok: true, dryRun: true, parallel: branches.length });
  const snapshots = branches.map(() => forkCtx(ctx));
  const branchResults = await Promise.all(branches.map((branch, i) => runSteps(asSteps(branch), snapshots[i], runAction, options).then(() => snapshots[i])));
  for (const branch of branchResults) mergeCtx(ctx, branch);
  return record(ctx, step, { ok: branchResults.every(b => b.ok !== false), parallel: branchResults.length });
}

async function runForEach(step, ctx, runAction, options) {
  const list = await resolveValue(step.forEach.in || step.forEach.items || [], ctx, runAction) || [];
  const arr = Array.isArray(list) ? list : Object.values(list);
  for (let i = 0; i < arr.length; i++) { ctx.vars[step.forEach.as || "item"] = arr[i]; ctx.vars.index = i; await runSteps(step.forEach.do || step.do || [], ctx, runAction, options); }
  return record(ctx, step, { ok: true, forEach: arr.length });
}

async function runLoop(kind, step, ctx, runAction, options) {
  const box = step[kind];
  const max = Number(box.maxIterations || step.maxIterations || options.maxSteps);
  let count = 0;
  const keepGoing = async () => kind === "until" ? !(await evaluateCondition(box.condition || box, ctx, runAction)) : await evaluateCondition(box.condition || box, ctx, runAction);
  while ((await keepGoing()) && count++ < max) await runSteps(box.do || step.do || [], ctx, runAction, options);
  return record(ctx, step, { ok: true, [kind]: count });
}

async function runAssert(step, ctx, runAction, options) {
  const ok = await evaluateCondition(step.assert, ctx, runAction);
  const result = { ok, assertion: step.assert, message: ok ? "assertion_passed" : "assertion_failed" };
  record(ctx, step, result);
  if (!ok && options.stopOnError && step.stopOnError !== false) throw new Error(result.message);
}

async function runActionStep(step, ctx, runAction, options) {
  const attempts = Math.max(1, Number(step.retry?.times || step.retries || 1));
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      if (ctx.dryRun) return record(ctx, step, { ok: true, dryRun: true, wouldRun: publicStep(step), attempt });
      const result = await invokeAction(step, ctx, runAction);
      record(ctx, step, result, attempt);
      if (step.saveAs || step.id) ctx.named[step.saveAs || step.id] = result;
      if (result?.ok === false && attempt < attempts) { await sleep(Number(step.retry?.delayMs || options.retryDelayMs || 0)); continue; }
      if (result?.ok === false && step.onError) await runSteps(asSteps(step.onError), ctx, runAction, options);
      if (result?.ok === false && options.stopOnError && step.stopOnError !== false) break;
      if (step.then) await runSteps(asSteps(step.then), ctx, runAction, options);
      return;
    } catch (error) { lastError = error; if (attempt < attempts) await sleep(Number(step.retry?.delayMs || options.retryDelayMs || 0)); }
  }
  ctx.error = { message: lastError?.message || "action_failed", stack: lastError?.stack || "", step: step.action || step.type || null };
  record(ctx, step, { ok: false, error: ctx.error });
  if (step.onError) await runSteps(asSteps(step.onError), ctx, runAction, options);
  else if (options.stopOnError && step.stopOnError !== false) throw lastError;
}

async function invokeAction(step, ctx, runAction) {
  const action = step.action || step.type || step.call;
  if (!action) return { ok: true, skipped: true, reason: "missing_action" };
  const payload = await resolvePayload({ ...(step.payload || step.with || {}), action }, ctx, runAction);
  return await runAction(payload);
}

function normalizeSteps(payload) {
  const fused = fusePayload(payload);
  if (Array.isArray(fused)) return fused;
  if (typeof fused === "string") return normalizeSteps(parseJson(fused, []));
  const raw = firstDefined(fused.steps, fused.actions, fused.workflow, fused.commandTree, fused.tree, fused.do, fused.plan);
  const parsed = parseJson(raw, raw);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && parsed.steps) return asSteps(parsed.steps);
  if (parsed && parsed.actions) return asSteps(parsed.actions);
  if (parsed && parsed.do) return asSteps(parsed.do);
  return asSteps(parsed);
}

function fusePayload(payload = {}) {
  let out = Array.isArray(payload) ? payload : { ...objectish(payload) };
  if (Array.isArray(out)) return out;
  for (const key of B64_KEYS) Object.assign(out, objectish(parseBase64Json(out[key], {})));
  for (const key of CARRIER_KEYS) {
    const parsed = parseJson(out[key], null);
    if (Array.isArray(parsed)) out.steps = parsed;
    else if (parsed && typeof parsed === "object") Object.assign(out, parsed);
  }
  return out;
}

function parseJson(value, fallback) {
  if (value && typeof value === "object") return value;
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  if (!text || !/^[\[{]/.test(text)) return fallback;
  try { return JSON.parse(text); } catch { return fallback; }
}

function parseBase64Json(value, fallback) {
  if (!value) return fallback;
  try { return parseJson(Buffer.from(String(value), "base64").toString("utf8"), fallback); } catch { return fallback; }
}

function objectish(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
function firstDefined(...values) { return values.find(value => value !== undefined && value !== null && value !== ""); }
function asSteps(value) { return Array.isArray(value) ? value : value ? [value] : []; }

async function resolvePayload(value, ctx, runAction) {
  if (Array.isArray(value)) return Promise.all(value.map(item => resolvePayload(item, ctx, runAction)));
  if (!value || typeof value !== "object") return await resolveValue(value, ctx, runAction);
  const out = {};
  for (const [key, val] of Object.entries(value)) out[key] = await resolveValue(val, ctx, runAction);
  return out;
}

async function resolveValue(value, ctx, runAction) {
  if (typeof value === "string" && value.startsWith("$ctx.")) return getPath(ctx, value.slice(5));
  if (typeof value === "string" && value.startsWith("$vars.")) return getPath(ctx.vars, value.slice(6));
  if (typeof value === "string" && /\$(ctx|vars)\.[A-Za-z0-9_.-]+/.test(value)) return interpolate(value, ctx);
  if (typeof value === "string" && value.startsWith("$action.")) return await resolveActionRef(value, "record", runAction);
  if (typeof value === "string" && value.startsWith("$result.")) return await resolveActionRef(value, "output", runAction);
  if (Array.isArray(value)) return Promise.all(value.map(item => resolveValue(item, ctx, runAction)));
  if (value && typeof value === "object") return await resolvePayload(value, ctx, runAction);
  return value;
}

async function resolveActionRef(value, mode, runAction) {
  const [, id, ...rest] = value.split(".");
  const got = await runAction({ action: "actionHistoryGet", actionId: id });
  const base = mode === "output" ? got.record && got.record.output : got.record;
  return rest.length ? getPath(base, rest.join(".")) : base;
}

function interpolate(text, ctx) {
  return String(text).replace(/\$(ctx|vars)\.([A-Za-z0-9_.-]+)/g, (_, root, key) => String(getPath(root === "ctx" ? ctx : ctx.vars, key) ?? ""));
}

async function evaluateCondition(condition, ctx, runAction) {
  const c = parseJson(condition, condition);
  if (c === true) return true;
  if (!c) return false;
  if (Array.isArray(c.all)) { for (const item of c.all) if (!(await evaluateCondition(item, ctx, runAction))) return false; return true; }
  if (Array.isArray(c.any)) { for (const item of c.any) if (await evaluateCondition(item, ctx, runAction)) return true; return false; }
  if (c.not) return !(await evaluateCondition(c.not, ctx, runAction));
  const left = c.path ? await resolveValue(String(c.path).startsWith("$") ? c.path : "$ctx." + c.path, ctx, runAction) : await resolveValue(c.left, ctx, runAction);
  const op = c.operator || c.op || Object.keys(c).find(k => ["eq", "ne", "gt", "gte", "lt", "lte", "includes", "regex", "truthy", "falsy", "exists", "missing", "ok", "failed"].includes(k)) || "truthy";
  const expected = c[op] !== undefined ? await resolveValue(c[op], ctx, runAction) : await resolveValue(c.right, ctx, runAction);
  return compare(op, left, expected, ctx);
}

function compare(op, a, b, ctx) {
  const ops = { truthy: x => !!x, falsy: x => !x, exists: x => x !== undefined && x !== null, missing: x => x === undefined || x === null, ok: x => (x ?? ctx.last)?.ok !== false, failed: x => (x ?? ctx.last)?.ok === false, eq: (x, y) => x === y, ne: (x, y) => x !== y, gt: (x, y) => x > y, gte: (x, y) => x >= y, lt: (x, y) => x < y, lte: (x, y) => x <= y, includes: (x, y) => Array.isArray(x) ? x.includes(y) : String(x || "").includes(String(y || "")), regex: (x, y) => new RegExp(String(y)).test(String(x || "")) };
  try { return !!(ops[op] || ops.truthy)(a, b); } catch { return false; }
}

function record(ctx, step, result, attempt = 1) {
  ctx.last = result;
  const item = { name: step.name || step.id || step.saveAs || null, action: step.action || step.type || step.call || "control", ok: result?.ok !== false, attempt, result };
  ctx.results.push(item);
  if (item.ok === false) ctx.ok = false;
  return item;
}

function batchReturn(payload, ctx) {
  const maxInlineBytes = Number(payload.maxInlineBytes || 12000);
  const continuationPrompt = payload.continuationPrompt || payload.config?.continuationPrompt || process.env.AWTSMOOS_CONTINUATION_PROMPT || "";
  return { ok: ctx.ok, action: payload.action || "actionBatch", count: ctx.results.length, finalInstruction: continuationPrompt ? { role: "user", content: continuationPrompt } : null, results: compactForReturn(ctx.results, maxInlineBytes), named: compactForReturn(ctx.named, maxInlineBytes), vars: compactForReturn(ctx.vars, maxInlineBytes), last: compactForReturn(ctx.last, maxInlineBytes), error: ctx.error, compacted: true, maxInlineBytes, acceptedCarriers: CARRIER_KEYS, plan: ctx.dryRun ? explainSteps(normalizeSteps(payload)) : undefined };
}

function compactForReturn(value, maxInlineBytes) {
  if (!value || typeof value !== "object") return value;
  const text = JSON.stringify(value);
  if (Buffer.byteLength(text, "utf8") <= maxInlineBytes) return value;
  return { ok: value.ok !== false, compacted: true, inlineBytes: Buffer.byteLength(text, "utf8"), maxInlineBytes, actionId: value.actionId || value.result?.actionId || null, outputRef: value.outputRef || value.result?.outputRef || null, access: "Increase maxInlineBytes or inspect parent outputRef/action history." };
}

function getPath(target, p) { return String(p || "").split(".").filter(Boolean).reduce((acc, key) => acc?.[key], target); }
function forkCtx(ctx) { return { ...ctx, results: [], named: { ...ctx.named }, vars: { ...ctx.vars }, last: ctx.last, error: null }; }
function mergeCtx(ctx, branch) { ctx.results.push(...branch.results); Object.assign(ctx.named, branch.named); Object.assign(ctx.vars, branch.vars); ctx.last = branch.last || ctx.last; if (branch.error) ctx.error = branch.error; }
function sleep(ms) { return ms > 0 ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve(); }
function publicStep(step) { return { action: step.action || step.type || step.call || null, hasCondition: !!(step.if || step.when || step.condition), saveAs: step.saveAs || step.id || null }; }
function explainSteps(steps) { return asSteps(steps).map((step, index) => ({ index, ...publicStep(step), control: step.parallel ? "parallel" : step.forEach ? "forEach" : step.assert ? "assert" : step.do && !step.action ? "group" : "action" })); }

module.exports = { runActionBatch, evaluateCondition, normalizeSteps, explainSteps, fusePayload };
