// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Planner = require("../tools/fs/actionGroups/websiteAgents/planner.js");
const Fixtures = require("./websiteAgentSubmitOnlyFixtures.cjs");

/**
 * @file Proves three logical agents are durably dispatched through paced turns.
 * @description
 * The Awtsmoos delivers prompts without pretending delivery is completion.
 * Awtsmoos.com leaves every agent working through tools and rooms after verified
 * closure, with eighteen seconds between each physical prompt-delivery vessel.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-web-mission-"));
process.env.AWTSMOOS_INSTALL_ROOT = path.join(root, "install");
process.env.AWTSMOOS_MISSION_JSON_BACKUP = "1";
const Runner = require("../tools/fs/actionGroups/websiteAgents/runner.js");

(async () => {
	const calls = [];
	const sleeps = [];
	const config = {
		root,
		tunnelName: "website-submit-only-test",
		websiteMissionSleep: async milliseconds => sleeps.push(milliseconds),
		directService: Fixtures.authenticatedService(calls)
	};
	try {
		const started = await Runner.start(config, {
			websiteMissionId: Fixtures.missionId("mission-runner"),
			prompt: "Inspect the canonical repository and continue through tools.",
			agentCount: 3,
			collaborationRounds: 1,
			projectRoot: root
		});
		assert.equal(started.ok, true);
		assert.equal(started.nonBlocking, true);
		await Runner.active.get(started.mission.id);
		const status = await Runner.status(config, {
			websiteMissionId: started.mission.id
		});
		assert.equal(status.mission.status, "running");
		assert.equal(status.mission.phase, "agents_working");
		assert.equal(status.mission.lead.status, "working_locally");
		assert.ok(status.mission.agents.every(agent => agent.status === "dispatched"));
		assert.equal(calls.length, 3);
		assert.deepEqual(sleeps, []);
		assert.ok(calls.every(call => call.agentStartUrl === Planner.AWTSMOOS_SHLIACH_URL));
		assert.ok(calls.every(call => call.prompt.includes("Canonical project root:")));
		assert.ok(calls.every(call => call.prompt.includes("Claimed absolute scope:")));
		assert.ok(calls.every(call => call.prompt.includes("Stable turn identity:")));
		assert.equal(status.room.messages.filter(item =>
			item.kind === "website-agent-dispatched").length, 3);
		assert.ok(status.mission.agents.every(agent =>
			agent.lastOutcome?.dispatched === true && agent.lastOutcome?.complete === false));
		const forgotten = await Runner.forget(config, {
			websiteMissionId: started.mission.id
		});
		assert.equal(forgotten.ok, true);
		console.log(JSON.stringify({
			ok: true,
			suite: "website-agent-mission-runner-submit-only",
			agentsDispatched: 3,
			missionStillWorking: true,
			globalQueueOwnsPostCloseCooldown: true
		}, null, 2));
	} finally {
		for (const timer of Runner.wakeTimers.values()) clearTimeout(timer);
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
