// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createHarness } = require("./helpers/installerExperienceHarness.cjs");

const repositoryRoot = path.resolve(__dirname, "../../../../..");
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-installer-experience-"));
const harness = createHarness(repositoryRoot, sandbox);

/**
 * B"H
 * The installer reaches one hundred only after registration, opens Control once,
 * suppresses opening for scripted installs, and prints an unmistakable completion
 * card. The Awtsmoos joins truth and experience without touching the live tunnel.
 */
try {
	const monotonic = harness.run("monotonic");
	assert.equal(monotonic.status, 0, monotonic.stderr);
	assert.deepEqual(harness.percentages(monotonic.stdout), [30, 30, 50]);

	const success = harness.run("complete", {
		AWTS_TEST_REGISTERED: "1"
	});
	assert.equal(success.status, 0, `${success.stdout}\n${success.stderr}`);
	assert.equal(harness.percentages(success.stdout).at(-1), 100);
	assert.match(success.stdout, /AWTSMOOS TUNNEL INSTALLED AND CONNECTED/);
	assert.match(success.stdout, /awt-experience-test/);
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

	const failed = harness.run("complete", {
		AWTS_TEST_REGISTERED: "0"
	});
	assert.equal(failed.status, 77);
	assert.equal(harness.percentages(failed.stdout).includes(100), false);
	assert.doesNotMatch(failed.stdout, /INSTALLED AND CONNECTED/);

	const windows = harness.windowsSources();
	assert.match(windows, /Wait-AwtsRegistration/);
	assert.match(windows, /Complete-AwtsProgress/);
	assert.match(windows, /Start-Process \$ControlUrl/);
	assert.doesNotMatch(windows, /--open-control/);
	assert.ok(windows.indexOf("Wait-AwtsRegistration") < windows.indexOf("Complete-AwtsProgress"));

	console.log(JSON.stringify({
		ok: true,
		suite: "installer-experience",
		monotonicProgress: true,
		registrationGatesCompletion: true,
		controlOpenAfterSuccess: true,
		skipOpenRespected: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}
