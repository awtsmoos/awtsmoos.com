// B"H
const Driver = require('../continuation/runner.js');
const Policy = require('../continuation/policy.js');
function buildContinuationActions(ctx, buildActions) {
  const { config, payload, ws } = ctx, out = {};
  for (const name of Policy.ACTIONS) out[name] = async () => Driver.run(config, { ...payload, action: name }, ws, buildActions);
  return out;
}
module.exports = { buildContinuationActions };
