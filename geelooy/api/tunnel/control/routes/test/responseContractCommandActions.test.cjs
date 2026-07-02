// B"H
const assert = require("assert");
const { verifyTunnelResponse, allowedActionAlias } = require("../fsVessel/responseContract.js");

assert.equal(allowedActionAlias("commandStatus", "commandStart"), false);
assert.equal(allowedActionAlias("commandWait", "commandStatus"), true);
assert.equal(allowedActionAlias("commandWait", "commandStart"), false);
assert.equal(allowedActionAlias("commandJobWait", "commandWait"), true);
assert.equal(allowedActionAlias("commandPoll", "commandStatus"), true);

const mismatch = verifyTunnelResponse({
  requestAction: "commandStart",
  controlRequestId: "ctl_1",
  clientRequestId: "client_1",
  nonce: "nonce_1",
  jobId: "cmdjob_1"
}, {
  action: "commandStatus",
  controlRequestId: "ctl_1",
  clientRequestId: "client_1",
  nonce: "nonce_1",
  jobId: "cmdjob_1"
}, "awt-test");
assert.equal(mismatch.ok, false);
assert.equal(mismatch.error, "tunnel_response_correlation_mismatch");
assert.match(mismatch.mismatchProof.join("\n"), /requestAction expected commandStatus got commandStart/);

const waitOk = verifyTunnelResponse({
  requestAction: "commandStatus",
  controlRequestId: "ctl_2",
  clientRequestId: "client_2",
  nonce: "nonce_2",
  jobId: "cmdjob_2"
}, {
  action: "commandWait",
  controlRequestId: "ctl_2",
  clientRequestId: "client_2",
  nonce: "nonce_2",
  jobId: "cmdjob_2"
}, "awt-test");
assert.notEqual(waitOk.ok, false);

const ok = verifyTunnelResponse({
  requestAction: "commandStatus",
  controlRequestId: "ctl_3",
  clientRequestId: "client_3",
  nonce: "nonce_3",
  jobId: "cmdjob_3"
}, {
  action: "commandStatus",
  controlRequestId: "ctl_3",
  clientRequestId: "client_3",
  nonce: "nonce_3",
  jobId: "cmdjob_3"
}, "awt-test");
assert.notEqual(ok.ok, false);
console.log(JSON.stringify({ ok: true, suite: "response-contract-command-actions" }, null, 2));
