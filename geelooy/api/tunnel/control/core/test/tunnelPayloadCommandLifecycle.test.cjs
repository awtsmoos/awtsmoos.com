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

/**
 * B"H
 * Chapter 536: A dropped action is repaired only when the command itself bears
 * witness. This keeps commandRun usable through fragile adapters without
 * reopening the params.action override wound.
 */
const inferred = buildFsPayload({
  paramKinds: {
    POST: { command: "echo BH", cwd: "/tmp" },
    GET: {}
  }
});
assert.equal(inferred.kind, "command");
assert.equal(inferred.action, "commandRun");
assert.equal(inferred.command, "echo BH");
assert.equal(inferred.cwd, "/tmp");
assert.equal(inferred.actionRecoveredFromCarrier, true);

const rescued = buildFsPayload({
  paramKinds: {
    POST: { action: "configGet", command: "printf rescued", cwd: "/tmp" },
    GET: {}
  }
});
assert.equal(rescued.kind, "command");
assert.equal(rescued.action, "commandRun");
assert.equal(rescued.adapterAction, "configGet");
assert.equal(rescued.command, "printf rescued");

console.log(JSON.stringify({ ok: true, checks: ["params-jobId-promoted", "lifecycle-fields-promoted", "command-action-inferred", "configGet-command-rescued"] }, null, 2));
