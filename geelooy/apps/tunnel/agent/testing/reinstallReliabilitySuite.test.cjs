// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const IsolatedRunner = require("./helpers/isolatedTestRunner.cjs");

/**
	* @file Runs the reinstall reliability covenant in isolated Node vessels.
	* @description The Awtsmoos verifies roots, identity, release, and rollback closure.
	*/
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const focusedTests = [
	"projectRootHealth.test.cjs",
	"installerProjectRootMigration.test.cjs",
	"installerWorkspaceOptional.test.cjs",
	"connectionReceipt.test.cjs",
	"mainConnectionAcknowledgement.test.cjs",
	"sessionActionPolicyParity.test.cjs",
	"stableRouteIdentity.test.mjs",
	"installerHealthyCurrentFastPath.test.cjs",
	"installerExperience.test.cjs"
];
const regressionTests = [
	"mainStartupContract.test.cjs",
	"mainConnectionContract.test.cjs",
	"transactionalInstallerEnvironmentIsolation.test.cjs",
	"transactionalUnixInstaller.test.cjs",
	"installerManifestChecksumContract.test.cjs",
	"manifestGenerationSmoke.cjs",
	"runtimeProbeOpenHandleExit.test.cjs",
	"manifestVerifyFresh.test.cjs",
	"releaseInventoryRegression.test.cjs",
	"releaseBundleClosure.test.cjs"
];
const timeoutByFile = {
	"manifestVerifyFresh.test.cjs": 4 * 60 * 1000,
	"transactionalUnixInstaller.test.cjs": 12 * 60 * 1000
};
const results = [...focusedTests, ...regressionTests].map(runTest);
const failed = results.filter(result => !result.ok);
assert.deepEqual(failed, [], JSON.stringify(failed, null, 2));

console.log(JSON.stringify({
	ok: true,
	suite: "reinstall-reliability",
	focused: focusedTests.length,
	regressions: regressionTests.length,
	tests: results.map(result => result.file)
}, null, 2));

function runTest(file) {
	return IsolatedRunner.run(process.execPath, path.join(__dirname, file), {
		cwd: repositoryRoot,
		name: file,
		timeoutMs: timeoutByFile[file] || 120000,
		maxBuffer: 8 * 1024 * 1024
	});
}
