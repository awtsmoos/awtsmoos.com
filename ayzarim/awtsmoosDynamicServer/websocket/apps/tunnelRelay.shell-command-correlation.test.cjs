// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const Relay = require("./tunnelRelay.js");
const ResponseStart = require("../../../../geelooy/apps/tunnel/agent/tools/fs/commandJob/responseStart.js");

/**
 * B"H
 * A queued worker may not yet have a PID, but the Awtsmoos keeps its command
 * and directory visible so Awtsmoos.com can reject crossed agent receipts.
 */
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
	const receipt = ResponseStart.start("job-shell", {
		meta: {
			status: "queued",
			command: payload.command,
			cwd: payload.cwd,
			shell: "/bin/sh",
			timeoutMs: 5000,
			workerId: "worker-shell",
			receiptId: "receipt-shell",
			receipt: { requestAction: "shellCommand" }
		}
	});
	assert.equal(receipt.command, payload.command);
	assert.equal(receipt.cwd, payload.cwd);
	const base = {
		...receipt,
		id: sent[0].id,
		tunnelName: "awt-shell",
		controlRequestId: payload.controlRequestId,
		clientRequestId: payload.clientRequestId,
		agentSessionId: payload.agentSessionId,
		logicalAgentId: payload.logicalAgentId,
		projectRoot: payload.projectRoot,
		nonce: payload.nonce
	};
	assert.equal(Relay.handleTunnelResponse(context, {
		...base,
		command: "printf crossed"
	}), false);
	assert.equal(context.pendingTunnelRequests.size, 1);
	assert.equal(Relay.handleTunnelResponse(context, base), true);
	const result = await waiting;
	assert.equal(result.actualAction, "commandStart");
	assert.equal(result.jobId, "job-shell");
	assert.equal(result.queued, true);
	assert.equal(context.pendingTunnelRequests.size, 0);
	assert.equal(context.tunnelResponseQuarantine.length, 1);
	console.log(JSON.stringify({
		ok: true,
		requestedAction: "shellCommand",
		servedBy: "commandStart",
		queuedIdentityComplete: true
	}, null, 2));
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
