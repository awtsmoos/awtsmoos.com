// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const IsolatedRunner = require("./helpers/isolatedTestRunner.cjs");

/**
	* @file Runs permanent connection, maintenance, diagnostics, ownership, and installer proofs.
	* @description
	* The Awtsmoos renews every proof in isolation. Awtsmoos.com binds child liveness,
	* bounded mailboxes, classified failures, current health, and installer closure.
	*/
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const tests = [
	"connectionMailbox.test.cjs",
	"connectionMailboxMaintenance.test.cjs",
	"connectionMailboxTargetedFlush.test.cjs",
	"connectionVesselDelivery.test.cjs",
	"connectionVesselTransientFrames.test.cjs",
	"connectionVesselParentStall.test.cjs",
	"connectionParentWatchdog.test.cjs",
	"connectionVesselController.test.cjs",
	"connectionReceiptDualPid.test.cjs",
	"deviceStateRootCanonical.test.cjs",
	"circuitStateConsistency.test.cjs",
	"transportFailureClassification.test.cjs",
	"windowsTransactionalInstallerContract.test.cjs",
	"workerHealthProjection.test.cjs",
	"atomicWorktreeRecovery.test.mjs",
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
	"waitLaneNeverBlocksControl.test.cjs",
	"mixedActionRelayStall.test.cjs",
	"productionRetryIngress.test.cjs",
	"commandLifecycleCompat.test.cjs",
	"asyncTaskTerminalResult.test.cjs",
	"asyncTaskFailureResult.test.cjs",
	"fsExecutorAsyncAffinity.test.cjs",
	"fsExecutorServerAffinity.test.cjs",
	"reportedSurfaceRegression.test.cjs",
	"listPaginationBudget.test.cjs",
	"chromeAutoLaunchIntegration.test.cjs",
	"chromeWebGlIntegration.test.cjs",
	"chromeProcessOwnership.test.cjs",
	"chromeLogIsolation.test.cjs",
	"isolatedHtmlIntegration.test.cjs",
	"livingLibraryRendererIntegration.test.cjs",
	"staticServerReadiness.test.cjs",
	"portActions.test.cjs",
	"selfUpdateHttpSafety.test.cjs",
	"selfUpdateStateSafety.test.cjs",
	"activationJournalAtomicity.test.cjs",
	"recoveryIdentityRestore.test.cjs",
	"recoveryRetentionIntegrity.test.cjs",
	"installerIdentityPreservation.test.cjs",
	"installerExperience.test.cjs",
	"installerComponentBundle.test.cjs",
	"unixParallelBootstrapDownloads.test.cjs",
	"oneCommandNodeRuntime.test.cjs",
	"oneCommandInstallLock.test.cjs",
	"oneCommandProcessReconciliation.test.cjs",
	"productionCurrentRootProcessSurvival.test.cjs",
	"plannedRestartHandoff.test.cjs",
	"unixStateMigration.test.cjs",
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
