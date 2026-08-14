// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Agents = require("../../mission/roomAgents.js");
const Messages = require("../../mission/roomMessages.js");
const Recovery = require("../../mission/roomLoop/recovery.js");
const Runtime = require("../../mission/roomRuntime.js");
const RoomState = require("../../mission/roomState.js");

/**
 * @file Proves mission-room liveness represents witnessed agent activity, never dashboard observation.
 * @description
 * The Awtsmoos renews every instant, while Awtsmoos.com records only a truthful pulse as
 * heartbeat testimony. A silent agent stays stale through status reads; one real heartbeat
 * renews public presence and runtime health together without changing durable identity.
 */
const mission = {
	id: "mission_liveness_regression",
	goal: "prove truthful shared-room liveness",
	metadata: {
		projectRoot: "/tmp/awtsmoos-room-liveness"
	}
};

const env = {
	RoomState,
	MetadataStore: null,
	RoomInterrupts: {
		create() {
			throw new Error("unexpected_interrupt");
		}
	},
	event() {}
};

Agents.join(mission, {
	agentId: "agent_a",
	projectRoot: mission.metadata.projectRoot
}, env);
Agents.join(mission, {
	agentId: "agent_b",
	projectRoot: mission.metadata.projectRoot
}, env);

const room = mission.room;
const originalRuntime = {
	agentSessionId: room.agentRuntime.agent_a.agentSessionId,
	processKey: room.agentRuntime.agent_a.processKey
};
const staleAt = new Date(Date.now() - 20 * 60 * 1000).toISOString();
room.agents.agent_a.lastSeenAt = staleAt;
room.agentRuntime.agent_a.heartbeat = staleAt;

const firstStatus = RoomState.status(mission);
const secondStatus = RoomState.status(mission);
assert.equal(room.agentRuntime.agent_a.heartbeat, staleAt);
assert.equal(firstStatus.health.staleAgents.includes("agent_a"), true);
assert.equal(secondStatus.health.staleAgents.includes("agent_a"), true);

const staleWatchdog = Recovery.watchdog(mission, {
	agentId: "agent_b",
	maxAgeMs: 60 * 1000
}, env);
assert.equal(staleWatchdog.stale.some(agent => agent.agentId === "agent_a"), true);

const beat = Messages.heartbeat(mission, {
	agentId: "agent_a",
	status: "working",
	currentWork: "liveness regression",
	disableCentralMetadata: true
}, env);
assert.equal(room.agents.agent_a.lastSeenAt, beat.at);
assert.equal(room.agentRuntime.agent_a.heartbeat, beat.at);
assert.equal(room.agentRuntime.agent_a.agentSessionId, originalRuntime.agentSessionId);
assert.equal(room.agentRuntime.agent_a.processKey, originalRuntime.processKey);
assert.equal(Runtime.health(room).staleAgents.includes("agent_a"), false);

const freshWatchdog = Recovery.watchdog(mission, {
	agentId: "agent_b",
	maxAgeMs: 60 * 1000
}, env);
assert.equal(freshWatchdog.stale.some(agent => agent.agentId === "agent_a"), false);

const directed = Messages.add(mission, {
	agentId: "agent_a",
	toAgent: "agent_b",
	kind: "progress",
	message: "SUBAGENT_ROOM_MESSAGE_OK",
	interrupt: false,
	disableCentralMetadata: true
}, env);
assert.equal(directed.message.fromAgent, "agent_a");
assert.equal(directed.message.toAgent, "agent_b");
assert.equal(directed.message.body, "SUBAGENT_ROOM_MESSAGE_OK");

console.log(JSON.stringify({
	ok: true,
	suite: "mission-room-agent-liveness",
	statusCannotResurrectStaleAgent: true,
	heartbeatClocksUnified: true,
	identityStable: true,
	directedMessagingPreserved: true
}));
