// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createActionLedger } from "../js/tunnel/action-ledger.js";
import { createSessionRegistry } from "../js/tunnel/session-registry.js";
import { buildTunnelStatusModel } from "../js/tunnel/tunnel-status-model.js";

/**
 * B"H
 * Dozens of logical agents share one browser tunnel while retaining separate
 * sessions, missions, action counts, and bounded history.
 */
const sessions = createSessionRegistry();
const ledger = createActionLedger({
	maximum: 96
});
const agentCount = 64;

for (let index = 0; index < agentCount; index += 1) {
	const payload = {
		logicalAgentId: `agent-${index}`,
		agentSessionId: `session-${index}`,
		agentName: `Agent ${index}`,
		missionId: `mission-${index % 8}`,
		missionTitle: `Shared mission ${index % 8}`,
		roomId: "shared-room",
		action: index % 2 ? "chromeSnapshot" : "chromeNavigate",
		requestId: `request-${index}`
	};
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

assert.equal(sessions.snapshot().length, agentCount);
assert.equal(sessions.snapshot().every(session => session.activeRequests === 0), true);
assert.equal(new Set(sessions.snapshot().map(session => session.logicalAgentId)).size, agentCount);
assert.equal(ledger.snapshot().length, agentCount);
assert.equal(ledger.snapshot({ logicalAgentId: "agent-0" }).length, 1);

for (let index = 0; index < 40; index += 1) {
	ledger.begin({
		logicalAgentId: "agent-0",
		agentSessionId: "session-0",
		action: `action-${index}`
	});
}
assert.equal(ledger.snapshot().length, 96);

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
assert.equal(model.agentCount, agentCount);
assert.equal(model.missions.length, 8);
assert.equal(model.missions.every(mission => mission.agentCount === 8), true);
assert.equal(model.browserTarget.activeTargetId, "tab-1");

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-multi-agent-isolated",
	agentCount,
	agentsCoexist: true,
	sharedRoomVisible: sessions.snapshot().every(session => session.roomId === "shared-room"),
	missionsSeparated: model.missions.length,
	historyBounded: true
}, null, 2));
