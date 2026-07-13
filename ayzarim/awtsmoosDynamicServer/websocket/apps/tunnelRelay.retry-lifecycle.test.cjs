// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const Relay = require("./tunnelRelay.js");

function fixture() {
	const sent = [];
	return {
		sent,
		context: {
			tunnels: new Map([["awt-one", { send: message => sent.push(message) }]]),
			pendingTunnelRequests: new Map()
		}
	};
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

function valid(message, content = "late but correct") {
	const request = message.payload;
	return {
		id: message.id,
		ok: true,
		action: request.action === "retryAction" ? request.requestedAction : request.action,
		actualAction: request.action === "retryAction" ? request.requestedAction : request.action,
		tunnelName: "awt-one",
		controlRequestId: request.controlRequestId,
		clientRequestId: request.clientRequestId,
		agentSessionId: request.agentSessionId,
		logicalAgentId: request.logicalAgentId,
		projectRoot: request.projectRoot,
		nonce: request.nonce,
		path: request.path,
		content
	};
}

function pending(message) {
	return {
		id: message.id,
		ok: false,
		status: 202,
		action: "tunnelRequestPending",
		actualAction: "tunnelRequestPending",
		pending: true,
		controlRequestId: message.payload.controlRequestId,
		requestedAction: message.payload.requestedAction
	};
}

async function localRetryLifecycle() {
	const test = fixture();
	const first = await Relay.sendTunnelRequest(test.context, "awt-one", payload("local"), 2000);
	assert.equal(first.pending, true);
	const retryWaiting = Relay.sendTunnelRequest(test.context, "awt-one", first.retryPayload, 2000);
	assert.equal(test.sent.length, 1, "retry must join the original relay request");
	Relay.handleTunnelResponse(test.context, valid(test.sent[0]));
	assert.equal((await retryWaiting).content, "late but correct");
	const completed = await Relay.sendTunnelRequest(test.context, "awt-one", first.retryPayload, 2000);
	assert.equal(completed.content, "late but correct");
	assert.equal(test.sent.length, 1, "completed retry must not resend");
}

async function recoveredRelayLifecycle() {
	const test = fixture();
	const retry = {
		action: "retryAction",
		controlRequestId: "orphan",
		requestedAction: "read",
		relayWaitMs: 1000
	};
	const first = Relay.sendTunnelRequest(test.context, "awt-one", retry, 2000);
	assert.notEqual(test.sent[0].id, "orphan", "retry transport must be fresh");
	Relay.handleTunnelResponse(test.context, pending(test.sent[0]));
	assert.equal((await first).pending, true);
	const second = Relay.sendTunnelRequest(test.context, "awt-one", retry, 2000);
	Relay.handleTunnelResponse(test.context, valid(test.sent[1], "recovered result"));
	assert.equal((await second).content, "recovered result");
	const cached = await Relay.sendTunnelRequest(test.context, "awt-one", retry, 2000);
	assert.equal(cached.content, "recovered result");
	assert.equal(test.sent.length, 2, "terminal retry must be cached by original identity");
}

async function conflictLifecycle() {
	const test = fixture();
	const original = Relay.sendTunnelRequest(test.context, "awt-one", payload("same", "one.js"), 2000);
	const conflict = await Relay.sendTunnelRequest(test.context, "awt-one", payload("same", "two.js"), 2000);
	assert.equal(conflict.error, "control_request_id_conflict");
	Relay.handleTunnelResponse(test.context, valid(test.sent[0]));
	await original;
}

(async () => {
	await localRetryLifecycle();
	await recoveredRelayLifecycle();
	await conflictLifecycle();
	console.log(JSON.stringify({ ok: true, checks: ["local-retry", "recovered-relay", "conflict"] }, null, 2));
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
