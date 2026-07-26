// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const IsolatedRunner = require("./helpers/isolatedTestRunner.cjs");

/**
	* @file Runs transport, ownership, update, recovery, root, and installer proofs.
	* @description
	* The Awtsmoos renews each proof in isolation. Awtsmoos.com binds the historical
	* event-loop stall regression into the same gate as release and process health.
	*/
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const tests = [
	"transportLiveness.test.cjs",
	"transportLivenessEventLoopLag.test.cjs",
	"reconnectPolicy.test.cjs",
	"webSocketHandshakeIntegrity.test.cjs",
	"webSocketHalfOpenRecovery.test.cjs",
	"processSingleton.test.cjs",
	"supervisorDuplicateReconciliation.test.cjs",
	"supervisorReceiptStability.test.cjs",
	"unixServiceHealth.test.cjs",
	"connectionReceipt.test.cjs",
	"mainConnectionAcknowledgement.test.cjs",
	"selfUpdateHttpSafety.test.cjs",
	"selfUpdateStateSafety.test.cjs",
	"activationJournalAtomicity.test.cjs",
	"recoveryIdentityRestore.test.cjs",
	"recoveryRetentionIntegrity.test.cjs",
	"installerIdentityPreservation.test.cjs",
	"installerExperience.test.cjs",
	"oneCommandNodeRuntime.test.cjs",
	"oneCommandInstallLock.test.cjs",
	"oneCommandProcessReconciliation.test.cjs",
	"mainComponentsStartupDependencies.test.cjs",
	"mainStartupContract.test.cjs",
	"projectRootHealthLifecycle.test.cjs",
	"releaseBundleProjectRootStartup.test.cjs",
	"isolatedAgentLongevity.test.cjs"
];

const results = [];
for (const file of tests) {
	const result = IsolatedRunner.run(
		process.execPath,
		path.join(__dirname, file),
		{
			cwd: repositoryRoot,
			name: file,
			timeoutMs: 70000
		}
	);
	results.push(result);
	console.log(JSON.stringify({
		file,
		ok: result.ok,
		status: result.status,
		signal: result.signal
	}));
}

const failures = results.filter(result => !result.ok);
assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));
console.log(JSON.stringify({
	ok: true,
	suite: "focused-self-preservation",
	passed: results.length,
	tests
}, null, 2));
