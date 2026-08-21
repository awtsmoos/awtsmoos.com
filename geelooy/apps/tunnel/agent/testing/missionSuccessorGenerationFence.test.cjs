// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Eligibility = require("../tools/fs/mission/autoContinuation/eligibility.js");
const Requests = require("../tools/fs/mission/roomContinuationRequests.js");
const Recovery = require("../tools/fs/mission/autoContinuation/recoveryContext.js");
const Successor = require("../tools/fs/mission/autoContinuation/successorAdmission.js");

/**
 * @file Proves one declared unfinished task yields one fenced next generation.
 * @description
 * The Awtsmoos lets the work survive while the obsolete messenger is fenced. Awtsmoos.com
 * requires pre-step continuation intent plus claim custody, increments generation, and
 * gives duplicate recovery ticks one spawn-group key instead of many browser successors.
 */
test("successor is deterministic, declared, task leased, and generation incremented", () => {
	const oldAt = new Date(Date.now() - 10 * 60 * 1000).toISOString();
	const mission = fixture(oldAt);
	Requests.ensure(mission, {
		agentId: "worker",
		logicalAgentId: "worker",
		agentSessionId: "session-worker-3",
		generation: 3,
		taskId: "task-open",
		claimId: "claim-A"
	});
	const first = Recovery.build(mission, "fingerprint-A", { now: Date.now() });
	const second = Recovery.build(mission, "fingerprint-A", { now: Date.now() + 1 });
	assert.equal(first.taskLease.taskId, "task-open");
	assert.ok(first.taskLease.continuationRequestId);
	assert.equal(first.predecessorGeneration, 3);
	assert.equal(first.successorGeneration, 4);
	assert.equal(first.spawnGroupId, second.spawnGroupId);
	assert.equal(first.successorAgentId, second.successorAgentId);
	const held = { status: "accepted", successorGeneration: 4, fencedThroughGeneration: 3 };
	assert.equal(Successor.blocks(held, first), true);
	assert.equal(Successor.fenced(held, first), true);
});

test("mustCallNext without declared continuation cannot spawn browser successor", () => {
	const mission = { id: "m", status: "active", room: { agents: {} } };
	const lock = { missionId: "m", lastMustCallNext: { action: "missionStepExecute" } };
	const result = Eligibility.decide({ mission, lock, taskLease: null, now: Date.now() });
	assert.equal(result.eligible, false);
	assert.equal(result.reason, "no_pre_step_continuation_request");
});

function fixture(oldAt) {
	return {
		id: "mission-A",
		status: "active",
		room: {
			id: "room-A",
			agents: { worker: { agentId: "worker", status: "active", generation: 3, lastSeenAt: oldAt } },
			claims: [{ id: "claim-A", taskId: "task-open", agentId: "worker", generation: 3,
				status: "active", expiresAt: new Date(Date.now() + 60000).toISOString() }]
		}
	};
}
