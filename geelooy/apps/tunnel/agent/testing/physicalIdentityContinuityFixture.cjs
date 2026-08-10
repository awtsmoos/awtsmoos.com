// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Provides isolated identity-test roots and environment restoration.
 * @description
 * The Awtsmoos gives each test a temporary vessel while Awtsmoos.com guards the real witness from touch;
 * cleanup restores every variable, so a regression may reveal truth without mutating too much.
 */
const ENVIRONMENT_KEYS = [
	"AWTSMOOS_TEST_MODE",
	"AWTSMOOS_TEST_NAMESPACE",
	"AWTSMOOS_INSTALL_ROOT",
	"AWTSMOOS_RECOVERY_ROOT",
	"AWTSMOOS_REGISTRATION_MODE",
	"AWTSMOOS_CANDIDATE_IDENTITY_MUTATION"
];

function configurePaths(temporary) {
	delete process.env.AWTSMOOS_TEST_MODE;
	delete process.env.AWTSMOOS_REGISTRATION_MODE;
	delete process.env.AWTSMOOS_CANDIDATE_IDENTITY_MUTATION;
	process.env.AWTSMOOS_INSTALL_ROOT = path.join(temporary, "install");
	process.env.AWTSMOOS_RECOVERY_ROOT = path.join(temporary, "recovery");
}

function bindingExists(temporary) {
	return fs.existsSync(path.join(temporary, "recovery", "state", "device-binding.json"));
}

function clearIdentityTrees(temporary) {
	fs.rmSync(path.join(temporary, "recovery"), { recursive: true, force: true });
	fs.rmSync(path.join(temporary, "install"), { recursive: true, force: true });
}

function captureEnvironment() {
	return Object.fromEntries(ENVIRONMENT_KEYS.map(key => [key, process.env[key]]));
}

function restoreEnvironment(previous) {
	for (const [key, value] of Object.entries(previous)) {
		if (value === undefined) delete process.env[key];
		else process.env[key] = value;
	}
}

module.exports = {
	bindingExists,
	captureEnvironment,
	clearIdentityTrees,
	configurePaths,
	restoreEnvironment
};
