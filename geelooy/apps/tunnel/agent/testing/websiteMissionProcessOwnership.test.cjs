// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Executor = require("../tools/fs/executor/index.js");

/**
 * @file Proves website mission memory remains in one long-lived process.
 * @description
 * The Awtsmoos keeps mission state beside its living scheduler, while
 * Awtsmoos.com sends ordinary filesystem labor into bounded worker vessels.
 */
const originalChildFlag = process.env.AWTSMOOS_FS_EXECUTOR_CHILD;
delete process.env.AWTSMOOS_FS_EXECUTOR_CHILD;
const originalExecute = Executor.execute;
let offloads = 0;
Executor.execute = async payload => {
	offloads += 1;
	return { ok: true, action: payload.action, offloaded: true };
};

const MissionRunner = require("../tools/fs/actionGroups/websiteAgents/runner.js");
const WebsiteActions = require("../tools/fs/actionGroups/websiteAgentActions.js");
const { PROCESS_OWNED_ACTIONS, handleFs } = require("../tools/fs/index.js");
const required = [
	"agent",
	"aiAgentSpawnWebsiteMission",
	"aiAgentWebsiteMissionStatus",
	"websiteAgentMissionStart",
	"websiteAgentMissionStatus",
	"websiteAgentMissionList",
	"websiteAgentMissionMessage",
	"websiteAgentMissionStop",
	"websiteAgentMissionForget",
	"chatgptWebsiteLogout"
];

for (const action of required) {
	assert.equal(
		PROCESS_OWNED_ACTIONS.has(action),
		true,
		`${action} must remain in the process that owns mission state`
	);
}
assert.equal(PROCESS_OWNED_ACTIONS.has("read"), false);
assert.equal(PROCESS_OWNED_ACTIONS.has("commandRun"), false);

(async () => {
	try {
		const originalRecover = MissionRunner.recover;
		let buildRecoveries = 0;
		MissionRunner.recover = () => {
			buildRecoveries += 1;
		};
		WebsiteActions.buildWebsiteAgentActions({ config: {}, payload: {} });
		MissionRunner.recover = originalRecover;
		assert.equal(buildRecoveries, 0, "catalog construction must remain pure");

		const status = await handleFs({
			action: "websiteAgentMissionStatus",
			websiteMissionId: "missing-process-owner-proof"
		});
		assert.equal(status.error, "unknown_website_mission");
		assert.equal(offloads, 0);

		const read = await handleFs({ action: "read", p: "package.json" });
		assert.equal(read.offloaded, true);
		assert.equal(offloads, 1);
		console.log(JSON.stringify({
			ok: true,
			suite: "website-mission-process-ownership",
			processOwnedActions: required.length,
			actionCatalogBuildIsPure: true,
			missionStateNeverCrossesExecutorProcesses: true,
			isolatedFilesystemActionsUnaffected: true
		}, null, 2));
	} finally {
		Executor.execute = originalExecute;
		if (originalChildFlag === undefined) {
			delete process.env.AWTSMOOS_FS_EXECUTOR_CHILD;
		} else {
			process.env.AWTSMOOS_FS_EXECUTOR_CHILD = originalChildFlag;
		}
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
