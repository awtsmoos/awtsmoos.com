// B"H
const {
  runWorkflow,
  listWorkflows,
  getWorkflowInfo,
  validateWorkflow
} = require("../workflowRunner.js");
const { runActionBatch, normalizeSteps, explainSteps } = require("../actionBatch.js");
const ledger = require("../actionLedger.js");

const commandTreeAliases = [
  "commandTreeRun", "commandTreeValidate", "commandTreeDryRun",
  "commandTreeExplain", "commandTreeVisualize", "commandTreeResume",
  "commandTreeReplay", "commandTreeCancel", "commandTreeStatus",
  "commandTreeSave", "commandTreeLoad", "awtsmoosCommandTree",
  "merkavaCommandTree", "aiWorkflowLang", "parallelActionBatch",
  "forEachActionBatch", "retryAction", "assertAction",
  "snapshotBeforeAfter", "policyGuard", "destructiveIntentGate"
];

function hasExecutableSteps(payload) {
  return normalizeSteps(payload).length > 0;
}

function commandTreePayload(payload, mode) {
  const dryMode = /DryRun$|Explain$|Visualize$/i.test(mode);
  const validateMode = /Validate$/i.test(mode);
  return {
    ...payload,
    action: mode,
    dryRun: dryMode,
    validateOnly: validateMode,
    explainOnly: dryMode && /Explain$|Visualize$/i.test(mode)
  };
}

/**
 * B"H
 * Chapter 4: The Awtsmoos set fire to the silent branch. A command tree may
 * now either reveal a plan, validate a plan, or execute a plan; it may no
 * longer smile with ok=true while carrying no living steps in its hands.
 *
 * @param {object} ctx Fresh tunnel action context.
 * @param {Function} buildActions Builds child action handlers.
 * @returns {object} Workflow and command-tree handlers.
 */
function buildWorkflowActions(ctx, buildActions) {
  const { config, payload, ws } = ctx;

  const runAction = async (nextPayload) => {
    const nextActions = buildActions(config, nextPayload, ws);
    if (!nextActions[nextPayload.action]) throw new Error("Unknown batch action: " + nextPayload.action);
    const output = await nextActions[nextPayload.action]();
    return await ledger.record(config, nextPayload, output, { parentActionId: payload.actionId || null });
  };

  const runTree = async (mode = payload.action || "actionBatch") => {
    if (/Cancel$|Status$|Save$|Load$|Resume$|Replay$/i.test(mode)) {
      return { ok: true, action: mode, state: "stateless-local-agent", message: "Pass steps/tree/workflow to commandTreeRun for execution." };
    }
    if (!hasExecutableSteps(payload)) {
      return { ok: false, action: mode, error: "missing_steps", expected: "steps, actions, workflow, commandTree, tree, or do" };
    }
    if (/Validate$/i.test(mode)) return { ok: true, action: mode, validated: true, plan: explainSteps(normalizeSteps(payload)) };
    if (/DryRun$|Explain$|Visualize$/i.test(mode)) return { ok: true, action: mode, dryRun: true, plan: explainSteps(normalizeSteps(payload)) };
    return await runActionBatch(commandTreePayload(payload, mode), runAction);
  };

  const actions = {
    async actionBatch() { return await runTree("actionBatch"); },
    async commandBatch() { return await runTree("commandBatch"); },
    async aiCommandBatch() { return await runTree("aiCommandBatch"); },
    async workflowRun() { return await runWorkflow(payload, runAction); },
    async workflowList() { return listWorkflows(); },
    async workflowGet() { return getWorkflowInfo(payload); },
    async workflowValidate() { return validateWorkflow(payload); }
  };

  for (const alias of commandTreeAliases) actions[alias] = async () => runTree(alias);
  return actions;
}

module.exports = { buildWorkflowActions, commandTreeAliases, commandTreePayload };
