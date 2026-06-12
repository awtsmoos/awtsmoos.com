// B"H

/**
 * Chapter 25: Many sparks became one command tree.
 *
 * This runner is a tiny declarative language for tunnel actions. It keeps AIs
 * away from raw shell strings when structured tool calls can express the same
 * intention. The language supports sequential steps, if/then/else, parallel
 * branches, forEach loops, retry/backoff, assertions, saveAs variables,
 * $ctx references, dry-run plans, onError branches, and finally blocks.
 */
async function runActionBatch(payload = {}, runAction) {
  const steps = normalizeSteps(payload);
  const ctx = {
    ok: true,
    vars: payload.vars || {},
    policy: payload.policy || {},
    results: [],
    named: {},
    last: null,
    error: null,
    dryRun: !!(payload.dryRun || payload.explainOnly || payload.validateOnly)
  };
  const options = {
    stopOnError: payload.stopOnError !== false,
    maxSteps: Number(payload.maxSteps || payload.policy?.maxSteps || 200),
    retryDelayMs: Number(payload.retryDelayMs || 0)
  };

  if (payload.validateOnly) {
    return { ok: true, action: payload.action || "actionBatch", validated: true, plan: explainSteps(steps) };
  }

  try {
    await runSteps(steps, ctx, runAction, options);
  } finally {
    if (payload.finally) await runSteps(asSteps(payload.finally), ctx, runAction, options);
  }

  ctx.ok = ctx.results.every(item => item.ok !== false);
  const continuationPrompt = payload.continuationPrompt || payload.config?.continuationPrompt || process.env.AWTSMOOS_CONTINUATION_PROMPT || "";
  const maxInlineBytes = Number(payload.maxInlineBytes || 12000);
  return {
    ok: ctx.ok,
    action: payload.action || "actionBatch",
    count: ctx.results.length,
    finalInstruction: continuationPrompt ? { role: "user", content: continuationPrompt } : null,
    results: compactForReturn(ctx.results, maxInlineBytes),
    named: compactForReturn(ctx.named, maxInlineBytes),
    vars: compactForReturn(ctx.vars, maxInlineBytes),
    last: compactForReturn(ctx.last, maxInlineBytes),
    error: ctx.error,
    compacted: true,
    maxInlineBytes,
    plan: ctx.dryRun ? explainSteps(steps) : undefined
  };
}

async function runSteps(steps, ctx, runAction, options) {
  for (const step of asSteps(steps)) await runOneStep(step, ctx, runAction, options);
}

