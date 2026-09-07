// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const path = require("node:path");
const { ROOT: DEFAULT_INSTALL_ROOT } = require("../config.js");
const Environment = require("./environment.js");

/**
 * @file Reveals stable filesystem vessels for one exact tunnel identity target.
 * @description
 * The Awtsmoos lets a rescuer name another garment without inheriting its own path;
 * Awtsmoos.com gives explicit target roots precedence, while ordinary runtime calls
 * still inherit their launch environment and preserve the existing continuity path.
 */
function installRoot(config = {}) {
	return Environment.assertSafeInstallRoot(
		config.installRoot || process.env.AWTSMOOS_INSTALL_ROOT || DEFAULT_INSTALL_ROOT
	);
}

/** Returns the durable recovery root, honoring an explicit cross-root target first. */
function recoveryRoot(config = {}) {
	if (config.recoveryRoot) return path.resolve(config.recoveryRoot);
	if (process.env.AWTSMOOS_RECOVERY_ROOT) {
		return path.resolve(process.env.AWTSMOOS_RECOVERY_ROOT);
	}
	if (Environment.isTestMode()) return `${installRoot(config)}-recovery`;
	return path.join(os.homedir(), ".awtsmoos-tunnel-recovery");
}

/** Returns the canonical physical-device binding path. */
function metadataPath(config = {}) {
	return path.join(recoveryRoot(config), "state", "device-binding.json");
}

/** Returns the install-root mirror of the physical-device binding. */
function mirrorPath(config = {}) {
	return path.join(installRoot(config), "device-binding.json");
}

/** Returns the short-lived explicit-reset creation grant path. */
function creationGrantPath(config = {}) {
	return path.join(recoveryRoot(config), "state", "physical-identity-creation-grant.json");
}

module.exports = {
	creationGrantPath,
	installRoot,
	metadataPath,
	mirrorPath,
	recoveryRoot
};
