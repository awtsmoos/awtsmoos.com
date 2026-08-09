// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Proves registration recovery in a hermetic identity universe.
 * @description
 * The Awtsmoos lets each test inhabit its own vessel. Awtsmoos.com never borrows the
 * user's canonical recovery identity to make a missing-standby scenario accidentally
 * healthy, so registration policy is measured independently of production Keychain.
 */
const base = fs.mkdtempSync(path.join(os.tmpdir(), "awts-registration-failure-"));
const root = path.join(base, "install");
const recoveryRoot = path.join(base, "recovery");
process.env.AWTSMOOS_TEST_MODE = "1";
process.env.AWTSMOOS_TEST_NAMESPACE = `registration-failure-${process.pid}`;
process.env.AWTSMOOS_INSTALL_ROOT = root;
process.env.AWTSMOOS_RECOVERY_ROOT = recoveryRoot;

const Controller = require("../recovery/controller.js");
const Metadata = require("../lib/deviceIdentity/metadata.js");
const Registration = require("../recovery/registrationFailureTransition.js");
const State = require("../recovery/stateStore.js");

try {
	assert.equal(Metadata.recoveryRoot({ installRoot: root }), recoveryRoot);
	State.write(root, { ...State.defaults(), tier: 5 });
	const first = Controller.reportRegistrationFailure(root, "registration_lost");
	assert.equal(first.restoreRequired, false);
	assert.equal(first.state.registrationFailures, 1);
	assert.equal(first.state.tier, 5);

	const second = Controller.reportRegistrationFailure(root, "registration_lost");
	assert.equal(second.restoreRequired, false);
	assert.equal(second.state.registrationFailures, 2);
	assert.equal(second.state.tier, 5);

	State.write(root, { ...second.state, tier: 2 });
	const online = Controller.markHealthy(root, { pid: 4242, version: "1.0.304" });
	assert.equal(online.state.registrationFailures, 0);
	assert.equal(online.state.lastRegistrationFailureAt, null);
	assert.equal(online.state.restoreRequired, false);
	assert.equal(online.slot.ok, false);
	assert.equal(online.state.tier, 2);
	assert.equal(online.state.identityInspectionRequired, true);
	assert.equal(online.state.lastOnlinePid, 4242);
	assert.equal(online.state.lastHealthyPid, null);

	Controller.reportRegistrationFailure(root, "registration_lost");
	Controller.reportRegistrationFailure(root, "registration_lost");
	const third = Controller.reportRegistrationFailure(root, "registration_lost");
	assert.equal(third.restoreRequired, true);
	assert.equal(third.state.registrationFailures, 3);
	assert.equal(third.restoreReason, "registration_lost");
	assert.equal(third.state.tier, 2);

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
		hermeticRecoveryRoot: true,
		missingStandbyDoesNotClaimTierFive: true
	}, null, 2));
} finally {
	fs.rmSync(base, { recursive: true, force: true });
}
