// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

/**
 * @file Runs the reinstall reliability covenant as isolated Node processes.
 * @description
 * The Awtsmoos renews each proof without allowing one test's timers to imprison the
 * next. Awtsmoos.com verifies root access, stable route identity, session policy,
 * installer completion, manifests, and startup contracts through bounded processes.
 */
const focusedTests = [
	"projectRootHealth.test.cjs",
	"connectionReceipt.test.cjs",
	"mainConnectionAcknowledgement.test.cjs",
	"sessionActionPolicyParity.test.cjs",
	"stableRouteIdentity.test.mjs",
	"installerExperience.test.cjs"
];

const regressionTests = [
	"mainStartupContract.test.cjs",
	"mainConnectionContract.test.cjs",
	"transactionalUnixInstaller.test.cjs",
	"installerManifestChecksumContract.test.cjs",
	"manifestGenerationSmoke.cjs",
	"manifestVerifyFresh.test.cjs",
	"releaseInventoryRegression.test.cjs",
	"releaseBundleClosure.test.cjs"
];

const results = [...focusedTests, ...regressionTests].map(runTest);
const failed = results.filter((result) => !result.ok);
assert.deepEqual(failed, [], JSON.stringify(failed, null, 2));

console.log(JSON.stringify({
	ok: true,
	suite: "reinstall-reliability",
	focused: focusedTests.length,
	regressions: regressionTests.length,
	tests: results.map((result) => result.file)
}, null, 2));

function runTest(file) {
	const fullPath = path.join(__dirname, file);
	const result = spawnSync(process.execPath, [fullPath], {
		cwd: path.resolve(__dirname, "../../../../.."),
		encoding: "utf8",
		timeout: 120000,
		maxBuffer: 8 * 1024 * 1024
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

function tail(value, length = 2000) {
	const text = String(value || "");
	return text.slice(Math.max(0, text.length - length));
}
