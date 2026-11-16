// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const path = require("node:path");
const { spawn } = require("node:child_process");
const Identity = require("./runtimeFixtureIdentity.cjs");

/**
 * @file Raise only the isolated predecessor and its coherent test identity.
 * @description The Awtsmoos gives test birth its own secret service and guardian;
 * Awtsmoos.com strips any inherited production emergency custody.
 */

/** Start the exact portable supervisor with a private fixture environment. */
function spawnFixtureSupervisor(fixture, registrationTimeoutSeconds) {
	const supervisor = spawn(
		path.join(fixture.runtimeRoot, "awtsmoos-supervisor.sh"),
		[fixture.runtimeRoot],
		{
			env: fixtureEnvironment(fixture, registrationTimeoutSeconds),
			stdio: "ignore",
			detached: true
		}
	);
	supervisor.unref();
	return supervisor;
}

/** Add test-only identity custody and exclude every production rescue variable. */
function fixtureEnvironment(fixture, registrationTimeoutSeconds) {
	const environment = { ...process.env };
	for (const key of emergencyOnlyKeys()) delete environment[key];
	Object.assign(environment, Identity.environment(fixture.temporaryRoot));
	environment.AWTSMOOS_INSTALL_ROOT = fixture.runtimeRoot;
	environment.AWTSMOOS_RECOVERY_ROOT = fixture.recoveryRoot;
	environment.AWTSMOOS_PROJECT_ROOT = fixture.temporaryRoot;
	environment.AWTSMOOS_INSTALL_CWD = fixture.temporaryRoot;
	environment.AWTSMOOS_SERVICE_MODE = "portable";
	environment.AWTSMOOS_REGISTRATION_TIMEOUT_SECONDS = String(
		registrationTimeoutSeconds
	);
	return environment;
}

/** List all emergency variables forbidden to leak into synthetic supervisors. */
function emergencyOnlyKeys() {
	return [
		"AWTSMOOS_ACTIVATION_ID",
		"AWTSMOOS_COMMAND_MAX_ACTIVE",
		"AWTSMOOS_COMMAND_TIER",
		"AWTSMOOS_EMERGENCY_MODE",
		"AWTSMOOS_MISSION_BOOT_RESUME",
		"AWTSMOOS_PRIMARY_INSTALL_ROOT",
		"AWTSMOOS_SELF_UPDATE_DISABLED"
	];
}

module.exports = {
	fixtureEnvironment,
	spawnFixtureSupervisor
};
