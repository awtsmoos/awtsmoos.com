// B"H
const assert = require("assert");
const Relay = require("./tunnelRelay.js");

function fixture() {
	const sent = [];
	const context = {
		tunnels: new Map([["awt-one", { send: message => sent.push(message) }]]),
		pendingTunnelRequests: new Map()
	};
	return { context, sent };
}

function payload(id, path = "project/file.js") {
	return {
		action: "read",
		path,
		projectRoot: "/repo",
		controlRequestId: id,
		clientRequestId: `client-${id}`,
		agentSessionId: `session-${id}`,
		logicalAgentId: `agent-${id}`,
		nonce: `nonce-${id}`,
		relayWaitMs: 100
	};
}

function valid(message) {
	const request = message.payload;
	return {
		id: message.id,
		ok: true,
		action: "read",
		actualAction: "read",
		tunnelName: "awt-one",
		controlRequestId: request.controlRequestId,
		clientRequestId: request.clientRequestId,
		agentSessionId: request.agentSessionId,
		logicalAgentId: request.logicalAgentId,
		projectRoot: request.projectRoot,
		nonce: request.nonce,
		path: request.path,
		content: "late but correct"
	};
}

(async () => {
	const late = fixture();
	const first = await Relay.sendTunnelRequest(late.context, "awt-one", payload("late"), 2000);
	assert.equal(first.pending, true);
	assert.equal(late.sent.length, 1);
	Relay.handleTunnelResponse(late.context, valid(late.sent[0]));
	const retry = await Relay.sendTunnelRequest(late.context, "awt-one", payload("late"), 2000);
	assert.equal(retry.content, "late but correct");
	assert.equal(late.sent.length, 1, "completed retry must not resend");

	const unsolicited = fixture();
	Relay.handleTunnelResponse(unsolicited.context, { id: "future", ok: true, content: "poison" });
	const pending = Relay.sendTunnelRequest(unsolicited.context, "awt-one", payload("future"), 2000);
	assert.equal(unsolicited.sent.length, 1, "unsolicited response must not poison completed cache");
	Relay.handleTunnelResponse(unsolicited.context, valid(unsolicited.sent[0]));
	assert.equal((await pending).content, "late but correct");

	const conflict = fixture();
	const original = Relay.sendTunnelRequest(conflict.context, "awt-one", payload("same-id", "one.js"), 2000);
	const crossed = await Relay.sendTunnelRequest(conflict.context, "awt-one", payload("same-id", "two.js"), 2000);
	assert.equal(crossed.error, "control_request_id_conflict");
	assert.equal(conflict.sent.length, 1);
	Relay.handleTunnelResponse(conflict.context, valid(conflict.sent[0]));
	await original;

	console.log(JSON.stringify({ ok: true, checks: ["late-retry", "unsolicited-quarantine", "same-id-conflict"] }, null, 2));
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
