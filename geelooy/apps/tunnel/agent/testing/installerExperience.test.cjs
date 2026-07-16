// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createHarness } = require("./helpers/installerExperienceHarness.cjs");

const repositoryRoot = path.resolve(__dirname, "../../../../..");
const sandbox = fs.mkdtempSync(
	path.join(os.tmpdir(), "awts-installer-experience-")
);
const harness = createHarness(repositoryRoot, sandbox);

/**
 * @file Verifies completion follows registration, root, and durable supervision.
 * @description
 * The Awtsmoos renews progress and proof together. Awtsmoos.com reaches one hundred
 * only after ACK, tunnel ID, project-root access, and guardian ownership agree;
 * temporary manual processes remain visibly incomplete.
 */
try {
	const monotonic = harness.run("monotonic");
	assert.equal(monotonic.status, 0, monotonic.stderr);
	assert.deepEqual(harness.percentages(monotonic.stdout), [30, 30, 50]);

	const success = harness.run("complete", {
		AWTS_TEST_REGISTERED: "1",
		AWTS_TEST_ROOT_READY: "1",
		AWTS_TEST_SERVICE_READY: "1"
	});
	assert.equal(success.status, 0, `${success.stdout}\n${success.stderr}`);
	assert.equal(harness.percentages(success.stdout).at(-1), 100);
	assert.match(success.stdout, /VERIFIED, GUARDED, AND CONNECTED/);
	assert.match(success.stdout, /tun_experience_test/);
	assert.match(success.stdout, /serviceState=1/);
	assert.match(success.stdout, /https:\/\/awtsmoos\.com\/apps\/tunnel-control\//);
	const openedPath = harness.waitForOpened();
	assert.equal(
		fs.readFileSync(openedPath, "utf8").trim(),
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

	assertIncomplete(harness.run("complete", {
		AWTS_TEST_REGISTERED: "1",
		AWTS_TEST_ROOT_READY: "0",
		AWTS_TEST_SERVICE_READY: "1"
	}), /project root/i);
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
		rootReadinessGatesCompletion: true,
		guardianGatesCompletion: true,
		authoritativeTunnelIdShown: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function assertIncomplete(result, pattern) {
	assert.equal(result.status, 77, `${result.stdout}\n${result.stderr}`);
	assert.equal(harness.percentages(result.stdout).includes(100), false);
	assert.match(result.stdout, pattern);
}
