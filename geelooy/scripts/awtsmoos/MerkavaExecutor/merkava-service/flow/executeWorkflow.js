// B"H
const { evaluateCondition } = require("../conditions/evaluateCondition.js");

/**
 * B"H
 * Executes the tiny Merkava JSON workflow language.
 *
 * @param {object|Array} workflow Workflow node or sequence.
 * @param {object} ctx Mutable runtime context.
 * @param {object} actions Named async action registry.
 * @returns {Promise<*>} Final workflow result.
 */
async function executeWorkflow(workflow, ctx = {}, actions = {}) {
  if (!workflow) return null;
  if (Array.isArray(workflow)) {
    let last = null;
    for (const node of workflow) last = await executeWorkflow(node, ctx, actions);
    return last;
  }

  if (workflow.if) return await executeIfNode(workflow.if, ctx, actions);
  if (workflow.forEach) return await executeForEachNode(workflow.forEach, ctx, actions);

  if (workflow.run) {
    const fn = actions[workflow.run];
    if (!fn) throw new Error("Unsupported Merkava workflow action: " + workflow.run);
    return await fn(workflow.with || {}, ctx);
  }

  return workflow;
}

async function executeIfNode(node, ctx, actions) {
  if (evaluateCondition(node.condition, ctx)) return await executeWorkflow(node.then, ctx, actions);
  if (node.elseif) return await executeIfNode(node.elseif, ctx, actions);
  return await executeWorkflow(node.else, ctx, actions);
}

async function executeForEachNode(node, ctx, actions) {
  const items = evaluateCondition(node.items, ctx) || [];
  const name = node.as || "item";
  const results = [];
  for (const item of items) {
    results.push(await executeWorkflow(node.do, { ...ctx, [name]: item }, actions));
  }
  return results;
}

module.exports = { executeWorkflow };
