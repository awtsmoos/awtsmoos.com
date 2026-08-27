// B"H
const assert = require("assert");
const { normalizeCarriers } = require("../protectedFs.js");

/**
 * B"H
 * Chapter 828: the carrier may rescue a missing action, but may not steal a
 * named action. The old YAML wagon still brings jobId and stream; it no longer
 * turns payloadEcho into configGet, list into read, or commandStatus into
 * finishAndContinue when the outer request already spoke clearly.
 */
const passive = normalizeCarriers({
  action: "payloadEcho",
  kind: "fs",
  params: JSON.stringify({ action: "configGet", intendedAction: "read", jobId: "cmdjob_bh", stream: "stderr" })
}, { paramKinds: { GET: {}, POST: {} } });
assert.equal(passive.action, "payloadEcho");
assert.equal(passive.actionRecoveredFromCarrier, false);
assert.equal(passive.adapterAction, undefined);
assert.equal(passive.jobId, "cmdjob_bh");
assert.equal(passive.stream, "stderr");

const list = normalizeCarriers({
  action: "list",
  params: { action: "read", p: "x.js" }
}, { paramKinds: { GET: {}, POST: {} } });
assert.equal(list.action, "list");
assert.equal(list.p, "x.js");
assert.equal(list.path, "x.js");

const status = normalizeCarriers({
  action: "commandStatus",
  params: { action: "finishAndContinue", jobId: "cmdjob_bh" }
}, { paramKinds: { GET: {}, POST: {} } });
assert.equal(status.action, "commandStatus");
assert.equal(status.kind, "command");
assert.equal(status.jobId, "cmdjob_bh");

const recovered = normalizeCarriers({
  kind: "fs",
  params: JSON.stringify({ action: "commandJobOutputPage", jobId: "cmdjob_bh", stream: "stderr" })
}, { paramKinds: { GET: {}, POST: {} } });
assert.equal(recovered.action, "commandJobOutputPage");
assert.equal(recovered.actionRecoveredFromCarrier, true);
assert.equal(recovered.kind, "command");
assert.equal(recovered.jobId, "cmdjob_bh");
assert.equal(recovered.stream, "stderr");

console.log(JSON.stringify({ ok: true, suite: "protected-fs-carrier-action-recovery", checks: ["explicit-wins", "carrier-fields-survive", "missing-action-recovers"] }, null, 2));
