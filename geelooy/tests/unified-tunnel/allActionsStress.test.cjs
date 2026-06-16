// B"H
const assert = require("assert");
const { actions } = require("../../api/tunnel/control/docs/actions.js");
const { actionRegistrationReport, familyFor, inferExpectedInputs } = require("../../api/tunnel/control/routes/osFs/actionRegistrationReport.js");
const { buildFsPayload } = require("../../api/tunnel/control/core/tunnelPayload.js");

function req(action) {
  return { paramKinds: { GET: { action, p: ".", path: ".", goal: "stress every action name", responseMode: "auto", maxFiles: "1000000", timeoutMs: "7200000" } } };
}

const unique = [...new Set(actions)];
assert(actions.length > 250, "large public action surface exists");
assert.strictEqual(unique.length, actions.length, "public actions should not contain duplicate names");
let checked = 0;
for (const action of actions) {
  const payload = buildFsPayload(req(action));
  assert.strictEqual(payload.action, action);
  assert.strictEqual(payload.maxFiles, 1000000);
  assert.strictEqual(payload.timeoutMs, 7200000);
  const family = familyFor(action);
  assert(family.name, "family name for " + action);
  const inputs = inferExpectedInputs(action, payload);
  assert(inputs.expected.length, "expected inputs for " + action);
  const report = actionRegistrationReport(action, payload, { directHandlersAvailable: ["safe-harness"] });
  assert.strictEqual(report.action, action);
  assert.strictEqual(report.registered, true);
  assert(report.repairPlan.length >= 3);
  checked++;
}
console.log(JSON.stringify({ ok: true, suite: "all-actions-stress", checked }, null, 2));
