// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Controller = require("../recovery/controller.js");
const Registration = require("../recovery/registrationFailureTransition.js");
const State = require("../recovery/stateStore.js");

/**
 * B"H
 *
 * One lost registration restarts the present world; only repeated transport
 * failure asks for an older world. The Awtsmoos renews each attempt, while
 * sustained health clears the operational count without erasing explicit restore.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-registration-failure-"));

try {
	State.write(root, State.defaults());
	const first = Controller.reportRegistrationFailure(root, "registration_lost");
	assert.equal(first.restoreRequired, false);
	assert.equal(first.state.registrationFailures, 1);
	assert.equal(first.state.tier, 4);

	const second = Controller.reportRegistrationFailure(root, "registration_lost");
	assert.equal(second.restoreRequired, false);
	assert.equal(second.state.registrationFailures, 2);
	assert.equal(second.state.tier, 3);

	const healthy = Controller.markHealthy(root, {
		pid: 4242,
		version: "1.0.301"
	});
	assert.equal(healthy.state.registrationFailures, 0);
	assert.equal(healthy.state.lastRegistrationFailureAt, null);
	assert.equal(healthy.state.restoreRequired, false);

	Controller.reportRegistrationFailure(root, "registration_lost");
	Controller.reportRegistrationFailure(root, "registration_lost");
	const third = Controller.reportRegistrationFailure(root, "registration_lost");
	assert.equal(third.restoreRequired, true);
	assert.equal(third.state.registrationFailures, 3);
	assert.equal(third.restoreReason, "registration_lost");

	const initial = State.defaults();
	const at = Date.parse("2026-07-14T00:00:00Z");
	const oldFailure = Registration.report(initial, "registration_lost", at);
	const outsideWindow = Registration.report(
		oldFailure,
		"registration_lost",
		at + Registration.FAILURE_WINDOW_MS + 1
	);
	assert.equal(outsideWindow.registrationFailures, 1);
	assert.equal(outsideWindow.restoreRequired, false);

	console.log(JSON.stringify({
		ok: true,
		suite: "registration-failure-recovery",
		restoreThreshold: Registration.FAILURE_LIMIT,
		firstFailureRestartsCurrentVersion: true,
		healthClearsOperationalFailures: true
	}, null, 2));
} finally {
	fs.rmSync(root, {
		recursive: true,
		force: true
	});
}
