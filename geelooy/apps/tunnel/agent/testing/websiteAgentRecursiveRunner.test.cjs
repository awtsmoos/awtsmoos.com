// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Fixture = require("./websiteAgentRecursiveFixture.cjs");

/**
 * @file Proves recursive agents coordinate durably without timing-map assumptions.
 * @description
 * The Awtsmoos lets the mission finish before or after observation; Awtsmoos.com
 * reads durable state, verifies child rooms, and keeps every launch policy at 18s.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-web-recursive-"));
const missionId = `recursive-runner-${process.pid}-${Date.now()}`;
process.env.AWTSMOOS_INSTALL_ROOT = path.join(root, "install");
process.env.AWTSMOOS_MISSION_JSON_BACKUP = "1";
const Runner = require("../tools/fs/actionGroups/websiteAgents/runner.js");
const Spawning = require("../tools/fs/actionGroups/websiteAgents/spawning.js");

(async () => {
	const calls = [];
	const sleeps = [];
	const service = Fixture.createService(calls, new Map());
	const config = {
		root,
		tunnelName: `recursive-runner-test-${process.pid}`,
		websiteMissionSleep: async milliseconds => sleeps.push(milliseconds),
		directService: service
	};
	try {
		for (const directory of ["runtime", "tests/one", "tests/two", "tests/three", "tests/invalid"]) {
			fs.mkdirSync(path.join(root, directory), { recursive: true });
		}
		const started = await Runner.start(config, {
			websiteMissionId: missionId,
			prompt: "Use recursive specialists for independent runtime verification.",
			agentCount: 3,
			collaborationRounds: 1,
			maxContinuationTurns: 2,
			maxSubagentDepth: 4,
			maxSubagentsPerAgent: 12,
			maxTotalWebsiteAgents: 8,
			startSpacingMs: 1,
			subagentStartSpacingMs: 1,
			projectRoot: root
		});
		const id = started.mission?.id || missionId;
		await waitForMission(config, id);
		const status = await Runner.status(config, { websiteMissionId: id });
		assert.equal(status.mission.status, "complete");
		assert.equal(status.mission.plan.startSpacingMs, 18000);
		assert.equal(status.mission.plan.subagentPolicy.subagentStartSpacingMs, 18000);
		assert.equal(status.mission.agents.length, 7);
		const parent = status.mission.agents.find(agent => agent.id === "website_01_architect");
		const child = status.mission.agents.find(agent => agent.id === parent.childAgentIds[0]);
		assert.equal(parent.spawnedChildCount, 1);
		assert.equal(child.depth, 1);
		assert.equal(child.spawnedChildCount, 3);
		assert.ok(child.childAgentIds.every(childId =>
			status.mission.agents.find(agent => agent.id === childId)?.status === "complete"
		));
		assert.equal(calls.length, 8);
		assert.ok(sleeps.every(milliseconds => milliseconds >= 18000));
		const duplicate = Spawning.admit(id, parent.id, [
			Fixture.request("runtime.child", "runtime child", "runtime", "Inspect runtime independently.")
		]);
		assert.equal(duplicate.accepted.length, 0);
		assert.equal(duplicate.duplicates.length, 1);
		assert.ok(status.mission.events.some(item =>
			item.type === "subagent_spawn_diagnostics" && item.counts?.invalid_spawn_request_id === 1
		));
		assert.equal(status.room.messages.filter(message =>
			message.kind === "website-subagent-created").length, 4);
		console.log(JSON.stringify({
			ok: true,
			suite: "website-agent-recursive-runner",
			stableRecursiveAgents: status.mission.agents.length,
			postClosePolicyMs: 18000,
			durableRoomLifecycle: true
		}, null, 2));
	} finally {
		for (const timer of Runner.wakeTimers.values()) clearTimeout(timer);
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

async function waitForMission(config, id) {
	for (let attempt = 0; attempt < 200; attempt += 1) {
		const active = Runner.active.get(id);
		if (active) await active;
		const value = await Runner.status(config, { websiteMissionId: id });
		if (["complete", "failed", "cancelled"].includes(value.mission.status)) return value;
		await new Promise(resolve => setTimeout(resolve, 5));
	}
	throw new Error("recursive_mission_did_not_finish");
}
