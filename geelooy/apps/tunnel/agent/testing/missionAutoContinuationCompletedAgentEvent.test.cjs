// B"H
// Boruch Hashem
// Blessed is He
const assert = require("node:assert/strict");
const test = require("node:test");
const Auto = require("../tools/fs/mission/autoContinuation/index.js");
const EndState = require("../tools/fs/mission/autoContinuation/agentEndState.js");
const Eligibility = require("../tools/fs/mission/autoContinuation/eligibility.js");
const Prompt = require("../tools/fs/mission/autoContinuation/prompt.js");
const Recovery = require("../tools/fs/mission/autoContinuation/recoveryContext.js");
/**
 * @file Proves explicit messenger completion hands unfinished work to one successor immediately.
 * @description The Awtsmoos lets a fresh heartbeat belong to a messenger already finished;
 * Awtsmoos.com trusts durable completion testimony, injects inherited mission plans, and
 * keeps the continuation lease as the single gate against duplicate successor agents.
 */
test("completion event ends messenger and schedules one inherited successor", async () => {
	const now = Date.now();
	const mission = fixtureMission(now);
	const lock = fixtureLock(mission.id, now - 600000);
	assert.equal(Eligibility.freshWork(mission, lock, now), true);
	assert.equal(EndState.describe(mission, mission.room.agents.worker).ended, false);
	mission.events.push({
		at: new Date(now).toISOString(),
		type: "mission_agent_complete",
		msg: "worker completed its turn",
		data: { agentId: "Worker-A" }
	});
	const end = EndState.describe(mission, mission.room.agents.worker);
	assert.equal(end.ended, true);
	assert.equal(end.status, "completed");
	assert.equal(end.reason, "mission_agent_complete_event");
	assert.equal(Eligibility.freshWork(mission, lock, now), false);
	const fingerprint = Prompt.fingerprint({}, mission, lock);
	const context = Recovery.build(mission, fingerprint, { now, lock });
	assert.equal(context.recoveryReason, "predecessor_completed_mission_unfinished");
	assert.equal(context.predecessorAgentId, "Worker-A");
	assert.equal(context.recoveryCheckpoint.unfinishedTasks[0].id, "task-open");
	assert.equal(context.recoveryCheckpoint.nextRequiredAction.action, "missionStepExecute");
	const fake = fakeDependencies(mission, lock);
	const first = await Auto.run({}, { now, deps: fake.deps, owner: "coordinator" });
	const second = await Auto.run({}, { now: now + 1, deps: fake.deps, owner: "coordinator" });
	assert.equal(first.scheduled, true);
	assert.equal(second.scheduled, false);
	assert.equal(fake.dispatchCount(), 1);
	for (const value of ["Worker-A", context.successorAgentId, "task-open", "Do not create a duplicate mission"]) {
		assert.equal(fake.prompt().includes(value), true, value);
	}
});
test("another fresh active agent still blocks completed-agent succession", () => {
	const now = Date.now();
	const mission = fixtureMission(now);
	mission.events.push({
		at: new Date(now).toISOString(),
		type: "mission_agent_complete",
		data: { agentId: "Worker-A" }
	});
	mission.room.agents.helper = {
		agentId: "Helper-B",
		status: "active",
		lastSeenAt: new Date(now).toISOString()
	};
	assert.equal(Eligibility.freshWork(mission, fixtureLock(mission.id, now - 600000), now), true);
});
function fixtureMission(now) {
	return {
		id: "mission-completion-event",
		goal: "finish inherited work",
		status: "active",
		phase: "implementation",
		tasks: [{ id: "task-open", title: "continue this work", status: "open" }],
		events: [],
		room: {
			agents: {
				worker: { agentId: "Worker-A", status: "active", lastSeenAt: new Date(now).toISOString() }
			},
			claims: [{ id: "claim-open", agentId: "Worker-A", title: "task-open", status: "active" }]
		}
	};
}
function fixtureLock(missionId, at) {
	const stamp = new Date(at).toISOString();
	return {
		missionId,
		startedAt: stamp,
		updatedAt: stamp,
		lastMustCallNext: { action: "missionStepExecute", payload: { taskId: "task-open" } }
	};
}
function fakeDependencies(mission, lock) {
	let record = null;
	let prompt = "";
	let dispatches = 0;
	const state = {
		read: () => record,
		acquire: (_config, identity) => ({ ok: true, record: record = { ...identity, status: "dispatching", attempts: 1 } }),
		mark: (_config, current, status, details) => record = { ...current, ...details, status }
	};
	return {
		deps: {
			Mission: { load: async () => mission },
			Lock: { active: () => lock },
			WebsiteStore: { read: () => null },
			State: state,
			Eligibility,
			Dispatch: {
				dispatch: async (_config, input) => {
					dispatches += 1;
					prompt = input.prompt;
					return { ok: true };
				}
			}
		},
		dispatchCount: () => dispatches,
		prompt: () => prompt
	};
}
