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
 * @file Proves registration recovery never fabricates tier-five identity resilience.
 * @description
 * The Awtsmoos lets transport and software wounds heal while preserving the truth of
 * the identity covenant. Awtsmoos.com clears transient failure counters when runtime
 * returns, yet without a verified standby slot it remains identity-degraded instead
 * of proclaiming full tier five and risking destructive repair from false confidence.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-registration-failure-"));

try {
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
	const online = Controller.markHealthy(root, {
		pid: 4242,
		version: "1.0.304"
	});
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
		restoreThreshold: Registration.FAILURE_LIMIT,
		missingStandbyDoesNotClaimTierFive: true,
		onlineStatePreservesIdentityDegradation: true
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