async function runOneStep(step, ctx, runAction, options) {
  if (ctx.results.length >= options.maxSteps) throw new Error(`actionBatch maxSteps exceeded: ${options.maxSteps}`);
  if (!step || typeof step !== "object") return;

  if (step.if || step.when || step.condition) {
    const passed = await evaluateCondition(step.if || step.when || step.condition, ctx, runAction);
    if (step.then || step.else || step.do) {
      await runSteps(passed ? (step.then || step.do) : step.else, ctx, runAction, options);
      return;
    }
    if (!passed) return;
  }

  if (step.parallel) {
    const branches = asSteps(step.parallel);
    if (ctx.dryRun) return record(ctx, step, { ok: true, dryRun: true, parallel: branches.length });
    const snapshots = branches.map(() => forkCtx(ctx));
    const branchResults = await Promise.all(branches.map((branch, i) => runSteps(asSteps(branch), snapshots[i], runAction, options).then(() => snapshots[i])));
    for (const branch of branchResults) mergeCtx(ctx, branch);
    return record(ctx, step, { ok: branchResults.every(b => b.ok !== false), parallel: branchResults.length });
  }

  if (step.until) {
    const max = Number(step.until.maxIterations || step.maxIterations || options.maxSteps);
    let count = 0;
    while (!(await evaluateCondition(step.until.condition || step.until, ctx, runAction)) && count++ < max) await runSteps(step.until.do || step.do || [], ctx, runAction, options);
    return record(ctx, step, { ok: true, until: count });
  }

  if (step.while) {
    const max = Number(step.while.maxIterations || step.maxIterations || options.maxSteps);
    let count = 0;
    while ((await evaluateCondition(step.while.condition || step.while, ctx, runAction)) && count++ < max) await runSteps(step.while.do || step.do || [], ctx, runAction, options);
    return record(ctx, step, { ok: true, while: count });
  }

  if (step.forEach) {
    const list = await resolveValue(step.forEach.in || step.forEach.items || [], ctx, runAction) || [];
    const arr = Array.isArray(list) ? list : Object.values(list);
    for (let i = 0; i < arr.length; i++) {
      ctx.vars[step.forEach.as || "item"] = arr[i];
      ctx.vars.index = i;
      await runSteps(step.forEach.do || step.do || [], ctx, runAction, options);
    }
    return record(ctx, step, { ok: true, forEach: arr.length });
  }

  if (step.assert) {
    const ok = await evaluateCondition(step.assert, ctx, runAction);
    const result = { ok, assertion: step.assert, message: ok ? "assertion_passed" : "assertion_failed" };
    record(ctx, step, result);
    if (!ok && options.stopOnError && step.stopOnError !== false) throw new Error(result.message);
    return;
  }

  if (step.do && !step.action && !step.type) return runSteps(step.do, ctx, runAction, options);

  const attempts = Math.max(1, Number(step.retry?.times || step.retries || 1));
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      if (ctx.dryRun) {
        return record(ctx, step, { ok: true, dryRun: true, wouldRun: publicStep(step), attempt });
      }
      const result = await invokeAction(step, ctx, runAction);
      record(ctx, step, result, attempt);
      if (result?.ok === false && attempt < attempts) {
        await sleep(Number(step.retry?.delayMs || options.retryDelayMs || 0));
        continue;
      }
      if (step.saveAs || step.id) ctx.named[step.saveAs || step.id] = result;
      if (result?.ok === false && step.onError) await runSteps(asSteps(step.onError), ctx, runAction, options);
      if (result?.ok === false && options.stopOnError && step.stopOnError !== false) break;
      if (step.then) await runSteps(asSteps(step.then), ctx, runAction, options);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(Number(step.retry?.delayMs || options.retryDelayMs || 0));
    }
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

function record(ctx, step, result, attempt = 1) {
  ctx.last = result;
  const item = { name: step.name || step.id || step.saveAs || null, action: step.action || step.type || step.call || "control", ok: result?.ok !== false, attempt, result };
  ctx.results.push(item);
  if (item.ok === false) ctx.ok = false;
  return item;
}

function normalizeSteps(payload) {
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "string") {
    try { return normalizeSteps(JSON.parse(payload)); } catch { return []; }
  }
  const raw = payload.steps || payload.actions || payload.workflow || payload.commandTree || payload.tree || payload.do || [];
  if (typeof raw === "string") { try { return normalizeSteps(JSON.parse(raw)); } catch { return []; } }
  if (Array.isArray(raw)) return raw;
  if (raw && raw.steps) return asSteps(raw.steps);
  if (raw && raw.do) return asSteps(raw.do);
  return asSteps(raw);
}

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
  if (typeof value === "string" && value.startsWith("$action.")) {
    const [, id, ...rest] = value.split(".");
    const got = await runAction({ action: "actionHistoryGet", actionId: id });
    return rest.length ? getPath(got.record, rest.join(".")) : got.record;
  }
  if (typeof value === "string" && value.startsWith("$result.")) {
    const [, id, ...rest] = value.split(".");
    const got = await runAction({ action: "actionHistoryGet", actionId: id });
    const base = got.record && got.record.output;
    return rest.length ? getPath(base, rest.join(".")) : base;
  }
  if (Array.isArray(value)) return Promise.all(value.map(item => resolveValue(item, ctx, runAction)));
  if (value && typeof value === "object") return await resolvePayload(value, ctx, runAction);
  return value;
}

