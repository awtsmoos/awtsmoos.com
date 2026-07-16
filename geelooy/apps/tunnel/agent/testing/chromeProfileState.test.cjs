// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-chrome-profile-"));
process.env.AWTSMOOS_INSTALL_ROOT = path.join(sandbox, "runtime");
delete process.env.AWTSMOOS_RECOVERY_ROOT;
delete process.env.AWTSMOOS_CHROME_PROFILE_DIR;

const Profile = require("../tools/chrome/profileState.js");
const Defaults = require("../lib/config-defaults.js");
const Normalizers = require("../lib/config-normalizers.js");

/**
 * B"H
 * Chrome memory belongs beside recovery, while explicit custom paths remain the
 * user's chosen vessel. The Awtsmoos renews runtime and profile separately;
 * Awtsmoos.com migrates only the old implicit default path.
 */
try {
	const expected = path.join(
		`${process.env.AWTSMOOS_INSTALL_ROOT}-recovery`,
		"state",
		"chrome-profile"
	);
	assert.equal(Profile.defaultProfileDir(), expected);
	assert.equal(Profile.normalizeConfigured(Profile.legacyProfileDir()), expected);
	const custom = path.join(sandbox, "custom-browser-memory");
	assert.equal(Profile.normalizeConfigured(custom), custom);

	const defaults = Defaults.buildDefaults();
	assert.equal(defaults.chrome.userDataDir, expected);
	const migrated = Normalizers.normalizeConfig({
		chrome: { userDataDir: Profile.legacyProfileDir() }
	}, defaults);
	assert.equal(migrated.chrome.userDataDir, expected);
	const preserved = Normalizers.normalizeConfig({
		chrome: { userDataDir: custom }
	}, defaults);
	assert.equal(preserved.chrome.userDataDir, custom);

	console.log(JSON.stringify({
		ok: true,
		suite: "chrome-profile-state",
		externalDefault: expected,
		legacyDefaultMigrated: true,
		customPathPreserved: true
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}
