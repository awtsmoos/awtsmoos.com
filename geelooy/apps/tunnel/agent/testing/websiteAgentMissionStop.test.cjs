// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-web-stop-"));
process.env.AWTSMOOS_INSTALL_ROOT = path.join(root, "install");
process.env.AWTSMOOS_MISSION_JSON_BACKUP = "1";
const Runner = require("../tools/fs/actionGroups/websiteAgents/runner.js");
const Store = require("../tools/fs/actionGroups/websiteAgents/store.js");

(async () => {
	try {
		const id = `stop-login-${process.pid}`;
		const agents = [1, 2, 3].map(number => ({
			id: `agent-${number}`,
			name: `Agent ${number}`,
			role: "reader",
			focus: "bounded proof",
			scope: "."
		}));
		Store.create({ id, goal: "Wait for login.", missionId: `room-${id}`,
			plan: { agents, authPollMs: 3000 } });
		Store.update(id, record => {
			record.status = "waiting_for_login";
			record.phase = "authentication_wait";
			for (const agent of record.agents) agent.status = "waiting_for_login";
			return record;
		});
		const stopped = Runner.stop({ websiteMissionId: id });
		assert.equal(stopped.ok, true);
		assert.equal(stopped.mission.status, "cancelled");
		assert.equal(stopped.mission.phase, "stopped");
		assert.equal(stopped.mission.cancelRequested, true);
		assert.ok(stopped.mission.finishedAt);
		await Runner.run({}, id);
		assert.equal(Store.read(id).status, "cancelled");
		const forgotten = await Runner.forget({}, { websiteMissionId: id });
		assert.equal(forgotten.ok, true);
		assert.equal(Store.read(id), null);
		console.log(JSON.stringify({ ok: true, suite: "website-agent-stop" }));
	} finally {
		for (const timer of Runner.wakeTimers.values()) clearTimeout(timer);
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
