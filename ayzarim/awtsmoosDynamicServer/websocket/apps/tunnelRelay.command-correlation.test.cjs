// B"H
const assert = require("assert");
const { validateTunnelResponse } = require("./tunnelRelay.js");

const base = {
  id: "relay-req-1",
  tunnelName: "awt-awtsmoos-7320",
  requestedAction: "commandJobOutputPage",
  expectedVessel: "native-tunnel",
  expectedRouteReason: "native",
  controlRequestId: "ctl-a",
  clientRequestId: "client-a",
  agentSessionId: "session-a",
  logicalAgentId: "agent-a",
  projectRoot: "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com",
  nonce: "nonce-a",
  jobId: "cmdjob_expected",
  stream: "stderr"
};

const ok = validateTunnelResponse(base, {
  id: "relay-req-1",
  action: "commandJobOutputPage",
  actualAction: "commandJobOutputPage",
  tunnelName: "awt-awtsmoos-7320",
  vessel: "native-tunnel",
  routeReason: "explicit_native",
  controlRequestId: "ctl-a",
  clientRequestId: "client-a",
  agentSessionId: "session-a",
  logicalAgentId: "agent-a",
  projectRoot: "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com",
  nonce: "nonce-a",
  jobId: "cmdjob_expected",
  stream: "stderr"
});
assert.equal(ok.ok, true);

const wrongJob = validateTunnelResponse(base, {
  ...ok.response,
  id: "relay-req-1",
  action: "commandJobOutputPage",
  actualAction: "commandJobOutputPage",
  tunnelName: "awt-awtsmoos-7320",
  vessel: "native-tunnel",
  routeReason: "explicit_native",
  controlRequestId: "ctl-a",
  clientRequestId: "client-a",
  agentSessionId: "session-a",
  logicalAgentId: "agent-a",
  projectRoot: "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com",
  nonce: "nonce-a",
  jobId: "cmdjob_wrong",
  stream: "stderr"
});
assert.equal(wrongJob.ok, false);
assert.equal(wrongJob.response.jobIdMismatch, true);

const wrongStream = validateTunnelResponse(base, {
  id: "relay-req-1",
  action: "commandJobOutputPage",
  actualAction: "commandJobOutputPage",
  tunnelName: "awt-awtsmoos-7320",
  vessel: "native-tunnel",
  routeReason: "explicit_native",
  controlRequestId: "ctl-a",
  clientRequestId: "client-a",
  agentSessionId: "session-a",
  logicalAgentId: "agent-a",
  projectRoot: "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com",
  nonce: "nonce-a",
  jobId: "cmdjob_expected",
  stream: "stdout"
});
assert.equal(wrongStream.ok, false);
assert.equal(wrongStream.response.streamMismatch, true);

const virtual = validateTunnelResponse({ ...base, requestedAction: "command", command: "pwd", cwd: "/repo" }, {
  id: "relay-req-1",
  action: "aiAgentList",
  actualAction: "aiAgentList",
  tunnelName: "awtsmoos-virtual-os",
  vessel: "virtual-os",
  routeReason: "explicit_virtual_os",
  controlRequestId: "ctl-a",
  clientRequestId: "client-a",
  agentSessionId: "session-a",
  logicalAgentId: "agent-a",
  projectRoot: "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com",
  nonce: "nonce-a"
});
assert.equal(virtual.ok, false);
assert.equal(virtual.response.wrongTunnel, true);
assert.equal(virtual.response.vesselMismatch, true);
assert.equal(virtual.response.actionMismatch, true);

const wrongCommand = validateTunnelResponse({ ...base, requestedAction: "command", command: "pwd && echo BH", cwd: "/repo", jobId: "" }, {
  id: "relay-req-1",
  action: "commandRun",
  actualAction: "commandRun",
  tunnelName: "awt-awtsmoos-7320",
  vessel: "native-tunnel",
  routeReason: "explicit_native",
  controlRequestId: "ctl-a",
  clientRequestId: "client-a",
  agentSessionId: "session-a",
  logicalAgentId: "agent-a",
  projectRoot: "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com",
  nonce: "nonce-a",
  command: "cat > geelooy/games/ohr-hagnuz/src/data/maps/RambamGiftMaps.js",
  cwd: "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com/geelooy"
});
assert.equal(wrongCommand.ok, false);
assert.equal(wrongCommand.response.commandMismatch, true);
assert.equal(wrongCommand.response.cwdMismatch, true);

console.log(JSON.stringify({ ok: true, suite: "tunnel-relay-command-correlation" }, null, 2));
