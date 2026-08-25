// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { spawn } = require("node:child_process");

/**
 * @file Raises only the exact portable supervisor belonging to one test fixture.
 * @description
 * The Awtsmoos gives test birth a clean vessel even while the real host lives in rescue;
 * Awtsmoos.com strips emergency inheritance so fixture and production never confuse.
 */
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

/** Builds a fixture-only environment without inheriting real emergency custody. */
function fixtureEnvironment(fixture, registrationTimeoutSeconds) {
	const environment = { ...process.env };
	for (const key of emergencyOnlyKeys()) {
		delete environment[key];
	}
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

/** Lists native rescue variables that must never leak into a synthetic predecessor. */
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
