// B"H

/**
 * Chapter 25: Many Sparks Became One Command.
 *
 * Local tunnel-agent batch runner. It mirrors the public API batch vessel so the
 * installed agent can run write/read/search/simulate sequences without shell
 * strings and without losing conditional control.
 */
async function runActionBatch(payload = {}, runAction) {
  const steps = normalizeSteps(payload);
  const ctx = { ok: true, results: [], named: {}, last: null, error: null };
  const options = { stopOnError: payload.stopOnError !== false, maxSteps: Number(payload.maxSteps || 50) };
  await runSteps(steps, ctx, runAction, options);
  ctx.ok = ctx.results.every(item => item.ok !== false);
  return { ok: ctx.ok, action: payload.action || "actionBatch", count: ctx.results.length, results: ctx.results, named: ctx.named, last: ctx.last, error: ctx.error };
}

async function runSteps(steps, ctx, runAction, options) {
  for (const step of steps) {
    if (ctx.results.length >= options.maxSteps) throw new Error(`actionBatch maxSteps exceeded: ${options.maxSteps}`);
    if (!step || typeof step !== "object") continue;
    if (step.condition && !evaluateCondition(step.condition, ctx)) {
      if (step.else) await runSteps(asSteps(step.else), ctx, runAction, options);
      continue;
    }
    try {
      const result = await runAction(resolvePayload({ ...(step.payload || step.with || {}), action: step.action || step.type }, ctx));
      ctx.last = result;
      ctx.results.push({ name: step.name || step.id || null, action: step.action, ok: result?.ok !== false, result });
      if (step.saveAs || step.id) ctx.named[step.saveAs || step.id] = result;
      if (step.then) await runSteps(asSteps(step.then), ctx, runAction, options);
      if (result?.ok === false && step.onError) await runSteps(asSteps(step.onError), ctx, runAction, options);
      else if (result?.ok === false && options.stopOnError && step.stopOnError !== false) break;
    } catch (error) {
      ctx.error = { message: error.message, stack: error.stack, step: step.action || null };
      ctx.results.push({ name: step.name || step.id || null, action: step.action, ok: false, error: ctx.error });
      if (step.onError) await runSteps(asSteps(step.onError), ctx, runAction, options);
      else if (options.stopOnError && step.stopOnError !== false) break;
    }
  }
}

function normalizeSteps(payload) {
  const raw = payload.steps || payload.actions || payload.workflow || [];
  if (typeof raw === "string") { try { return asSteps(JSON.parse(raw)); } catch { return []; } }
  return asSteps(raw.steps || raw);
}

function asSteps(value) { return Array.isArray(value) ? value : value ? [value] : []; }

function resolvePayload(value, ctx) {
  if (Array.isArray(value)) return value.map(item => resolvePayload(item, ctx));
  if (!value || typeof value !== "object") return resolveValue(value, ctx);
  const out = {};
  for (const [key, val] of Object.entries(value)) out[key] = resolveValue(val, ctx);
  return out;
}

function resolveValue(value, ctx) {
  if (typeof value === "string" && value.startsWith("$ctx.")) return getPath(ctx, value.slice(5));
  if (Array.isArray(value)) return value.map(item => resolveValue(item, ctx));
  if (value && typeof value === "object") return resolvePayload(value, ctx);
  return value;
}

function evaluateCondition(condition, ctx) {
  if (Array.isArray(condition.all)) return condition.all.every(item => evaluateCondition(item, ctx));
  if (Array.isArray(condition.any)) return condition.any.some(item => evaluateCondition(item, ctx));
  if (condition.not) return !evaluateCondition(condition.not, ctx);
  const left = condition.path ? getPath(ctx, condition.path) : condition.left;
  const right = condition.right;
  const op = condition.operator || "truthy";
  const ops = {
    truthy: a => !!a, falsy: a => !a, exists: a => a !== undefined && a !== null, missing: a => a === undefined || a === null,
    ok: a => (a ?? ctx.last)?.ok !== false, failed: a => (a ?? ctx.last)?.ok === false,
    eq: (a, b) => a === b, ne: (a, b) => a !== b, gt: (a, b) => a > b, gte: (a, b) => a >= b, lt: (a, b) => a < b, lte: (a, b) => a <= b,
    includes: (a, b) => Array.isArray(a) ? a.includes(b) : String(a || "").includes(String(b || "")), regex: (a, b) => new RegExp(String(b)).test(String(a || ""))
  };
  try { return !!(ops[op] || ops.truthy)(left, right); } catch { return false; }
}

function getPath(target, path) {
  return String(path || "").split(".").filter(Boolean).reduce((acc, key) => acc?.[key], target);
}

module.exports = { runActionBatch, evaluateCondition };
