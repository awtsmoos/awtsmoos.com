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
	const config = {
		root,
		tunnelName: "website-test",
		directService: {
			async send(options) {
				calls.push(options);
				options.onProgress?.({
					stage: "website-submit",
					status: "accepted",
					at: Date.now()
				});
				return {
					answer: `STATUS\ncomplete\nMESSAGE TO ROOM\n${options.prompt.slice(0, 40)}`,
					conversationKey: `BH_DIRECT_TEST_${calls.length}`,
					completionSource: "page-request-get",
					sameConversation: true,
					composerTouched: true,
					submissionTransport: "chatgpt-website-composer"
				};
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
		assert.equal(status.room.agents.length, 4);
		assert.ok(status.room.messages.some(message =>
			message.kind === "website-agent-update"
		));
		assert.ok(status.mission.agents.every(agent =>
			agent.hasPrivateContinuation && !("conversationKey" in agent)
		));
		console.log(JSON.stringify({
			ok: true,
			suite: "website-agent-mission-runner",
			agents: calls.length,
			leadContinuesNonBlocking: true,
			privateContinuationsRedacted: true,
			sharedRoomUpdates: true
		}, null, 2));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
