// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createActionLedger } from "../js/tunnel/action-ledger.js";
import { emitCodeTunnelRequestUpdate } from "../js/tunnel/request-update.js";
import { createSessionRegistry } from "../js/tunnel/session-registry.js";

globalThis.CustomEvent ||= class CustomEvent {
	constructor(type, options = {}) {
		this.type = type;
		this.detail = options.detail;
	}
};

const events = [];
globalThis.dispatchEvent = event => {
	if (event.type === "awtsmoos:code-tunnel-update") {
		events.push(structuredClone(event.detail));
	}
	return true;
};

const actions = createActionLedger();
const sessions = createSessionRegistry();
const payload = {
	action: "nativeSecretAction",
	requestId: "event-request-1",
	logicalAgentId: "live-agent-1",
	agentSessionId: "live-session-1",
	missionId: "live-mission-1"
};
const sequence = actions.begin(payload);
sessions.observe(payload, { activeDelta: 1 });
emitCodeTunnelRequestUpdate("started", sequence, { actions, sessions });
actions.finish(sequence, {
	ok: false,
	status: 403,
	error: "unsupported"
});
sessions.finish(payload, {
	lastResult: "failed",
	lastError: "unsupported"
});
emitCodeTunnelRequestUpdate("finished", sequence, { actions, sessions });

assert.equal(events.length, 2);
assert.deepEqual(events.map(event => event.phase), ["started", "finished"]);
assert.equal(events[0].action.state, "running");
assert.equal(events[1].action.state, "failed");
assert.equal(events[0].action.logicalAgentId, "live-agent-1");
assert.equal(events[1].sessions[0].activeRequests, 0);

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-action-events-isolated",
	startedVisible: true,
	finishedVisible: true,
	correlationPreserved: events[1].action.requestId === "event-request-1"
}, null, 2));
