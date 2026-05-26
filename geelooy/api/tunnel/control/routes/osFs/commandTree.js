// B"H

const COMMAND_TREE_ACTIONS = [
  "commandTreeRun", "commandTreeValidate", "commandTreeDryRun",
  "commandTreeExplain", "commandTreeVisualize", "commandTreeResume",
  "commandTreeReplay", "commandTreeCancel", "commandTreeStatus",
  "commandTreeSave", "commandTreeLoad", "awtsmoosCommandTree",
  "merkavaCommandTree", "aiWorkflowLang", "parallelActionBatch",
  "forEachActionBatch", "retryAction", "assertAction",
  "snapshotBeforeAfter", "policyGuard", "destructiveIntentGate"
];

/**
 * B"H
 * Chapter 2: The Awtsmoos breathed through a command tree, and every branch
 * learned to become an action batch instead of a silent catalog shadow.
 *
 * @param {Function} runActionBatch Existing structured batch executor.
 * @param {Function} dispatch Re-entrant dispatcher for child actions.
 * @param {object} payload Incoming tunnel payload.
 * @returns {object} Action-name to handler map.
 */
function commandTreeHandlers(runActionBatch, dispatch, payload) {
  const run = () => runActionBatch(commandTreePayload(payload), dispatch);
  return Object.fromEntries(COMMAND_TREE_ACTIONS.map((name) => [name, run]));
}

/**
 * B"H
 * Converts command-tree aliases into the same pure structured vessel used by
 * actionBatch. Validation/explain/dry-run stay non-destructive unless explicit
 * executable steps are supplied.
 *
 * @param {object} payload Incoming payload.
 * @returns {object} Normalized batch payload.
 */
function commandTreePayload(payload = {}) {
  const workflow = parseWorkflow(payload.workflow) || parseWorkflow(payload.tree);
  const steps = payload.steps || payload.commands || workflow?.steps || workflow?.do || [];
  const dryRun = payload.dryRun === true || /DryRun|Validate|Explain|Visualize/.test(payload.action || "");
  return { ...payload, action: payload.action || "commandTreeRun", steps, dryRun };
}

function parseWorkflow(value) {
  if (!value || typeof value !== "string") return value && typeof value === "object" ? value : null;
  try { return JSON.parse(value); } catch { return null; }
}

module.exports = { COMMAND_TREE_ACTIONS, commandTreeHandlers, commandTreePayload };
