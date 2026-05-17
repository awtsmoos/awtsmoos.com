// B"H
const { resolveValue, testCondition } = require("./workflowExpressions.js");

const BUILT_INS = {
  staticChromeSmoke: {
    name: "staticChromeSmoke",
    steps: [
      { id: "server", action: "staticServerStart", with: { path: "$params.path", port: "$params.port", index: "$params.index" } },
      { id: "browser", action: "chromeTestUrl", with: { url: "$steps.server.url$params.urlPath", selector: "$params.selector", assertNoConsoleErrors: true, snapshot: true } },
      { id: "stop", action: "staticServerStop", with: { serverId: "$steps.server.serverId" }, always: true }
    ]
  },
  isolatedJsSmoke: {
    name: "isolatedJsSmoke",
    steps: [
      { id: "test", action: "isolatedJsTest", with: { files: "$params.files", entry: "$params.entry", testCode: "$params.testCode", timeoutMs: "$params.timeoutMs" } }
    ]
  },
  isolatedHtmlSmoke: {
    name: "isolatedHtmlSmoke",
    steps: [
      { id: "html", action: "isolatedHtmlTest", with: { files: "$params.files", html: "$params.html", entry: "$params.entry", selector: "$params.selector", assertNoConsoleErrors: true } }
    ]
  }
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function compactResult(result, maxChars) {
  const text = JSON.stringify(result);
  if (text.length <= maxChars) return result;
  return { ok: result && result.ok !== false, truncated: true, preview: text.slice(0, maxChars) };
}

function getWorkflow(payload = {}) {
  if (payload.workflow && typeof payload.workflow === "object") return payload.workflow;
  if (Array.isArray(payload.steps)) return { name: payload.workflowName || "inline", steps: payload.steps };
  if (payload.workflowName && BUILT_INS[payload.workflowName]) return BUILT_INS[payload.workflowName];
  return null;
}

async function runOneStep(step, ctx, runAction, limits) {
  if (!testCondition(step.if, ctx)) return { skipped: true, reason: "if_false" };
  if (step.unless && testCondition(step.unless, ctx)) return { skipped: true, reason: "unless_true" };

  const payload = resolveValue({ ...(step.with || {}), action: step.action }, ctx);
  const tries = Math.max(1, Math.min(Number(step.retry?.times || 1), limits.maxIterations));
  let last = null;

  for (let i = 0; i < tries; i++) {
    last = await runAction(payload);
    ctx.result = last;
    if (!step.retry?.until || testCondition(step.retry.until, ctx)) break;
    if (step.retry?.delayMs) await sleep(Math.min(Number(step.retry.delayMs), 5000));
  }

  return compactResult(last, limits.maxStepOutputChars);
}

async function runWorkflow(payload = {}, runAction) {
  const workflow = getWorkflow(payload);
  if (!workflow) return { ok: false, action: "workflowRun", error: "missing_workflow" };

  const limits = {
    maxSteps: Math.max(1, Math.min(Number(payload.maxSteps || workflow.maxSteps || 50), 100)),
    maxIterations: Math.max(1, Math.min(Number(payload.maxIterations || workflow.maxIterations || 20), 100)),
    maxStepOutputChars: Math.max(1000, Math.min(Number(payload.maxStepOutputChars || 12000), 60000))
  };

  const ctx = {
    params: payload.params || {},
    steps: {},
    loop: {},
    result: null
  };

  const steps = Array.isArray(workflow.steps) ? workflow.steps.slice(0, limits.maxSteps) : [];
  const errors = [];
  let ok = true;

  for (const step of steps) {
    const id = step.id || "step" + Object.keys(ctx.steps).length;

    try {
      if (step.forEach) {
        const items = resolveValue(step.forEach, ctx);
        const arr = Array.isArray(items) ? items.slice(0, limits.maxIterations) : [];
        const results = [];
        for (let i = 0; i < arr.length; i++) {
          ctx.loop = { index: i, item: arr[i] };
          const res = await runOneStep(step, ctx, runAction, limits);
          results.push(res);
          if (step.until && testCondition(step.until, { ...ctx, result: res })) break;
        }
        ctx.steps[id] = { ok: results.every(x => x.ok !== false), results };
      } else {
        const res = await runOneStep(step, ctx, runAction, limits);
        ctx.steps[id] = res;
        if (res && res.ok === false && step.continueOnError !== true) {
          ok = false;
          errors.push({ step: id, result: res });
          if (!step.always) break;
        }
      }
    } catch (e) {
      const err = { ok: false, error: e.message };
      ctx.steps[id] = err;
      ok = false;
      errors.push({ step: id, error: e.message });
      if (step.continueOnError !== true && step.always !== true) break;
    }
  }

  return { ok, action: "workflowRun", workflowName: workflow.name || payload.workflowName || "inline", steps: ctx.steps, errors };
}

function listWorkflows() {
  return { ok: true, action: "workflowList", workflows: Object.keys(BUILT_INS) };
}

function getWorkflowInfo(payload = {}) {
  const workflow = getWorkflow(payload);
  return workflow ? { ok: true, action: "workflowGet", workflow } : { ok: false, action: "workflowGet", error: "not_found" };
}

function validateWorkflow(payload = {}) {
  const workflow = getWorkflow(payload);
  const errors = [];
  if (!workflow) errors.push("missing_workflow");
  if (workflow && !Array.isArray(workflow.steps)) errors.push("steps_must_be_array");
  for (const step of workflow?.steps || []) {
    if (!step.id) errors.push("step_missing_id");
    if (!step.action) errors.push((step.id || "step") + ": missing_action");
  }
  return { ok: errors.length === 0, action: "workflowValidate", errors };
}

module.exports = { runWorkflow, listWorkflows, getWorkflowInfo, validateWorkflow };
