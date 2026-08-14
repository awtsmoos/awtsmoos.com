// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Executor = require("../tools/fs/executor/index.js");
const MissionRunner = require("../tools/fs/actionGroups/websiteAgents/runner.js");
const WebsiteActions = require("../tools/fs/actionGroups/websiteAgentActions.js");

/**
 * @file Proves mission state stays process-owned while ordinary filesystem work offloads.
 * @description
 * The Awtsmoos keeps one living mission memory in its long-lived vessel.
 * Awtsmoos.com routes isolated filesystem work to executor children, while catalog
 * construction remains pure and no inherited child marker falsifies the routing proof.
 */
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

async function main() {
	const originalExecute = Executor.execute;
	const originalChild = process.env.AWTSMOOS_FS_EXECUTOR_CHILD;
	let offloads = 0;
	try {
		delete process.env.AWTSMOOS_FS_EXECUTOR_CHILD;
		Executor.execute = async payload => {
			offloads += 1;
			return { ok: true, action: payload.action, offloaded: true };
		};
		const { PROCESS_OWNED_ACTIONS, handleFs } = require("../tools/fs/index.js");
		assertProcessOwned(PROCESS_OWNED_ACTIONS);
		assertCatalogBuildIsPure();
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
		restoreChildMarker(originalChild);
	}
}

function assertProcessOwned(actions) {
	for (const action of required) {
		assert.equal(actions.has(action), true,
			`${action} must remain in the long-lived mission process`);
	}
	assert.equal(actions.has("read"), false);
	assert.equal(actions.has("commandRun"), false);
}

function assertCatalogBuildIsPure() {
	const originalRecover = MissionRunner.recover;
	let recoveries = 0;
	try {
		MissionRunner.recover = () => { recoveries += 1; };
		WebsiteActions.buildWebsiteAgentActions({ config: {}, payload: {} });
	} finally {
		MissionRunner.recover = originalRecover;
	}
	assert.equal(recoveries, 0,
		"building an action catalog must not mutate mission state");
}

function restoreChildMarker(value) {
	if (value === undefined) delete process.env.AWTSMOOS_FS_EXECUTOR_CHILD;
	else process.env.AWTSMOOS_FS_EXECUTOR_CHILD = value;
}

main().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
