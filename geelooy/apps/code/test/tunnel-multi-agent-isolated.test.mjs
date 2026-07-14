// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createActionLedger } from "../js/tunnel/action-ledger.js";
import { createSessionRegistry } from "../js/tunnel/session-registry.js";
import { buildTunnelStatusModel } from "../js/tunnel/tunnel-status-model.js";

/**
 * B"H
 * Two logical agents share one browser tunnel while retaining separate sessions,
 * missions, action counts, and bounded history.
 */
const sessions = createSessionRegistry({
	maximum: 8
});
const ledger = createActionLedger({
	maximum: 3
});
const first = {
	logicalAgentId: "builder",
	agentSessionId: "session-a",
	agentName: "Builder",
	missionId: "mission-one",
	missionTitle: "Build the browser",
	action: "chromeNavigate",
	requestId: "request-a"
};
const second = {
	logicalAgentId: "tester",
	agentSessionId: "session-b",
	agentName: "Tester",
	missionId: "mission-two",
	missionTitle: "Stress the browser",
	action: "chromeSnapshot",
	requestId: "request-b"
};

for (const payload of [first, second]) {
	sessions.observe(payload, {
		activeDelta: 1
	});
	const sequence = ledger.begin(payload);
	ledger.finish(sequence, {
		ok: true
	});
	sessions.finish(payload, {
		lastResult: "completed"
	});
}

assert.equal(sessions.snapshot().length, 2);
assert.equal(sessions.snapshot().every(session => session.activeRequests === 0), true);
assert.deepEqual(new Set(sessions.snapshot().map(session => session.logicalAgentId)), new Set(["builder", "tester"]));
assert.equal(ledger.snapshot().length, 2);
assert.equal(ledger.snapshot({ logicalAgentId: "builder" }).length, 1);

for (let index = 0; index < 4; index += 1) {
	ledger.begin({
		logicalAgentId: "builder",
		agentSessionId: "session-a",
		action: `action-${index}`
	});
}
assert.equal(ledger.snapshot().length, 3);

const model = buildTunnelStatusModel({
	tunnel: {
		status: "connected",
		tunnelName: "awt-code-test"
	},
	sessions: sessions.snapshot(),
	actions: ledger.snapshot(),
	browserTarget: {
		activeTargetId: "tab-1",
		targets: [{ id: "tab-1" }]
	}
});
assert.equal(model.connected, true);
assert.equal(model.agentCount, 2);
assert.equal(model.missions.length, 2);
assert.equal(model.browserTarget.activeTargetId, "tab-1");

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-multi-agent-isolated",
	agentsCoexist: true,
	missionsSeparated: true,
	historyBounded: true
}, null, 2));
