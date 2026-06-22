// B"H
const assert = require("assert");
const { buildFsPayload } = require("../tunnelPayload.js");

/**
 * B"H
 * Chapter 513: The params vessel opened and the job id emerged alive.
 * This guards the bridge where ChatGPT tool schemas may carry lifecycle fields
 * inside params while the local agent expects a plain payload.
 */
const payload = buildFsPayload({
  paramKinds: {
    POST: {
      action: "commandStatus",
      params: { jobId: "cmdjob_bh_123", stream: "stderr", waitTimeoutMs: 7000, pollIntervalMs: 123, inlineOutput: false }
    },
    GET: {}
  }
});
assert.equal(payload.kind, "command");
assert.equal(payload.action, "commandStatus");
assert.equal(payload.jobId, "cmdjob_bh_123");
assert.equal(payload.id, "cmdjob_bh_123");
assert.equal(payload.stream, "stderr");
assert.equal(payload.waitTimeoutMs, 7000);
assert.equal(payload.pollIntervalMs, 123);
assert.equal(payload.inlineOutput, false);
console.log(JSON.stringify({ ok: true, checks: ["params-jobId-promoted", "lifecycle-fields-promoted"] }, null, 2));
