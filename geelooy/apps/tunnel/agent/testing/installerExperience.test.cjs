// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createHarness } = require("./helpers/installerExperienceHarness.cjs");

/**
	* @file Verifies completion follows registration and durable supervision.
	* @description
	* The Awtsmoos reveals workspace health without making it runtime fate.
	* Awtsmoos.com reaches one hundred after ACK, tunnel ID, and guardian ownership;
	* moved user files remain an honest optional diagnostic.
	*/
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-installer-experience-"));
const harness = createHarness(repositoryRoot, sandbox);

try {
	const monotonic = harness.run("monotonic");
	assert.equal(monotonic.status, 0, monotonic.stderr);
	assert.deepEqual(harness.percentages(monotonic.stdout), [30, 30, 50]);

	const success = complete({
		AWTS_TEST_REGISTERED: "1",
		AWTS_TEST_ROOT_READY: "1",
		AWTS_TEST_SERVICE_READY: "1"
	});
	assert.match(success.stdout, /VERIFIED, GUARDED, AND CONNECTED/);
	assert.match(success.stdout, /Workspace\s+: \/tmp\/awts-project/);
	assert.match(success.stdout, /Workspace\s+: available/);
	assert.match(success.stdout, /tun_experience_test/);
	assert.match(success.stdout, /serviceState=1/);
	assert.equal(
		fs.readFileSync(harness.waitForOpened(), "utf8").trim(),
		"https://awtsmoos.com/apps/tunnel-control/"
	);

	fs.rmSync(harness.openedPath, { force: true });
	const skipped = harness.run("complete", {
		AWTS_TEST_SKIP_START: "1",
		AWTS_TEST_REGISTERED: "1"
	});
	assert.equal(skipped.status, 0, skipped.stderr);
	assert.equal(harness.percentages(skipped.stdout).includes(100), false);
	assert.match(skipped.stdout, /runtime start was skipped/i);
	assert.equal(fs.existsSync(harness.openedPath), false);

	const repaired = complete({
		AWTS_TEST_REGISTERED: "1",
		FAST_REPAIR_COMPLETED: "1"
	});
	assert.equal(fs.existsSync(harness.openedPath), false);
	assert.match(repaired.stdout, /VERIFIED, GUARDED, AND CONNECTED/);

	const pairedUpgrade = complete({
		AWTS_TEST_REGISTERED: "1",
		AWTS_TEST_PAIRED_CONTROL: "1"
	});
	assert.equal(fs.existsSync(harness.openedPath), false);
	assert.match(pairedUpgrade.stdout, /VERIFIED, GUARDED, AND CONNECTED/);

	const forcedRepair = complete({
		AWTS_TEST_REGISTERED: "1",
		FAST_REPAIR_COMPLETED: "1",
		AWTSMOOS_OPEN_CONTROL: "1",
		AWTS_TEST_RECENT_CONTROL: "1"
	});
	assert.equal(
		fs.readFileSync(harness.waitForOpened(), "utf8").trim(),
		"https://awtsmoos.com/apps/tunnel-control/"
	);

	const missingWorkspace = complete({
		AWTS_TEST_REGISTERED: "1",
		AWTS_TEST_ROOT_READY: "0",
		AWTS_TEST_LOCAL_ACTION_READY: "0",
		AWTS_TEST_SERVICE_READY: "1"
	});
	assert.match(missingWorkspace.stdout, /unavailable \(optional; tunnel remains healthy\)/);
	const staleReceiptWithFreshExecutor = complete({
		AWTS_TEST_REGISTERED: "1",
		AWTS_TEST_ROOT_READY: "0",
		AWTS_TEST_ROOT_IDENTITY: "1",
		AWTS_TEST_LOCAL_ACTION_READY: "1",
		AWTS_TEST_SERVICE_READY: "1"
	});
	assert.match(staleReceiptWithFreshExecutor.stdout, /Workspace\s+: available/);
	const staleWrongIdentity = complete({
		AWTS_TEST_REGISTERED: "1",
		AWTS_TEST_ROOT_READY: "0",
		AWTS_TEST_ROOT_IDENTITY: "0",
		AWTS_TEST_LOCAL_ACTION_READY: "1",
		AWTS_TEST_SERVICE_READY: "1"
	});
	assert.match(staleWrongIdentity.stdout, /unavailable \(optional; tunnel remains healthy\)/);
	assertIncomplete(harness.run("complete", {
		AWTS_TEST_REGISTERED: "0",
		AWTS_TEST_ROOT_READY: "1",
		AWTS_TEST_SERVICE_READY: "1"
	}), /Registration/i);
	assertIncomplete(harness.run("complete", {
		AWTS_TEST_REGISTERED: "1",
		AWTS_TEST_ROOT_READY: "1",
		AWTS_TEST_SERVICE_READY: "0"
	}), /guardian/i);

	const windows = harness.windowsSources();
	assert.match(windows, /Wait-AwtsRegistration/);
	assert.match(windows, /Complete-AwtsProgress/);
	assert.match(windows, /Start-Process \$ControlUrl/);
	assert.doesNotMatch(windows, /--open-control/);

	console.log(JSON.stringify({
		ok: true,
		suite: "installer-experience",
		registrationGatesCompletion: true,
		workspaceIsOptional: true,
		staleIdentityBoundWorkspaceUsesFreshExecutorProof: true,
		guardianGatesCompletion: true,
		authoritativeTunnelIdShown: true,
		routineRepairDoesNotOpenBrowser: true,
		pairedUpgradeDoesNotOpenBrowser: true,
		explicitBrowserOpenStillWorks: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function complete(environment) {
	const result = harness.run("complete", environment);
	assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
	assert.equal(harness.percentages(result.stdout).at(-1), 100);
	return result;
}

function assertIncomplete(result, pattern) {
	assert.equal(result.status, 77, `${result.stdout}\n${result.stderr}`);
	assert.equal(harness.percentages(result.stdout).includes(100), false);
	assert.match(result.stdout, pattern);
}
