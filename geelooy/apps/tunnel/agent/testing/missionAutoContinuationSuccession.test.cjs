// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Auto = require("../tools/fs/mission/autoContinuation/index.js");
const Prompt = require("../tools/fs/mission/autoContinuation/prompt.js");
const Recovery = require("../tools/fs/mission/autoContinuation/recoveryContext.js");
const Requests = require("../tools/fs/mission/roomContinuationRequests.js");
const Fixture = require("./missionAutoContinuationSuccessionFixture.cjs");

/**
 * @file Proves declared stale unfinished work produces one deterministic successor.
 * @description
 * The Awtsmoos lets the messenger end without ending a deed whose continuation was
 * requested before work began. Awtsmoos.com preserves checkpoint, predecessor, successor,
 * and exact task custody while duplicate recovery ticks converge on one accepted dispatch.
 */
test("stale unfinished agent becomes one successor continuation", async context => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-successor-"));
	context.after(() => {
		fs.rmSync(root, { recursive: true, force: true });
	});
	const config = { root };
	const now = Date.now();
	const oldAt = new Date(now - 10 * 60 * 1000).toISOString();
	const mission = Fixture.mission(oldAt);
	declareContinuation(mission);
	const lock = Fixture.lock(mission.id, oldAt);
	const fingerprint = Prompt.fingerprint(config, mission, lock);
	const firstContext = Recovery.build(mission, fingerprint, { now, lock });
	const secondContext = Recovery.build(mission, fingerprint, { now: now + 1, lock });
	assert.equal(firstContext.recoveryReason, "stale_agent_unfinished_mission");
	assert.equal(firstContext.predecessorAgentId, "worker-old");
	assert.equal(firstContext.successorAgentId, secondContext.successorAgentId);
	assert.equal(firstContext.recoveryCheckpoint.unfinishedTasks[0].id, "task-open");
	const fake = Fixture.dependencies(mission, lock);
	const first = await Auto.run(config, { now, deps: fake.deps, owner: "coordinator" });
	const second = await Auto.run(config, { now: now + 1, deps: fake.deps, owner: "coordinator" });
	assert.equal(first.scheduled, true);
	assert.equal(second.scheduled, false);
	assert.equal(fake.dispatchCount(), 1);
	const record = fake.record();
	assert.equal(record.predecessorAgentId, "worker-old");
	assert.equal(record.successorAgentId, firstContext.successorAgentId);
	assert.equal(record.recoveryCheckpoint.unfinishedTasks[0].id, "task-open");
	for (const value of ["worker-old", firstContext.successorAgentId, "task-open",
		"Do not create a duplicate mission"]) {
		assert.equal(fake.prompt().includes(value), true, value);
	}
});

test("terminal mission creates no successor identity", () => {
	const context = Recovery.build(
		{ id: "done-mission", status: "completed" },
		"fingerprint",
		{ now: Date.now() }
	);
	assert.equal(context.unfinished, false);
	assert.equal(context.recoveryReason, "mission_terminal");
	assert.equal(context.successorAgentId, "");
});

function declareContinuation(mission) {
	return Requests.ensure(mission, {
		agentId: "worker-old",
		logicalAgentId: "worker-old",
		agentSessionId: "session-worker-old-1",
		generation: 1,
		taskId: "task-open",
		claimId: "claim-open"
	});
}
