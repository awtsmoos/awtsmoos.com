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
  projectRoot: "/repo",
  nonce: "nonce-a",
  jobId: "cmdjob_expected",
  stream: "stderr"
};
function envelope(extra = {}) {
  return { id:"relay-req-1", action:"commandJobOutputPage", actualAction:"commandJobOutputPage", tunnelName:"awt-awtsmoos-7320", vessel:"native-tunnel", routeReason:"explicit_native", controlRequestId:"ctl-a", clientRequestId:"client-a", agentSessionId:"session-a", logicalAgentId:"agent-a", projectRoot:"/repo", nonce:"nonce-a", jobId:"cmdjob_expected", stream:"stderr", ...extra };
}

assert.equal(validateTunnelResponse(base, envelope()).ok, true);
const wrongJob = validateTunnelResponse(base, envelope({ jobId:"cmdjob_wrong" }));
assert.equal(wrongJob.ok, false);
assert.equal(wrongJob.response.jobIdMismatch, true);
const wrongStream = validateTunnelResponse(base, envelope({ stream:"stdout" }));
assert.equal(wrongStream.ok, false);
assert.equal(wrongStream.response.streamMismatch, true);
const wrongCommand = validateTunnelResponse({ ...base, requestedAction:"command", command:"pwd && echo BH", cwd:"/repo", jobId:"", stream:"" }, envelope({ action:"commandRun", actualAction:"commandRun", command:"cat file", cwd:"/other", jobId:"", stream:"" }));
assert.equal(wrongCommand.ok, false);
assert.equal(wrongCommand.response.commandMismatch, true);
assert.equal(wrongCommand.response.cwdMismatch, true);
const newlineEquivalent = validateTunnelResponse({ ...base, requestedAction:"commandRun", command:"echo ok\n", cwd:"/repo\n", jobId:"", stream:"" }, envelope({ action:"commandRun", actualAction:"commandRun", command:"echo ok", cwd:"/repo", jobId:"", stream:"" }));
assert.equal(newlineEquivalent.ok, true, "trailing newline normalization must not false-reject command receipts");
const whitespaceEquivalent = validateTunnelResponse({ ...base, requestedAction:"commandRun", command:"printf hi   \n", cwd:"/repo", jobId:"", stream:"" }, envelope({ action:"commandRun", actualAction:"commandRun", command:"printf hi\n", cwd:"/repo", jobId:"", stream:"" }));
assert.equal(whitespaceEquivalent.ok, true, "spaces before line breaks are transport formatting, not mismatch");
const wrongReadPath = validateTunnelResponse({ ...base, requestedAction:"readBytes", jobId:"", stream:"", path:"/repo/a.js", paths:["/repo/a.js"] }, envelope({ action:"readBytes", actualAction:"readBytes", jobId:"", stream:"", absolutePath:"/repo/b.js" }));
assert.equal(wrongReadPath.ok, false);
assert.equal(wrongReadPath.response.pathMismatch, true);
const missionPathReturn = validateTunnelResponse({ ...base, requestedAction:"missionStepBrainstorm", jobId:"", stream:"", path:"", paths:[] }, envelope({ action:"missionStepBrainstorm", actualAction:"missionStepBrainstorm", jobId:"", stream:"", path:".awtsmoos/missions/mission_1/mission.json" }));
assert.equal(missionPathReturn.ok, true);
console.log(JSON.stringify({ ok:true, suite:"tunnel-relay-command-correlation" }, null, 2));
