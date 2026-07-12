// B"H
const assert = require("assert");
const Relay = require("./tunnelRelay.js");

function createContext() {
	const sent = [];
	return {
		sent,
		context: {
			tunnels: new Map([["awt-shared", { send: message => sent.push(message) }]]),
			pendingTunnelRequests: new Map()
		}
	};
}

function payload(index, project = index % 2 ? "mitzvah" : "ohr") {
	return {
		action: "read",
		path: project === "mitzvah" ? "games/mitzvahWorld/index.html" : "games/ohr-hagnuz/HudRenderer.js",
		tunnelName: "awt-shared",
		requestedTunnelName: "awt-shared",
		projectRoot: project === "mitzvah" ? "/projects/MitzvahWorld" : "/projects/ohr-hagnuz",
		controlRequestId: `ctl-${project}-${index}`,
		clientRequestId: `client-${project}-${index}`,
		agentSessionId: `session-${project}-${index}`,
		logicalAgentId: `agent-${project}-${index}`,
		nonce: `nonce-${project}-${index}`,
		relayWaitMs: 5000
	};
}

function response(message, content) {
	return {
		type: "TUNNEL_RESPONSE",
		id: message.id,
		ok: true,
		action: "read",
		actualAction: "read",
		content,
		tunnelName: message.payload.tunnelName,
		requestedTunnelName: message.payload.requestedTunnelName,
		controlRequestId: message.payload.controlRequestId,
		clientRequestId: message.payload.clientRequestId,
		agentSessionId: message.payload.agentSessionId,
		logicalAgentId: message.payload.logicalAgentId,
		projectRoot: message.payload.projectRoot,
		nonce: message.payload.nonce,
		path: message.payload.path
	};
}

(async () => {
	const { context, sent } = createContext();
	const count = 200;
	const promises = [];
	for (let index = 0; index < count; index += 1) {
		const request = payload(index);
		promises.push(Relay.sendTunnelRequest(context, "awt-shared", request, 10000));
		promises.push(Relay.sendTunnelRequest(context, "awt-shared", request, 10000));
	}
	assert.equal(sent.length, count, "duplicate callers must coalesce into one tunnel request");
	for (let index = 0; index < count; index += 1) {
		const current = sent[index];
		const crossed = sent[(index + 1) % count];
		assert.equal(Relay.handleTunnelResponse(context, { ...response(crossed, "crossed"), id: current.id }), false);
	}
	assert.equal(context.pendingTunnelRequests.size, count, "mismatches must not consume pending requests");
	for (const message of [...sent].reverse()) {
		assert.equal(Relay.handleTunnelResponse(context, response(message, `valid:${message.payload.path}`)), true);
	}
	const results = await Promise.all(promises);
	assert(results.every(result => result.ok === true));
	assert(results.every(result => result.content.startsWith("valid:")));
	assert.equal(context.pendingTunnelRequests.size, 0);
	assert.equal(context.completedTunnelRequests.size, count);
	assert.equal(context.tunnelResponseQuarantine.length, count);
	console.log(JSON.stringify({ ok: true, requests: count, callers: promises.length, quarantined: count }, null, 2));
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
