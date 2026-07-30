// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-web-mission-"));
process.env.AWTSMOOS_INSTALL_ROOT = path.join(root, "install");
process.env.AWTSMOOS_MISSION_JSON_BACKUP = "1";
const Runner = require("../tools/fs/actionGroups/websiteAgents/runner.js");

(async () => {
	const calls = [];
	const sleeps = [];
	const config = {
		root,
		tunnelName: "website-test",
		websiteMissionSleep: async milliseconds => sleeps.push(milliseconds),
		directService: {
			async send(options) {
				calls.push(options);
				options.onProgress?.({
					stage: "website-submit",
					status: "accepted",
					at: Date.now()
				});
				return {
					answer: [
						"STATUS",
						"COMPLETE",
						"FINDINGS",
						"Verified scoped work.",
						"FILES",
						"none",
						"MESSAGE TO ROOM",
						"Scoped work is verified.",
						"NEXT",
						"none"
					].join("\n"),
					conversationKey: `BH_DIRECT_TEST_${calls.length}`,
					completionSource: "page-request-get",
					sameConversation: true,
					composerTouched: true,
					submissionTransport: "chatgpt-website-composer"
				};
			},
			reset() {
				return { deleted: 1 };
			}
		}
	};
	try {
		const started = await Runner.start(config, {
			prompt: "Inspect the repository carefully.",
			agentCount: 3,
			collaborationRounds: 1,
			projectRoot: root
		});
		assert.equal(started.ok, true);
		assert.equal(started.nonBlocking, true);
		assert.equal(started.mission.plan.agentCount, 3);
		await Runner.active.get(started.mission.id);
		const status = await Runner.status(config, {
			websiteMissionId: started.mission.id
		});
		assert.equal(status.mission.status, "complete");
		assert.equal(calls.length, 3);
		assert.deepEqual(sleeps, [12000, 12000]);
		assert.equal(status.room.agents.length, 4);
		assert.ok(status.room.messages.some(message =>
			message.kind === "website-agent-update"
		));
		assert.equal(status.room.openDelegations.length, 0);
		assert.ok(status.mission.agents.every(agent =>
			agent.hasPrivateContinuation && !("conversationKey" in agent)
		));
		const forgotten = await Runner.forget(config, {
			websiteMissionId: started.mission.id
		});
		assert.equal(forgotten.ok, true);
		assert.equal(forgotten.privateContinuationsDeleted, 3);
		console.log(JSON.stringify({
			ok: true,
			suite: "website-agent-mission-runner",
			agents: calls.length,
			leadContinuesNonBlocking: true,
			privateContinuationsRedacted: true,
			privateContinuationsDeleted: true,
			sharedRoomUpdates: true,
			scopesClaimed: true,
			startSpacingEnforced: true
		}, null, 2));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
