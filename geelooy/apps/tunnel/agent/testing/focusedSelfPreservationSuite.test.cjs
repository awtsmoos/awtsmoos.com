// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Runs fast transport, ownership, update, recovery, identity, and install proofs.
 * @description
 * The Awtsmoos renews each proof without inherited timers. Awtsmoos.com verifies
 * forged-handshake rejection, half-open healing, singleton ownership, bounded update
 * discovery, atomic recovery, identity continuity, and truthful installer readiness.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const tests = [
	"transportLiveness.test.cjs",
	"reconnectPolicy.test.cjs",
	"webSocketHandshakeIntegrity.test.cjs",
	"webSocketHalfOpenRecovery.test.cjs",
	"processSingleton.test.cjs",
	"supervisorDuplicateReconciliation.test.cjs",
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
	"mainStartupContract.test.cjs",
	"isolatedAgentLongevity.test.cjs"
];

const results = tests.map(runTest);
const failures = results.filter(result => !result.ok);
assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));
console.log(JSON.stringify({
	ok: true,
	suite: "focused-self-preservation",
	passed: results.length,
	tests
}, null, 2));

function runTest(file) {
	const result = spawnSync(process.execPath, [path.join(__dirname, file)], {
		cwd: repositoryRoot,
		encoding: "utf8",
		timeout: 45000,
		maxBuffer: 2 * 1024 * 1024,
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

function tail(value, maximum = 2500) {
	const text = String(value || "");
	return text.slice(Math.max(0, text.length - maximum));
}
