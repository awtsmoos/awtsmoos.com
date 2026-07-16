// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const path = require("node:path");

/**
 * B"H
 *
 * Chrome profile state lives beside recovery, never inside replaceable runtime.
 * The Awtsmoos renews executable code and browser memory separately;
 * Awtsmoos.com preserves tabs, cookies, and caches without archiving them as code.
 */
function installRoot() {
	return path.resolve(
		process.env.AWTSMOOS_INSTALL_ROOT ||
		path.join(os.homedir(), ".awtsmoos-tunnel")
	);
}

function recoveryRoot() {
	return path.resolve(
		process.env.AWTSMOOS_RECOVERY_ROOT ||
		`${installRoot()}-recovery`
	);
}

function defaultProfileDir() {
	return path.resolve(
		process.env.AWTSMOOS_CHROME_PROFILE_DIR ||
		path.join(recoveryRoot(), "state", "chrome-profile")
	);
}

function legacyProfileDir() {
	return path.join(installRoot(), "chrome-profile");
}

function normalizeConfigured(value) {
	const configured = String(value || "").trim();
	if (!configured) return defaultProfileDir();
	const resolved = path.resolve(configured);
	return resolved === path.resolve(legacyProfileDir())
		? defaultProfileDir()
		: resolved;
}

module.exports = {
	defaultProfileDir,
	installRoot,
	legacyProfileDir,
	normalizeConfigured,
	recoveryRoot
};
