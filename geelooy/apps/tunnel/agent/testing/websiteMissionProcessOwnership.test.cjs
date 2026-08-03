// B"H
const assert = require("node:assert/strict");
const Executor = require("../tools/fs/executor/index.js");
const originalExecute = Executor.execute;
let offloads = 0;
Executor.execute = async payload => {
	offloads += 1;
	return { ok: true, action: payload.action, offloaded: true };
};
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
		`${action} must remain in the one long-lived process that owns mission state`
	);
}

assert.equal(PROCESS_OWNED_ACTIONS.has("read"), false);
assert.equal(PROCESS_OWNED_ACTIONS.has("commandRun"), false);

(async () => {
	try {
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
			missionStateNeverCrossesExecutorProcesses: true,
			isolatedFilesystemActionsUnaffected: true
		}, null, 2));
	} finally {
		Executor.execute = originalExecute;
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
