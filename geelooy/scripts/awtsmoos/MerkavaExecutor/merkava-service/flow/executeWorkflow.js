// B"H

import { evaluateCondition } from "../conditions/evaluateCondition.js";

function normalizeSteps(workflow = []) {
  if (Array.isArray(workflow)) return workflow;
  if (Array.isArray(workflow.steps)) return workflow.steps;
  return [];
}

async function runBranch(branch, ctx, actions) {
  if (!branch) return null;
  return executeWorkflow(Array.isArray(branch) ? branch : [branch], ctx, actions);
}

/**
 * B"H
 * Walks a declarative Merkava workflow. Each step is a small vessel: condition,
 * action, payload, optional `then`, optional `else`, and optional `onError`.
 * The Awtsmoos reveals the next state from the previous result without Chrome.
 *
 * @param {Array|Object} workflow Declarative steps or `{ steps }` wrapper.
 * @param {Object} ctx Mutable workflow context shared by all steps.
 * @param {Object<string, Function>} actions Action registry.
 * @returns {Promise<*>} Last meaningful step result.
 */
export async function executeWorkflow(workflow = [], ctx = {}, actions = {}) {
  const steps = normalizeSteps(workflow);
  let last = ctx.result ?? null;

  for (const step of steps) {
    if (!step || typeof step !== "object") continue;

    const passes = !step.condition || evaluateCondition(step.condition, ctx);
    if (!passes) {
      last = await runBranch(step.else, ctx, actions) ?? last;
      continue;
    }

    try {
      const action = actions[step.action];

      if (typeof action !== "function") {
        throw new Error(`Unknown Merkava workflow action: ${step.action || "<missing>"}`);
      }

      last = await action({ ...ctx, step, last }, step.payload || {});
      ctx.result = last;

      if (step.then) {
        last = await runBranch(step.then, ctx, actions) ?? last;
        ctx.result = last;
      }
    } catch (error) {
      ctx.error = {
        message: error.message,
        stack: error.stack,
        step: step.action || null
      };

      if (!step.onError) throw error;
      last = await runBranch(step.onError, ctx, actions) ?? ctx.error;
      ctx.result = last;
    }
  }

  return last;
}
