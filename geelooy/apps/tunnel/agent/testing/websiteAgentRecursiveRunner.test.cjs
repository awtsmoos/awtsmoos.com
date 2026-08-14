// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Fixture = require("./websiteAgentRecursiveFixture.cjs");
/** Proves the public spawn action creates live children in the same durable room. */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-web-submit-only-"));
const websiteMissionId = `submit-only-${process.pid}-${Date.now()}`;
process.env.AWTSMOOS_INSTALL_ROOT = path.join(root, "install");
process.env.AWTSMOOS_MISSION_JSON_BACKUP = "1";
const Runner = require("../tools/fs/actionGroups/websiteAgents/runner.js");

(async () => {
	const calls = [];
	const service = Fixture.createService(calls, new Map());
	const config = {
		root,
		tunnelName: `submit-only-test-${process.pid}`,
		websiteMissionSleep: async () => {},
		directService: service
	};
	try {
		for (const directory of ["runtime", "tests/one", "tests/two"]) {
			fs.mkdirSync(path.join(root, directory), { recursive: true });
		}
		await Runner.start(config, {
			websiteMissionId,
			prompt: "Dispatch independent specialists without waiting for responses.",
			agentCount: 3,
			collaborationRounds: 1,
			maxContinuationTurns: 2,
			maxSubagentDepth: 4,
			maxSubagentsPerAgent: 12,
			maxTotalWebsiteAgents: 8,
			projectRoot: root
		});
		let status = await waitFor(config, value => value.mission.phase === "agents_working");
		const parent = status.mission.agents[0];
		const spawned = await Runner.start(config, {
			parentWebsiteMissionId: websiteMissionId,
			parentMissionId: status.mission.missionId,
			parentAgentId: parent.id,
			requestKey: "runtime.child",
			role: "runtime specialist",
			scope: "runtime",
			childPrompt: "Inspect runtime and publish evidence."
		});
		assert.equal(spawned.accepted.length, 1);
		assert.equal(spawned.missionId, status.mission.missionId);
		const duplicate = await Runner.start(config, {
			parentWebsiteMissionId: websiteMissionId,
			parentAgentId: parent.id,
			requestKey: "runtime.child",
			role: "runtime specialist",
			scope: "runtime",
			childPrompt: "Inspect runtime and publish evidence."
		});
		assert.equal(duplicate.duplicates.length, 1);
		status = await waitFor(config, value => value.mission.agents.length === 4 &&
			value.mission.agents.every(agent => agent.status === "dispatched"));
		assert.equal(calls.length, 4);
		const rejected = await Runner.message(config, {
			websiteMissionId,
			agentId: "not-a-mission-member",
			body: "This signal must be rejected."
		});
		assert.equal(rejected.error, "unknown_website_agent");
		for (const [index, agent] of status.mission.agents.entries()) {
			const completion = {
				websiteMissionId,
				agentId: agent.id,
				kind: "completion",
				complete: true,
				reportId: `${agent.id}.completion`,
				body: `Verified completion for ${agent.id}.`,
				references: [agent.scope]
			};
			const committed = await Runner.message(config, completion);
			if (index === 0) {
				const duplicate = await Runner.message(config, completion);
				assert.equal(duplicate.duplicate, true);
				assert.equal(duplicate.delivery.roomRevision,
					committed.delivery.roomRevision);
			}
		}
		status = await Runner.status(config, { websiteMissionId });
		assert.equal(status.mission.status, "complete");
		assert.ok(status.mission.agents.every(agent => agent.lastOutcome?.complete));
		console.log(JSON.stringify({
			ok: true,
			suite: "website-agent-submit-only-runner",
			dispatchedAgents: calls.length,
			sameMissionChild: true,
			duplicateSuppressed: true,
			unknownAgentRejected: true,
			reportIdempotency: true,
			completionSynchronized: true
		}, null, 2));
	} finally {
		for (const timer of Runner.wakeTimers.values()) clearTimeout(timer);
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

async function waitFor(config, predicate) {
	for (let attempt = 0; attempt < 400; attempt += 1) {
		const active = Runner.active.get(websiteMissionId);
		if (active) await active;
		const value = await Runner.status(config, { websiteMissionId });
		if (predicate(value)) return value;
		if (["failed", "cancelled"].includes(value.mission.status)) return value;
		await new Promise(resolve => setTimeout(resolve, 5));
	}
	throw new Error("submit_only_mission_did_not_reach_expected_state");
}
