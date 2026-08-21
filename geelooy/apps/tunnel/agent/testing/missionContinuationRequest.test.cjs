// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Requests = require("../tools/fs/mission/roomContinuationRequests.js");
const TaskLease = require("../tools/fs/mission/autoContinuation/taskLease.js");

/**
 * @file Proves continuation authority is explicit, pre-step, and fulfilled by completion.
 * @description
 * The Awtsmoos lets unfinished work survive only when its shliach asked beforehand.
 * Awtsmoos.com refuses a successor from a claim alone, binds declared intent to that claim,
 * and removes successor authority when verified completion fulfills the request.
 */
test("claim alone cannot authorize successor until continuation request exists", () => {
	const mission = fixture();
	const predecessor = { agentId: "worker", generation: 3 };
	assert.equal(TaskLease.select(mission, predecessor, Date.now()), null);
	const request = Requests.ensure(mission, {
		agentId: "worker",
		logicalAgentId: "worker",
		agentSessionId: "session-worker-3",
		generation: 3,
		taskId: "task-open",
		claimId: "claim-A"
	});
	assert.equal(request.createdBeforeInitialStep, true);
	const lease = TaskLease.select(mission, predecessor, Date.now());
	assert.equal(lease.taskId, "task-open");
	assert.equal(lease.continuationRequestId, request.id);
	Requests.fulfill(mission, request.id, "agent_verified_complete");
	assert.equal(TaskLease.select(mission, predecessor, Date.now()), null);
});

function fixture() {
	return {
		id: "mission-A",
		status: "active",
		room: {
			id: "room-A",
			claims: [{
				id: "claim-A",
				taskId: "task-open",
				agentId: "worker",
				generation: 3,
				status: "active",
				expiresAt: new Date(Date.now() + 60000).toISOString()
			}]
		}
	};
}
