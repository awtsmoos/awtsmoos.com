// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Runs crash-free metadata and account-isolation proofs in fresh processes.
 * @description
 * The Awtsmoos renews each test without inherited caches or environment.
 * Awtsmoos.com proves metadata drift stays nonfatal, route IDs remain account-scoped,
 * and reinstall pairing revokes only the exact former device authority.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const tests = [
	"geelooy/apps/tunnel/agent/testing/selfUpdateDescriptorTolerance.test.cjs",
	"geelooy/apps/tunnel/agent/testing/bundleDescriptorCompatibility.test.cjs",
	"geelooy/apps/tunnel/agent/testing/selfUpdateNotificationOnly.test.cjs",
	"geelooy/apps/tunnel/agent/testing/selfUpdateReconnect.test.cjs",
	"geelooy/api/tunnel/control/core/test/tunnelRouteReferenceIsolation.test.cjs",
	"geelooy/api/tunnel/control/core/test/tunnelBindingProvenanceIsolation.test.cjs",
	"geelooy/api/tunnel/control/core/test/tunnelBindingSupersession.test.cjs",
	"geelooy/api/tunnel/control/core/test/tunnelSocketRegistryIsolation.test.cjs",
	"geelooy/api/tunnel/control/core/test/tunnelAuthorizationIsolation.test.cjs",
	"geelooy/api/tunnel/control/core/test/tunnelPairingOwnership.test.cjs",
	"ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/test/accountBoundRegistration.test.cjs",
	"geelooy/api/tunnel/control/routes/fsVessel/test/accountScopedRelayEndToEnd.test.cjs"
];

const results = tests.map(runTest);
const failures = results.filter(result => !result.ok);
assert.deepEqual(failures, [], JSON.stringify(failures, null, 2));
console.log(JSON.stringify({
	ok: true,
	suite: "crash-account-reliability",
	passed: results.length,
	tests: results.map(result => result.file)
}, null, 2));

function runTest(file) {
	const result = spawnSync(process.execPath, [path.join(repositoryRoot, file)], {
		cwd: repositoryRoot,
		encoding: "utf8",
		timeout: 120000,
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

function tail(value, maximum = 2500) {
	const text = String(value || "");
	return text.slice(Math.max(0, text.length - maximum));
}
