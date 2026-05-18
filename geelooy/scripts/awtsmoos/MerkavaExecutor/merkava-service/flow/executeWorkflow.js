// B"H

import { evaluateCondition } from "../conditions/evaluateCondition.js";

export async function executeWorkflow(workflow = [], ctx = {}, actions = {}) {
  const steps = Array.isArray(workflow)
    ? workflow
    : Array.isArray(workflow.steps)
      ? workflow.steps
      : [];

  let last = null;

  for (const step of steps) {
    if (step.condition && !evaluateCondition(step.condition, ctx)) {
      continue;
    }

    const action = actions[step.action];

    if (typeof action !== "function") {
      continue;
    }

    last = await action({
      ...ctx,
      step,
      last
    }, step.payload || {});

    ctx.result = last;
  }

  return last;
}
