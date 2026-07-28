// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
	* @file Runs transport, retention, mailbox, diagnostics, settlement, and installer proofs.
	* @description
	* The Awtsmoos requires durable acceptance, guarded cleanup, classified failure,
	* authoritative discovery, truthful health, and transactional reinstall together.
	*/
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const tests = [
	"geelooy/apps/tunnel/agent/testing/connectionMailbox.test.cjs",
	"geelooy/apps/tunnel/agent/testing/connectionMailboxMaintenance.test.cjs",
	"geelooy/apps/tunnel/agent/testing/connectionVesselDelivery.test.cjs",
	"geelooy/apps/tunnel/agent/testing/connectionVesselParentStall.test.cjs",
	"geelooy/apps/tunnel/agent/testing/connectionParentWatchdog.test.cjs",
	"geelooy/apps/tunnel/agent/testing/connectionVesselController.test.cjs",
	"geelooy/apps/tunnel/agent/testing/connectionReceiptDualPid.test.cjs",
	"geelooy/apps/tunnel/agent/testing/circuitStateConsistency.test.cjs",
	"geelooy/apps/tunnel/agent/testing/transportFailureClassification.test.cjs",
	"geelooy/apps/tunnel/agent/testing/windowsTransactionalInstallerContract.test.cjs",
	"geelooy/apps/tunnel/agent/testing/workerHealthProjection.test.cjs",
	"geelooy/apps/tunnel/agent/testing/atomicWorktreeRecovery.test.mjs",
	"geelooy/api/tunnel/control/core/test/tunnelBindingRetention.test.cjs",
	"geelooy/api/tunnel/control/routes/fsVessel/test/nativeInventoryView.test.cjs",
	"ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay.default-clean.test.cjs",
	"ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/responseAckRecovery.test.cjs",
	"ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/test/relayRetryImmediate.test.cjs",
	"geelooy/apps/tunnel/agent/testing/transportLiveness.test.cjs",
	"geelooy/apps/tunnel/agent/testing/transportLivenessEventLoopLag.test.cjs",
	"geelooy/apps/tunnel/agent/testing/reconnectPolicy.test.cjs",
	"geelooy/apps/tunnel/agent/testing/webSocketHalfOpenRecovery.test.cjs",
	"geelooy/apps/tunnel/agent/testing/unixServiceHealth.test.cjs",
	"geelooy/apps/tunnel/agent/testing/connectionReceipt.test.cjs",
	"geelooy/apps/tunnel/agent/testing/mainConnectionAcknowledgement.test.cjs",
	"geelooy/apps/tunnel/agent/testing/installerExperience.test.cjs",
	"geelooy/apps/tunnel/agent/testing/mainConnectionContract.test.cjs",
	"geelooy/apps/tunnel/agent/testing/mainStartupContract.test.cjs",
	"geelooy/apps/tunnel/agent/testing/waitLaneNeverBlocksControl.test.cjs",
	"geelooy/apps/tunnel/agent/testing/mixedActionRelayStall.test.cjs",
	"geelooy/apps/tunnel/agent/testing/transactionalUnixInstaller.test.cjs",
	"geelooy/apps/tunnel/agent/testing/installerManifestChecksumContract.test.cjs"
];

const results = tests.map(runTest);
const failures = results.filter(result => !result.ok);
assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));

console.log(JSON.stringify({
	ok: true,
	suite: "self-preservation",
	passed: results.length,
	tests: results.map(result => result.file)
}, null, 2));

function runTest(file) {
	const result = spawnSync(process.execPath, [path.join(repositoryRoot, file)], {
		cwd: repositoryRoot,
		encoding: "utf8",
		timeout: 180000,
		maxBuffer: 8 * 1024 * 1024,
		env: { ...process.env }
	});
	return {
		file,
		ok: result.status === 0 && !result.error,
		status: result.status,
		signal: result.signal,
		error: result.error?.message || "",
		stdout: tail(result.stdout),
		stderr: tail(result.stderr)
	};
}

function tail(value, maximum = 3000) {
	const text = String(value || "");
	return text.slice(Math.max(0, text.length - maximum));
}
