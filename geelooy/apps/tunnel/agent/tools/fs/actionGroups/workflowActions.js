// B"H
const {
  runWorkflow,
  listWorkflows,
  getWorkflowInfo,
  validateWorkflow
} = require("../workflowRunner.js");
const { runActionBatch } = require("../actionBatch.js");

function buildWorkflowActions(ctx, buildActions) {
  const { config, payload, ws } = ctx;

  return {
    async actionBatch() {
      const runAction = async (nextPayload) => {
        const nextActions = buildActions(config, nextPayload, ws);
        if (!nextActions[nextPayload.action]) throw new Error("Unknown batch action: " + nextPayload.action);
        return await nextActions[nextPayload.action]();
      };
      return await runActionBatch(payload, runAction);
    },
    async commandBatch() { return await this.actionBatch(); },
    async aiCommandBatch() { return await this.actionBatch(); },
    async actionBatch() {
      const runAction = async (nextPayload) => {
        const nextActions = buildActions(config, nextPayload, ws);
        if (!nextActions[nextPayload.action]) throw new Error("Unknown batch action: " + nextPayload.action);
        return await nextActions[nextPayload.action]();
      };
      return await runActionBatch(payload, runAction);
    },
    async commandBatch() { return await this.actionBatch(); },
    async aiCommandBatch() { return await this.actionBatch(); },
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
