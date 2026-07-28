// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fileSystem from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Mission = require("../../mission/index.js");

const root = await fileSystem.mkdtemp(path.join(os.tmpdir(), "room-dozens-agents-"));
const config = { root };
const count = 64;
const mission = await Mission.create(config, {
	goal: "64-agent shared awareness and conversation",
	minimumInnovationWindowMs: 0
});
Mission.roomCreate(mission, {
	roomName: "Dozens of agents",
	projectRoot: root
});

for (let index = 0; index < count; index += 1) {
	Mission.roomJoin(mission, {
		agentId: `agent-${index}`,
		logicalAgentId: `logical-${index}`,
		agentSessionId: `session-${index}`,
		role: index % 3 === 0 ? "planner" : index % 3 === 1 ? "builder" : "tester"
	});
}

for (let index = 0; index < count; index += 1) {
	Mission.roomMessage(mission, {
		agentId: `agent-${index}`,
		toAgent: `agent-${(index + 1) % count}`,
		subject: `handoff-${index}`,
		message: `Agent ${index} reports verified progress to its next peer.`,
		interrupt: false
	});
}

await Mission.save(config, mission);
const reloaded = await Mission.load(config, mission.id);
const status = Mission.roomStatus(reloaded);
const agentIds = new Set(status.agents.map(agent => agent.agentId));

assert.equal(status.counts.agents, count);
assert.equal(status.counts.messages, count);
assert.equal(agentIds.size, count);
assert.equal(status.agents.every(agent => agent.agentSessionId), true);
assert.equal(status.messages.length, 50, "status keeps a bounded recent chat window");
assert.equal(
	status.messages.every(message => agentIds.has(message.fromAgent) && agentIds.has(message.toAgent)),
	true
);
assert.equal(status.scheduler.stopRule, "explicit_verified_user_stop_only");

console.log(JSON.stringify({
	ok: true,
	suite: "mission-room-dozens-agents",
	agents: status.counts.agents,
	messages: status.counts.messages,
	visibleRecentMessages: status.messages.length,
	allAgentsAware: agentIds.size === count,
	persisted: true
}, null, 2));
