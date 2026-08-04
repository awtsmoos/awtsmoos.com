// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Fixture = require("./websiteAgentRecursiveFixture.cjs");

/**
 * @file Proves submit-only swarms dispatch without waiting for browser answers.
 * @description
 * The Awtsmoos sends each shliach into durable work, while Awtsmoos.com records the
 * room and child-admission covenant without keeping a response tab or second clock.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-web-submit-only-"));
const missionId = `submit-only-${process.pid}-${Date.now()}`;
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
		tunnelName: `submit-only-test-${process.pid}`,
		websiteMissionSleep: async milliseconds => sleeps.push(milliseconds),
		directService: service
	};
	try {
		for (const directory of ["runtime", "tests/one", "tests/two"]) {
			fs.mkdirSync(path.join(root, directory), { recursive: true });
		}
		await Runner.start(config, {
			websiteMissionId: missionId,
			prompt: "Dispatch independent specialists without waiting for responses.",
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
		const status = await waitForDispatch(config, missionId);
		assert.equal(status.mission.status, "running");
		assert.equal(status.mission.phase, "agents_working");
		assert.equal(status.mission.plan.startSpacingMs, 18000);
		assert.equal(status.mission.plan.subagentPolicy.subagentStartSpacingMs, 18000);
		assert.equal(status.mission.agents.length, 3);
		assert.ok(status.mission.agents.every(agent => agent.status === "dispatched"));
		assert.equal(calls.length, 3);
		assert.equal(sleeps.length, 0);
		assert.ok(status.mission.events.some(item =>
			item.type === "mission_agents_working" && item.dispatchedAgents === 3
		));
		const parent = status.mission.agents[0];
		const admission = Spawning.admit(missionId, parent.id, [
			Fixture.request("runtime.child", "runtime child", "runtime", "Inspect runtime."),
			Fixture.request("tests.child", "tests child", "tests/one", "Inspect tests.")
		]);
		assert.equal(admission.accepted.length, 2);
		const duplicate = Spawning.admit(missionId, parent.id, [
			Fixture.request("runtime.child", "runtime child", "runtime", "Inspect runtime.")
		]);
		assert.equal(duplicate.accepted.length, 0);
		assert.equal(duplicate.duplicates.length, 1);
		assert.ok(status.room.messages.some(message => message.kind === "mission-start"));
		console.log(JSON.stringify({
			ok: true,
			suite: "website-agent-submit-only-runner",
			dispatchedAgents: status.mission.agents.length,
			missionLayerSleeps: sleeps.length,
			postClosePolicyMs: 18000,
			durableChildAdmission: admission.accepted.length
		}, null, 2));
	} finally {
		for (const timer of Runner.wakeTimers.values()) clearTimeout(timer);
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

async function waitForDispatch(config, id) {
	for (let attempt = 0; attempt < 400; attempt += 1) {
		const active = Runner.active.get(id);
		if (active) await active;
		const value = await Runner.status(config, { websiteMissionId: id });
		if (value.mission.phase === "agents_working") return value;
		if (["failed", "cancelled"].includes(value.mission.status)) return value;
		await new Promise(resolve => setTimeout(resolve, 5));
	}
	throw new Error("submit_only_mission_did_not_dispatch");
}
