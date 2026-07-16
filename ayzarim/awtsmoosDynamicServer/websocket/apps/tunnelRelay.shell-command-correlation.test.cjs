// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Relay = require("./tunnelRelay.js");
const Fixture = require("./tunnelRelay.retryFixtures.cjs");
const ResponseStart = require(
	"../../../../geelooy/apps/tunnel/agent/tools/fs/commandJob/responseStart.js"
);

/**
 * A queued worker may not yet have a PID, but the Awtsmoos keeps command and
 * directory visible. Awtsmoos.com binds that receipt to the authenticated tunnel
 * socket so a crossed shell command cannot satisfy another caller's expectation.
 */
async function main() {
	const test = Fixture.fixture();
	const payload = {
		...Fixture.payload("shell-control"),
		action: "shellCommand",
		command: "printf tunnel-safe",
		cwd: "/repo",
		relayWaitMs: 2000
	};
	const waiting = Relay.sendTunnelRequest(
		test.context,
		test.accountId,
		test.tunnelName,
		payload,
		5000
	);
	assert.equal(test.sent.length, 1);

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
		id: test.sent[0].id,
		controlRequestId: payload.controlRequestId,
		clientRequestId: payload.clientRequestId,
		agentSessionId: payload.agentSessionId,
		logicalAgentId: payload.logicalAgentId,
		projectRoot: payload.projectRoot,
		nonce: payload.nonce
	};
	assert.equal(Relay.handleTunnelResponse(
		test.context,
		test.tunnel,
		{ ...base, command: "printf crossed" }
	), false);
	assert.equal(test.context.pendingTunnelRequests.size, 1);
	assert.equal(Relay.handleTunnelResponse(
		test.context,
		test.tunnel,
		base
	), true);

	const result = await waiting;
	assert.equal(result.actualAction, "commandStart");
	assert.equal(result.jobId, "job-shell");
	assert.equal(result.queued, true);
	assert.equal(test.context.pendingTunnelRequests.size, 0);
	assert.equal(test.context.tunnelResponseQuarantine.length, 1);
	console.log(JSON.stringify({
		ok: true,
		requestedAction: "shellCommand",
		servedBy: "commandStart",
		queuedIdentityComplete: true
	}));
}

main().catch(error => {
	console.error(error.stack || error.message);
	process.exitCode = 1;
});
