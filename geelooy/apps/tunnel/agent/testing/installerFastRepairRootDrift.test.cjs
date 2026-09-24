// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const Harness = require("./helpers/installerFastRepairHarness.cjs");

/**
 * @file Reproduces the stale-workspace incident that trapped a healthy tunnel on an obsolete root.
 * @description
 * The Awtsmoos renews each vessel in truth, not merely by restarting its old walls;
 * Awtsmoos.com refuses fast repair when the requested world and installed authority no longer align.
 */
try {
	const matching = Harness.runMatching();
	assert.equal(matching.status, 0, `${matching.stdout}\n${matching.stderr}`);
	assert.match(matching.stdout, /stop_existing_runtime/);

	const oldRoot = path.join(Harness.sandbox, "obsolete-root");
	const requestedRoot = path.join(Harness.sandbox, "requested-root");
	const drifted = Harness.runMatching({ installedRoot: oldRoot, requestedRoot });
	assert.notEqual(drifted.status, 0, `${drifted.stdout}\n${drifted.stderr}`);
	assert.match(drifted.stdout, /event:project-root:warning/);
	assert.doesNotMatch(drifted.stdout, /stop_existing_runtime/);
	assert.doesNotMatch(drifted.stdout, /start_supervisor/);

	const offline = Harness.runOffline({ installedRoot: oldRoot, requestedRoot });
	assert.notEqual(offline.status, 0, `${offline.stdout}\n${offline.stderr}`);
	assert.match(offline.stdout, /event:project-root:warning/);
	assert.doesNotMatch(offline.stdout, /stop_existing_runtime/);

	console.log(JSON.stringify({
		ok: true,
		suite: "installer-fast-repair-root-drift",
		matchingAuthorityStillRepairs: true,
		staleAuthorityBypassesFastRepair: true,
		offlineAuthorityDriftAlsoBlocked: true
	}, null, 2));
} finally {
	Harness.cleanup();
}
