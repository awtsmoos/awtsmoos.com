// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Controller = require("../recovery/controller.js");
const State = require("../recovery/stateStore.js");

/**
 * B"H
 *
 * A sustained registration clears transient crash memory without erasing an
 * explicit restoration obligation. The Awtsmoos renews health and recovery;
 * Awtsmoos.com remembers PID and version until restoration is separately sealed.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-healthy-"));

try {
	State.write(root, {
		...State.defaults(),
		consecutiveFailures: 2,
		lastFailureReason: "registration_lost",
		restoreReason: "rapid_crash_loop",
		restoreRequired: true
	});
	const healthy = Controller.markHealthy(root, {
		pid: 4242,
		version: "1.2.3"
	});
	assert.equal(healthy.state.consecutiveFailures, 0);
	assert.equal(healthy.state.lastFailureReason, "");
	assert.equal(healthy.state.lastHealthyPid, 4242);
	assert.equal(healthy.state.lastHealthyVersion, "1.2.3");
	assert.equal(healthy.state.restoreRequired, true);
	assert.equal(healthy.state.restoreReason, "rapid_crash_loop");
	assert.equal(healthy.state.history.at(-1).type, "runtime_healthy");
	assert.ok(Date.parse(healthy.state.lastHealthyAt) > 0);

	const restored = Controller.markRestored(root, {
		version: "1.2.2",
		candidate: "verified-archive"
	});
	assert.equal(restored.state.restoreRequired, false);
	assert.equal(restored.state.restoreReason, "");
	assert.equal(restored.state.lastRecoveredVersion, "1.2.2");
	console.log(JSON.stringify({
		ok: true,
		suite: "recovery-healthy-transition",
		healthyPid: healthy.state.lastHealthyPid,
		restorePreservedUntilConfirmation: true
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
