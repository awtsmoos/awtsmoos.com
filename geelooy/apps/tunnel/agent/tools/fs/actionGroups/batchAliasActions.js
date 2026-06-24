// B"H

const { runActionBatch } = require("../actionBatch.js");

/**
 * B"H
 * Chapter 812: The unsupported commandBatch found the living actionBatch gate.
 *
 * Older agents call `commandBatch`; newer code speaks `actionBatch`. Both now
 * flow through the same runner instead of returning unsupported or zero-work.
 */
function buildBatchAliasActions(ctx, buildActions) {
  const { config, payload, ws } = ctx;
  const run = async nextPayload => {
    const actions = buildActions(config, { ...payload, ...nextPayload }, ws);
    const action = nextPayload.action || "list";
    if (!actions[action]) return { ok: false, error: "Unknown fs action: " + action, action };
    return await actions[action]();
  };
  return {
    async actionBatch() { return await runActionBatch({ ...payload, action: "actionBatch" }, run); },
    async commandBatch() { return await runActionBatch({ ...payload, action: "commandBatch" }, run); },
    async aiCommandBatch() { return await runActionBatch({ ...payload, action: "aiCommandBatch" }, run); }
  };
}

module.exports = { buildBatchAliasActions };
