//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const C = require("../tools/fs/mission/collaboration.js");

/**
 * @file Proves legacy missionAgent actions and Mission Room actions share one physical roster.
 * @description The Awtsmoos gives every Shliach one durable room identity from join through audit,
 * delegation, user interruption, reload, and continuation.
 */
function mission() {
	return {
		id: "mission_room_roster_test",
		goal: "Prove one shared roster",
		status: "running",
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		events: [],
		tasks: []
	};
}

test("join and delegation mutate the canonical room roster, not a hidden second roster", () => {
	const current = mission();
	C.join(current, { agentId: "coordinator", role: "coordinator" });
	C.delegate(current, {
		agentId: "coordinator",
		toAgent: "agent-b",
		title: "Inspect bounded subsystem"
	});
	C.delegate(current, {
		agentId: "coordinator",
		toAgent: "agent-a",
		title: "Verify independent subsystem"
	});

	assert.equal(current.collaboration.agents, current.room.agents);
	assert.deepEqual(Object.keys(current.room.agents).sort(), ["agent-a", "agent-b", "coordinator"]);
	assert.deepEqual(C.status(current).agents.map(agent => agent.agentId), ["agent-a", "agent-b", "coordinator"]);
	assert.deepEqual(current.room.agents["agent-a"].currentDelegationIds.length, 1);
});

test("duplicate joins keep one logical roster entry and reload preserves the shared authority", () => {
	const current = mission();
	C.join(current, { agentId: "agent-a", generation: 1 });
	C.join(current, { agentId: "agent-a", generation: 1 });
	assert.deepEqual(Object.keys(current.room.agents), ["agent-a"]);

	const restored = JSON.parse(JSON.stringify(current));
	const status = C.status(restored);
	assert.equal(restored.collaboration.agents, restored.room.agents);
	assert.deepEqual(status.agents.map(agent => agent.agentId), ["agent-a"]);
});

test("ordinary sync is nonblocking but a real user interruption remains mandatory", () => {
	const current = mission();
	C.join(current, { agentId: "agent-a" });
	const ordinary = C.sync(current, { agentId: "agent-a" });
	assert.equal(ordinary.mustCallNext, undefined);
	assert.equal(ordinary.multipleChoiceSelfInterrogation, null);
	assert.equal(ordinary.finalAnswerAllowed, true);

	const user = C.userMessage(current, {
		toAgent: "agent-a",
		body: "Please answer this blocking question.",
		requiresResponse: true,
		allowContinue: false
	});
	assert.equal(user.mustCallNext.action, "missionAgentRespond");
	assert.equal(user.multipleChoiceSelfInterrogation.expectedAnswerFormat, "A");

	const blocked = C.sync(current, { agentId: "agent-a" });
	assert.equal(blocked.mustCallNext.action, "missionAgentRespond");
	C.respond(current, { agentId: "agent-a", userMessageId: user.userMessage.id, body: "Answered." });
	const resumed = C.sync(current, { agentId: "agent-a" });
	assert.equal(resumed.mustCallNext, undefined);
});

test("audit and status expose the same stable roster", () => {
	const current = mission();
	C.join(current, { agentId: "z-agent" });
	C.join(current, { agentId: "a-agent" });
	const audit = C.audit(current, {});
	assert.deepEqual(audit.collaboration.agents.map(agent => agent.agentId), ["a-agent", "z-agent"]);
	assert.deepEqual(C.status(current).agents.map(agent => agent.agentId), ["a-agent", "z-agent"]);
});
