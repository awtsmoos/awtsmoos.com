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

function buildWorkflowActions(ctx, buildActions) {
  const { config, payload, ws } = ctx;

  const runAction = async (nextPayload) => {
    const nextActions = buildActions(config, nextPayload, ws);
    if (!nextActions[nextPayload.action]) throw new Error("Unknown batch action: " + nextPayload.action);
    const output = await nextActions[nextPayload.action]();
    return await ledger.record(config, nextPayload, output, { parentActionId: payload.actionId || null });
  };

  const runTree = async (mode = payload.action || "actionBatch") => {
    if (/Validate$/i.test(mode)) return { ok: true, action: mode, validated: true, plan: explainSteps(normalizeSteps(payload)) };
    if (/DryRun$|Explain$|Visualize$/i.test(mode)) return { ok: true, action: mode, dryRun: true, plan: explainSteps(normalizeSteps(payload)) };
    if (/Cancel$|Status$|Save$|Load$|Resume$|Replay$/i.test(mode)) {
      return { ok: true, action: mode, state: "stateless-local-agent", message: "Command tree persistence hooks are declared; pass a tree to commandTreeRun for execution." };
    }
    return await runActionBatch({ ...payload, action: mode }, runAction);
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

module.exports = { buildWorkflowActions, commandTreeAliases };
