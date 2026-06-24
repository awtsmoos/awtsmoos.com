// B"H

const { runActionBatch } = require("../actionBatch.js");

function childPayload(parent, next) {
  const child = { ...parent, ...next };
  if (next.p || next.path) {
    child.p = next.p || next.path;
    child.path = next.path || next.p;
  } else {
    delete child.p;
    delete child.path;
  }
  if (next.cwd) child.cwd = next.cwd;
  if (next.params) child.params = next.params;
  child.action = next.action || child.action;
  return child;
}

/**
 * B"H
 * Chapter 812: The unsupported commandBatch found the living actionBatch gate.
 *
 * Older agents call `commandBatch`; newer code speaks `actionBatch`. Both now
 * flow through the same runner. Child steps receive their own p/path/cwd and no
 * longer inherit the batch wrapper's directory like a confused crown.
 */
function buildBatchAliasActions(ctx, buildActions) {
  const { config, payload, ws } = ctx;
  const run = async nextPayload => {
    const child = childPayload(payload, nextPayload);
    const actions = buildActions(config, child, ws);
    const action = child.action || "list";
    if (!actions[action]) return { ok: false, error: "Unknown fs action: " + action, action };
    return await actions[action]();
  };
  return {
    async actionBatch() { return await runActionBatch({ ...payload, action: "actionBatch" }, run); },
    async commandBatch() { return await runActionBatch({ ...payload, action: "commandBatch" }, run); },
    async aiCommandBatch() { return await runActionBatch({ ...payload, action: "aiCommandBatch" }, run); }
  };
}

module.exports = { buildBatchAliasActions, childPayload };
