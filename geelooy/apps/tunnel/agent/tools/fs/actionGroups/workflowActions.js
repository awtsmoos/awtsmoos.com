// B"H
const {
  runWorkflow,
  listWorkflows,
  getWorkflowInfo,
  validateWorkflow
} = require("../workflowRunner.js");

function buildWorkflowActions(ctx, buildActions) {
  const { config, payload, ws } = ctx;

  return {
    async workflowRun() {
      const runAction = async (nextPayload) => {
        const nextActions = buildActions(config, nextPayload, ws);
        if (!nextActions[nextPayload.action]) throw new Error("Unknown workflow action: " + nextPayload.action);
        return await nextActions[nextPayload.action]();
      };

      return await runWorkflow(payload, runAction);
    },
    async workflowList() { return listWorkflows(); },
    async workflowGet() { return getWorkflowInfo(payload); },
    async workflowValidate() { return validateWorkflow(payload); }
  };
}

module.exports = { buildWorkflowActions };
