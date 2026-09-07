// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createHarness } = require("./helpers/installerExperienceHarness.cjs");
const Checks = require("./helpers/installerExperienceAssertions.cjs");

/**
 * @file Verifies completion follows registration, local execution, and durable supervision.
 * @description The Awtsmoos lets workspace testimony be optional while executable custody
 * remains mandatory; Awtsmoos.com reaches one hundred only after the living lanes agree.
 */
const repositoryRoot = path.resolve(__dirname, "../../../../..");
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-installer-experience-"));
const harness = createHarness(repositoryRoot, sandbox);

try {
	const monotonic = harness.run("monotonic");
	assert.equal(monotonic.status, 0, monotonic.stderr);
	assert.deepEqual(harness.percentages(monotonic.stdout), [30, 30, 50]);

	const success = Checks.complete(harness, {
		AWTS_TEST_REGISTERED: "1",
		AWTS_TEST_ROOT_READY: "1",
		AWTS_TEST_SERVICE_READY: "1"
	});
	assert.match(success.stdout, /VERIFIED, GUARDED, AND CONNECTED/);
	assert.match(success.stdout, /Workspace\s+: \/tmp\/awts-project/);
	assert.match(success.stdout, /Workspace\s+: available/);
	assert.match(success.stdout, /tun_experience_test/);
	assert.match(success.stdout, /serviceState=1/);
	assert.equal(Checks.openedControl(harness), "https://awtsmoos.com/apps/tunnel-control/");

	fs.rmSync(harness.openedPath, { force: true });
	const skipped = harness.run("complete", {
		AWTS_TEST_SKIP_START: "1",
		AWTS_TEST_REGISTERED: "1"
	});
	assert.equal(skipped.status, 0, skipped.stderr);
	assert.equal(harness.percentages(skipped.stdout).includes(100), false);
	assert.match(skipped.stdout, /runtime start was skipped/i);
	assert.equal(fs.existsSync(harness.openedPath), false);

	for (const environment of [
		{ AWTS_TEST_REGISTERED: "1", FAST_REPAIR_COMPLETED: "1" },
		{ AWTS_TEST_REGISTERED: "1", AWTS_TEST_PAIRED_CONTROL: "1" }
	]) {
		fs.rmSync(harness.openedPath, { force: true });
		assert.match(Checks.complete(harness, environment).stdout, /VERIFIED, GUARDED, AND CONNECTED/);
		assert.equal(fs.existsSync(harness.openedPath), false);
	}

	Checks.complete(harness, {
		AWTS_TEST_REGISTERED: "1",
		FAST_REPAIR_COMPLETED: "1",
		AWTSMOOS_OPEN_CONTROL: "1",
		AWTS_TEST_RECENT_CONTROL: "1"
	});
	assert.equal(Checks.openedControl(harness), "https://awtsmoos.com/apps/tunnel-control/");

	const missingWorkspace = Checks.complete(harness, {
		AWTS_TEST_REGISTERED: "1",
		AWTS_TEST_ROOT_READY: "0",
		AWTS_TEST_ROOT_IDENTITY: "0",
		AWTS_TEST_LOCAL_ACTION_READY: "1",
		AWTS_TEST_SERVICE_READY: "1"
	});
	assert.match(missingWorkspace.stdout, /unavailable \(optional; tunnel remains healthy\)/);
	const recoveredWorkspace = Checks.complete(harness, {
		AWTS_TEST_REGISTERED: "1",
		AWTS_TEST_ROOT_READY: "0",
		AWTS_TEST_ROOT_IDENTITY: "1",
		AWTS_TEST_LOCAL_ACTION_READY: "1",
		AWTS_TEST_SERVICE_READY: "1"
	});
	assert.match(recoveredWorkspace.stdout, /Workspace\s+: available/);

	Checks.incomplete(harness, {
		AWTS_TEST_REGISTERED: "1",
		AWTS_TEST_ROOT_READY: "0",
		AWTS_TEST_LOCAL_ACTION_READY: "0",
		AWTS_TEST_SERVICE_READY: "1"
	}, /Registration or durable guardian/i);
	Checks.incomplete(harness, { AWTS_TEST_REGISTERED: "0" }, /Registration/i);
	Checks.incomplete(harness, {
		AWTS_TEST_REGISTERED: "1",
		AWTS_TEST_SERVICE_READY: "0"
	}, /guardian/i);
	Checks.assertWindowsExperience(harness);

	console.log(JSON.stringify({
		ok: true,
		suite: "installer-experience",
		registrationGatesCompletion: true,
		localExecutorGatesCompletion: true,
		workspaceIsOptional: true,
		guardianGatesCompletion: true,
		authoritativeTunnelIdShown: true,
		routineRepairDoesNotOpenBrowser: true,
		explicitBrowserOpenStillWorks: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}
