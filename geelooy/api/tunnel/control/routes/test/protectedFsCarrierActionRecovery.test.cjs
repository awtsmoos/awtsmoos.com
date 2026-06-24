// B"H
const assert = require("assert");
const { normalizeCarriers } = require("../protectedFs.js");

/**
 * B"H
 * Chapter 827: if the outer tool mask says list but the sealed inner carrier
 * says commandJobOutputPage, the sealed carrier wins and the mismatch is marked.
 */
const got = normalizeCarriers({ action: "list", kind: "fs", params: JSON.stringify({ action: "commandJobOutputPage", jobId: "cmdjob_bh", stream: "stderr" }) }, { paramKinds: { GET: {}, POST: {} } });
assert.equal(got.action, "commandJobOutputPage");
assert.equal(got.adapterAction, "list");
assert.equal(got.actionRecoveredFromCarrier, true);
assert.equal(got.kind, "command");
assert.equal(got.jobId, "cmdjob_bh");
assert.equal(got.stream, "stderr");

const read = normalizeCarriers({ action: "configGet", kind: "fs", params: { intendedAction: "read", p: "x.js" } }, { paramKinds: { GET: {}, POST: {} } });
assert.equal(read.action, "read");
assert.equal(read.adapterAction, "configGet");
assert.equal(read.kind, "fs");
console.log(JSON.stringify({ ok: true, suite: "protected-fs-carrier-action-recovery" }, null, 2));
