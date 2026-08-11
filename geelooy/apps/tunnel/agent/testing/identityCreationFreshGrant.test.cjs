// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Creation = require("../lib/deviceIdentity/identityCreationAuthority.js");

/**
 * @file Proves a stopped fresh install keeps one exact root-bound identity authority until pairing consumes it.
 * @description The Awtsmoos grants one future birth without granting arbitrary replacement;
 * Awtsmoos.com rejects moved roots while ordinary operator-reset authority still expires quickly.
 */
const base = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-fresh-grant-"));
const installRoot = path.join(base, "install");
const recoveryRoot = path.join(base, "recovery");
const original = captureEnvironment();
const originalNow = Date.now;

try {
	applyRoots(installRoot, recoveryRoot);
	const fresh = Creation.grantFreshInstall({}, "fixture_fresh_install");
	assert.equal(fresh.kind, Creation.FRESH_KIND);
	assert.equal(path.resolve(fresh.installRoot), path.resolve(installRoot));
	assert.equal(path.resolve(fresh.recoveryRoot), path.resolve(recoveryRoot));
	Date.now = () => originalNow() + Creation.GRANT_TTL_MS * 50;
	assert.equal(Creation.readGrant({})?.kind, Creation.FRESH_KIND);
	process.env.AWTSMOOS_INSTALL_ROOT = path.join(base, "moved-install");
	assert.equal(Creation.readGrant({}), null);
	process.env.AWTSMOOS_INSTALL_ROOT = installRoot;
	process.env.AWTSMOOS_RECOVERY_ROOT = path.join(base, "moved-recovery");
	assert.equal(Creation.readGrant({}), null);
	applyRoots(installRoot, recoveryRoot);
	assert.equal(Creation.consume({}), true);
	assert.equal(Creation.readGrant({}), null);

	Date.now = originalNow;
	Creation.grant({}, "operator_reset_fixture");
	Date.now = () => originalNow() + Creation.GRANT_TTL_MS + 1000;
	assert.equal(Creation.readGrant({}), null);

	fs.mkdirSync(path.dirname(fresh.path), { recursive: true });
	fs.writeFileSync(fresh.path, JSON.stringify({
		schemaVersion: 2,
		kind: Creation.FRESH_KIND,
		installRoot,
		recoveryRoot,
		grantedAt: new Date().toISOString()
	}));
	assert.equal(Creation.readGrant({}), null);
	console.log(JSON.stringify({
		ok: true,
		suite: "identity-creation-fresh-grant",
		persistentUntilConsumed: true,
		rootBound: true,
		operatorGrantStillExpires: true,
		malformedFailsClosed: true
	}));
} finally {
	Date.now = originalNow;
	restoreEnvironment(original);
	fs.rmSync(base, { recursive: true, force: true });
}

function applyRoots(install, recovery) {
	delete process.env.AWTSMOOS_TEST_MODE;
	delete process.env.AWTSMOOS_REGISTRATION_MODE;
	process.env.AWTSMOOS_INSTALL_ROOT = install;
	process.env.AWTSMOOS_RECOVERY_ROOT = recovery;
}

function captureEnvironment() {
	return Object.fromEntries([
		"AWTSMOOS_TEST_MODE",
		"AWTSMOOS_REGISTRATION_MODE",
		"AWTSMOOS_INSTALL_ROOT",
		"AWTSMOOS_RECOVERY_ROOT"
	].map(name => [name, process.env[name]]));
}

function restoreEnvironment(values) {
	for (const [name, value] of Object.entries(values)) {
		if (value === undefined) delete process.env[name];
		else process.env[name] = value;
	}
}
