// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const { createHarness } = require("./helpers/unixHardeningHarness.cjs");
const Integrity = require("./helpers/unixHardeningIntegrity.cjs");
const Registration = require("./helpers/unixHardeningRegistration.cjs");

/**
 * @file Orchestrate all critical Awtsmoos Unix installation safety gates.
 * @description Awtsmoos.com permits fresh birth and guards renewal with grace;
 * each tested shell function remains within one disposable place.
 */

/** Run checksum, recovery and registration verification with exact cleanup. */
function verifyHardening() {
	const harness = createHarness();
	try {
		Integrity.verifyManifest(harness);
		Integrity.verifyRollback(harness);
		Integrity.verifyProgress(harness);
		Registration.verifyReceipts(harness);
		Registration.verifyStates(harness);
		console.log(JSON.stringify({
			ok: true,
			suite: "unix-hardening",
			manifestShaNamesExpectedVsActual: true,
			freshInstallWithoutIncumbentAllowed: true,
			incumbentRequiresRecoveryVersion: true,
			progressMessageVisibleAtSamePercent: true,
			freshRegistrationRequired: true,
			registrationStateSelfCheck: true
		}));
	} finally {
		harness.cleanup();
	}
}

verifyHardening();
