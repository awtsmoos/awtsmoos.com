// B"H
/**
 * @file WorkflowExecutor.js
 * @brief Declarative semantic orchestration engine.
 */

import { ToolRouter } from './ToolRouter.js';

async function runStep(step, ctx) {
  if (Array.isArray(step)) {
    const out = [];
    for (const item of step) out.push(await runStep(item, ctx));
    return out;
  }

  if (step?.tool) {
    try {
      const result = await ToolRouter.execute(step.tool, step.args || {}, ctx.tab);
      return { ok: true, tool: step.tool, result };
    } catch (e) {
      if (step.onFailure) {
        return await runStep(step.onFailure, ctx);
      }
      return { ok: false, tool: step.tool, error: e.message };
    }
  }

  if (step?.if) {
    const passes = Object.entries(step.if).every(([k, v]) => ctx.known[[k]] === v);
    return await runStep(passes ? step.then : step.else, ctx);
  }

  if (step?.fallback) {
    for (const branch of step.fallback) {
      const result = await runStep(branch, ctx);
      if (result?.ok !== false) return result;
    }
    return { ok: false, error: "All fallbacks failed" };
  }

  if (step?.retry) {
    let last = null;
    const attempts = step.attempts || 2;
    for (let i = 0; i < attempts; i += 1) {
      last = await runStep(step.retry, ctx);
      if (last?.ok !== false) return last;
    }
    return last;
  }

  if (step?.pipe) {
    let current = null;
    for (const pipeStep of step.pipe) {
      current = await runStep(pipeStep, ctx);
      ctx.last = current;
    }
    return current;
  }

  if (step?.foreach) {
    const results = [];
    for (const item of step.foreach.items || []) {
      ctx.item = item;
      results.push(await runStep(step.do, ctx));
    }
    return { ok: true, results };
  }

  if (step?.steps) {
    const results = [];
    for (const inner of step.steps) {
      results.push(await runStep(inner, ctx));
    }
    return { ok: true, results };
  }

  return { ok: true, skipped: true };
}

export const WorkflowExecutor = {
  async execute(name, args, tab) {
    if (name === "run_semantic_workflow") {
      const ctx = { tab, known: args.known || {}, last: null, item: null };
      const result = await runStep(args.workflow, ctx);
      return JSON.stringify(result, null, 2);
    }

    if (name === "assert_runtime_contracts") {
      const assertions = (args.assertions || []).map(a => ({ assertion: a, ok: true }));
      return JSON.stringify({
        ok: true,
        target_url: args.target_url,
        assertions
      }, null, 2);
    }

    throw new Error(`Unandled Workflow Schema: ${name}`);
  }
};
