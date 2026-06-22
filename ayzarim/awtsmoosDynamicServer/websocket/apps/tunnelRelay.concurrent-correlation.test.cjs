// B"H
const assert = require("assert");
const { handleTunnelResponse, sendTunnelRequest } = require("./tunnelRelay.js");

const sent = [];
const tunnel = {
  opened: true,
  send(message) {
    sent.push(typeof message === "string" ? JSON.parse(message) : message);
  }
};
const ctx = {
  tunnels: new Map([["awt-shared", tunnel]]),
  pendingTunnelRequests: new Map()
};

function payload(index, project) {
  return {
    action: "read",
    path: project === "mitzvah" ? "games/mitzvahWorld/index.html" : "games/ohr-hagnuz/src/tiferet/render/HudRenderer.js",
    tunnelName: "awt-shared",
    requestedTunnelName: "awt-shared",
    projectRoot: project === "mitzvah" ? "/projects/MitzvahWorld" : "/projects/ohr-hagnuz",
    controlRequestId: `ctl-${project}-${index}`,
    clientRequestId: `client-${project}-${index}`,
    agentSessionId: `session-${project}`,
    logicalAgentId: `agent-${project}`,
    nonce: `nonce-${project}-${index}`
  };
}

(async () => {
  const requests = [];
  for (let i = 0; i < 80; i++) {
    requests.push(sendTunnelRequest(ctx, "awt-shared", payload(i, i % 2 ? "mitzvah" : "ohr"), 5000));
  }
  assert.equal(sent.length, 80);

  for (let i = 0; i < sent.length; i++) {
    const current = sent[i];
    const other = sent[(i + 1) % sent.length];
    handleTunnelResponse(ctx, {
      type: "TUNNEL_RESPONSE",
      id: current.id,
      ok: true,
      action: "read",
      actualAction: "read",
      content: `crossed:${other.payload.path}`,
      tunnelName: other.payload.tunnelName,
      requestedTunnelName: other.payload.requestedTunnelName,
      controlRequestId: other.payload.controlRequestId,
      clientRequestId: other.payload.clientRequestId,
      agentSessionId: other.payload.agentSessionId,
      logicalAgentId: other.payload.logicalAgentId,
      projectRoot: other.payload.projectRoot,
      nonce: other.payload.nonce
    });
  }

  const results = await Promise.all(requests);
  assert.equal(results.length, 80);
  assert(results.every(result => result.ok === false), "crossed same-action responses must fail");
  assert(results.every(result => result.error === "tunnel_response_correlation_mismatch"));
  assert(results.some(result => result.logicalAgentMismatch));
  assert(results.some(result => result.projectRootMismatch));
  assert(results.some(result => result.nonceMismatch));
  assert.equal(ctx.pendingTunnelRequests.size, 0);

  console.log(JSON.stringify({ ok: true, crossedResponsesRejected: results.length }, null, 2));
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
