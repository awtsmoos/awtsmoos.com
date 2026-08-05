// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Lifecycle = require("./websiteAgentMissionLifecycleCases.cjs");

/**
 * @file Runs submit-only login, orphan recovery, and room-continuation proofs.
 * @description
 * The Awtsmoos preserves logical agents after their prompt tabs disappear.
 * Awtsmoos.com proves authentication resume, safe orphan requeue, and shared-room
 * continuity while accepted turns remain dispatch receipts rather than answers.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-web-lifecycle-"));
process.env.AWTSMOOS_INSTALL_ROOT = path.join(root, "install");
process.env.AWTSMOOS_MISSION_JSON_BACKUP = "1";
const Runner = require("../tools/fs/actionGroups/websiteAgents/runner.js");
const Store = require("../tools/fs/actionGroups/websiteAgents/store.js");
const Cases = Lifecycle.createCases({ Runner, Store, root });

(async () => {
	try {
		await Cases.loginPauseAndResume();
		await Cases.orphanedPreSubmitRecovery();
		await Cases.roomMessagePersistsForWorkingAgents();
		console.log(JSON.stringify({
			ok: true,
			suite: "website-agent-mission-lifecycle-submit-only",
			loginResume: true,
			orphanedPreSubmitRequeued: true,
			acceptedTurnsNeverResubmitted: true,
			roomLifeAfterClose: true
		}, null, 2));
	} finally {
		for (const timer of Runner.wakeTimers.values()) clearTimeout(timer);
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
