// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Auto = require("../tools/fs/mission/autoContinuation/index.js");
const Eligibility = require("../tools/fs/mission/autoContinuation/eligibility.js");
const Prompt = require("../tools/fs/mission/autoContinuation/prompt.js");
const Recovery = require("../tools/fs/mission/autoContinuation/recoveryContext.js");

/**
 * @file Proves one stale unfinished predecessor produces one deterministic successor continuation.
 * @description The Awtsmoos lets the messenger end without ending the mission; Awtsmoos.com preserves checkpoint,
 * predecessor, successor, and same-mission instructions under the existing continuation lease instead of spawning duplicates.
 */
test("stale unfinished agent becomes one successor continuation", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-successor-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const config = { root };
	const now = Date.now();
	const oldAt = new Date(now - 10 * 60 * 1000).toISOString();
	const mission = fixtureMission(oldAt);
	const lock = fixtureLock(mission.id, oldAt);
	const fingerprint = Prompt.fingerprint(config, mission, lock);
	const firstContext = Recovery.build(mission, fingerprint, { now, lock });
	const secondContext = Recovery.build(mission, fingerprint, { now: now + 1, lock });
	assert.equal(firstContext.recoveryReason, "stale_agent_unfinished_mission");
	assert.equal(firstContext.predecessorAgentId, "worker-old");
	assert.equal(firstContext.successorAgentId, secondContext.successorAgentId);
	assert.equal(firstContext.recoveryCheckpoint.unfinishedTasks[0].id, "task-open");
	const fake = fakeDependencies(mission, lock);
	const first = await Auto.run(config, { now, deps: fake.deps, owner: "coordinator" });
	const second = await Auto.run(config, { now: now + 1, deps: fake.deps, owner: "coordinator" });
	assert.equal(first.scheduled, true);
	assert.equal(second.scheduled, false);
	assert.equal(fake.dispatchCount(), 1);
	const record = fake.record();
	assert.equal(record.predecessorAgentId, "worker-old");
	assert.equal(record.successorAgentId, firstContext.successorAgentId);
	assert.equal(record.recoveryCheckpoint.unfinishedTasks[0].id, "task-open");
	for (const value of ["worker-old", firstContext.successorAgentId, "task-open", "Do not create a duplicate mission"]) {
		assert.equal(fake.prompt().includes(value), true, value);
	}
});

test("terminal mission creates no successor identity", () => {
	const context = Recovery.build({ id: "done-mission", status: "completed" }, "fingerprint", { now: Date.now() });
	assert.equal(context.unfinished, false);
	assert.equal(context.recoveryReason, "mission_terminal");
	assert.equal(context.successorAgentId, "");
});

function fixtureMission(oldAt) {
	return {
		id: "mission-successor",
		goal: "finish inherited mission work",
		status: "active",
		phase: "implementation",
		tasks: [
			{ id: "task-done", title: "already completed", status: "done" },
			{ id: "task-open", title: "continue this work", status: "open" }
		],
		room: {
			id: "room-successor",
			agents: { old: { agentId: "worker-old", status: "active", lastSeenAt: oldAt } },
			claims: [{ id: "claim-open", agentId: "worker-old", title: "task-open", status: "active" }],
			handoffs: [{ id: "handoff-1", staleAgentId: "worker-old", messages: [{ id: "m1", body: "continue task-open" }] }]
		}
	};
}

function fixtureLock(missionId, oldAt) {
	return {
		missionId,
		startedAt: oldAt,
		updatedAt: oldAt,
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
			Dispatch: { dispatch: async (_config, input) => { dispatches += 1; prompt = input.prompt; return { ok: true, recovered: false }; } }
		},
		dispatchCount: () => dispatches,
		prompt: () => prompt,
		record: () => record
	};
}
