// B"H
const assert = require("assert");
const { validateTunnelResponse } = require("./tunnelRelay.js");

const expected = {
  id: "req-1",
  tunnelName: "awt-test-1",
  requestedAction: "read",
  controlRequestId: "ctl-1",
  clientRequestId: "client-1",
  agentSessionId: "session-1",
  logicalAgentId: "agent-1",
  projectRoot: "/projects/MitzvahWorld",
  nonce: "nonce-1"
};

const good = validateTunnelResponse(expected, {
  id: "req-1",
  tunnelName: "awt-test-1",
  actualAction: "read",
  controlRequestId: "ctl-1",
  clientRequestId: "client-1",
  agentSessionId: "session-1",
  logicalAgentId: "agent-1",
  projectRoot: "/projects/MitzvahWorld",
  nonce: "nonce-1"
});
assert.equal(good.ok, true);

const missingNonce = validateTunnelResponse(expected, {
  id: "req-1",
  tunnelName: "awt-test-1",
  actualAction: "read",
  controlRequestId: "ctl-1",
  clientRequestId: "client-1",
  agentSessionId: "session-1",
  logicalAgentId: "agent-1"
});
assert.equal(missingNonce.ok, false);
assert.equal(missingNonce.response.error, "tunnel_response_correlation_mismatch");
assert.equal(missingNonce.response.nonceMismatch, true);

const wrongAgent = validateTunnelResponse(expected, {
  id: "req-1",
  tunnelName: "awt-test-1",
  actualAction: "read",
  controlRequestId: "ctl-1",
  clientRequestId: "client-1",
  agentSessionId: "session-1",
  logicalAgentId: "agent-2",
  projectRoot: "/projects/MitzvahWorld",
  nonce: "nonce-1"
});
assert.equal(wrongAgent.ok, false);
assert.equal(wrongAgent.response.logicalAgentMismatch, true);

const wrongProject = validateTunnelResponse(expected, {
  id: "req-1",
  tunnelName: "awt-test-1",
  actualAction: "read",
  controlRequestId: "ctl-1",
  clientRequestId: "client-1",
  agentSessionId: "session-1",
  logicalAgentId: "agent-1",
  projectRoot: "/projects/ohr-hagnuz",
  nonce: "nonce-1"
});
assert.equal(wrongProject.ok, false);
assert.equal(wrongProject.response.projectRootMismatch, true);

console.log(JSON.stringify({ ok: true }, null, 2));