async function evaluateCondition(condition, ctx, runAction) {
  if (condition === true) return true;
  if (!condition) return false;
  if (Array.isArray(condition.all)) { for (const item of condition.all) if (!(await evaluateCondition(item, ctx, runAction))) return false; return true; }
  if (Array.isArray(condition.any)) { for (const item of condition.any) if (await evaluateCondition(item, ctx, runAction)) return true; return false; }
  if (condition.not) return !(await evaluateCondition(condition.not, ctx, runAction));
  const left = condition.path
    ? await resolveValue(String(condition.path).startsWith("$") ? condition.path : "$ctx." + condition.path, ctx, runAction)
    : await resolveValue(condition.left, ctx, runAction);
  const right = await resolveValue(condition.right, ctx, runAction);
  const op = condition.operator || condition.op || Object.keys(condition).find(k => ["eq", "ne", "gt", "gte", "lt", "lte", "includes", "regex"].includes(k)) || "truthy";
  const expected = condition[op] !== undefined ? await resolveValue(condition[op], ctx, runAction) : right;
  const ops = {
    truthy: a => !!a, falsy: a => !a, exists: a => a !== undefined && a !== null, missing: a => a === undefined || a === null,
    ok: a => (a ?? ctx.last)?.ok !== false, failed: a => (a ?? ctx.last)?.ok === false,
    eq: (a, b) => a === b, ne: (a, b) => a !== b, gt: (a, b) => a > b, gte: (a, b) => a >= b, lt: (a, b) => a < b, lte: (a, b) => a <= b,
    includes: (a, b) => Array.isArray(a) ? a.includes(b) : String(a || "").includes(String(b || "")), regex: (a, b) => new RegExp(String(b)).test(String(a || ""))
  };
  try { return !!(ops[op] || ops.truthy)(left, expected); } catch { return false; }
}

function compactForReturn(value, maxInlineBytes) {
  if (!value || typeof value !== "object") return value;
  const text = JSON.stringify(value);
  if (Buffer.byteLength(text, "utf8") <= maxInlineBytes) return value;
  const ref = value.outputRef || value.result?.outputRef || value.actionId || value.result?.actionId || null;
  return {
    ok: value.ok !== false,
    compacted: true,
    inlineBytes: Buffer.byteLength(text, "utf8"),
    maxInlineBytes,
    actionId: value.actionId || value.result?.actionId || null,
    outputRef: value.outputRef || value.result?.outputRef || null,
    access: ref ? `Use actionHistoryGet with actionId ${value.actionId || value.result?.actionId}` : "Increase maxInlineBytes or inspect the parent action outputRef."
  };
}

function compactForReturn(value, maxInlineBytes) {
  if (!value || typeof value !== "object") return value;
  const text = JSON.stringify(value);
  if (Buffer.byteLength(text, "utf8") <= maxInlineBytes) return value;
  const ref = value.outputRef || value.result?.outputRef || value.actionId || value.result?.actionId || null;
  return {
    ok: value.ok !== false,
    compacted: true,
    inlineBytes: Buffer.byteLength(text, "utf8"),
    maxInlineBytes,
    actionId: value.actionId || value.result?.actionId || null,
    outputRef: value.outputRef || value.result?.outputRef || null,
    access: ref ? `Use actionHistoryGet with actionId ${value.actionId || value.result?.actionId}` : "Increase maxInlineBytes or inspect the parent action outputRef."
  };
}

function getPath(target, path) {
  return String(path || "").split(".").filter(Boolean).reduce((acc, key) => acc?.[key], target);
}

function forkCtx(ctx) { return { ...ctx, results: [], named: { ...ctx.named }, vars: { ...ctx.vars }, last: ctx.last, error: null }; }
function mergeCtx(ctx, branch) { ctx.results.push(...branch.results); Object.assign(ctx.named, branch.named); Object.assign(ctx.vars, branch.vars); ctx.last = branch.last || ctx.last; if (branch.error) ctx.error = branch.error; }
function sleep(ms) { return ms > 0 ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve(); }
function publicStep(step) { return { action: step.action || step.type || step.call || null, hasCondition: !!(step.if || step.when || step.condition), saveAs: step.saveAs || step.id || null }; }
function explainSteps(steps) { return asSteps(steps).map((step, index) => ({ index, ...publicStep(step), control: step.parallel ? "parallel" : step.forEach ? "forEach" : step.assert ? "assert" : step.do && !step.action ? "group" : "action" })); }

module.exports = { runActionBatch, evaluateCondition, normalizeSteps, explainSteps };
