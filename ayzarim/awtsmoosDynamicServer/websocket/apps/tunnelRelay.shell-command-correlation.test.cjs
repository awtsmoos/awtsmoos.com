// B"H

const assert = require("assert");
const Relay = require("./tunnelRelay.js");

(async () => {
	const sent = [];
	const context = {
		tunnels: new Map([["awt-shell", { send: message => sent.push(message) }]]),
		pendingTunnelRequests: new Map()
	};
	const payload = {
		action: "shellCommand",
		command: "printf tunnel-safe",
		cwd: "/repo",
		projectRoot: "/repo",
		controlRequestId: "shell-control",
		clientRequestId: "shell-client",
		agentSessionId: "shell-session",
		logicalAgentId: "shell-agent",
		nonce: "shell-nonce",
		relayWaitMs: 2000
	};
	const waiting = Relay.sendTunnelRequest(context, "awt-shell", payload, 5000);
	assert.equal(sent.length, 1);
	const base = {
		id: sent[0].id,
		ok: true,
		action: "shellCommand",
		requestAction: "shellCommand",
		actualAction: "commandStart",
		command: payload.command,
		cwd: payload.cwd,
		projectRoot: payload.projectRoot,
		controlRequestId: payload.controlRequestId,
		clientRequestId: payload.clientRequestId,
		agentSessionId: payload.agentSessionId,
		logicalAgentId: payload.logicalAgentId,
		nonce: payload.nonce,
		jobId: "job-shell"
	};
	assert.equal(Relay.handleTunnelResponse(context, { ...base, command: "printf crossed" }), false);
	assert.equal(context.pendingTunnelRequests.size, 1);
	assert.equal(Relay.handleTunnelResponse(context, base), true);
	const result = await waiting;
	assert.equal(result.actualAction, "commandStart");
	assert.equal(result.jobId, "job-shell");
	assert.equal(context.pendingTunnelRequests.size, 0);
	assert.equal(context.tunnelResponseQuarantine.length, 1);
	console.log(JSON.stringify({ ok: true, requestedAction: "shellCommand", servedBy: "commandStart" }, null, 2));
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
