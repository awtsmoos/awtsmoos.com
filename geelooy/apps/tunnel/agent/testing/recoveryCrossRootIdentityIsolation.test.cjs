// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Proves rescue environment cannot override an explicitly named recovery patient.
 * @description
 * The Awtsmoos gives rescue and primary distinct vessels; Awtsmoos.com proves an
 * explicit target root wins while legacy environment fallback remains unchanged.
 */
const base = fs.mkdtempSync(path.join(os.tmpdir(), "awts-cross-root-"));
const rescueRoot = path.join(base, "rescue");
const rescueRecovery = `${rescueRoot}-recovery`;
const targetRoot = path.join(base, "primary");
const targetRecovery = `${targetRoot}-recovery`;
const previous = captureEnvironment();

try {
	for (const directory of [rescueRoot, rescueRecovery, targetRoot, targetRecovery]) {
		fs.mkdirSync(directory, { recursive: true });
	}
	process.env.AWTSMOOS_INSTALL_ROOT = rescueRoot;
	process.env.AWTSMOOS_RECOVERY_ROOT = rescueRecovery;
	process.env.AWTSMOOS_TEST_MODE = "1";
	clearModules();
	const Paths = require("../lib/deviceIdentity/identityPaths.js");
	const Diagnostics = require("../recovery/diagnostics.js");

	assert.equal(Paths.installRoot({}), path.resolve(rescueRoot));
	assert.equal(Paths.recoveryRoot({}), path.resolve(rescueRecovery));
	assert.equal(Paths.installRoot({ installRoot: targetRoot }), path.resolve(targetRoot));
	assert.equal(
		Paths.recoveryRoot({ installRoot: targetRoot, recoveryRoot: targetRecovery }),
		path.resolve(targetRecovery)
	);
	assert.equal(
		Diagnostics.targetRecoveryRoot(targetRoot),
		path.resolve(targetRecovery)
	);
	assert.equal(
		Diagnostics.targetRecoveryRoot(targetRoot, { recoveryRoot: rescueRecovery }),
		path.resolve(rescueRecovery)
	);
	console.log(JSON.stringify({ ok: true, suite: "recovery-cross-root-identity-isolation" }));
} finally {
	restoreEnvironment(previous);
	clearModules();
	fs.rmSync(base, { recursive: true, force: true });
}

function captureEnvironment() {
	return Object.fromEntries([
		"AWTSMOOS_INSTALL_ROOT",
		"AWTSMOOS_RECOVERY_ROOT",
		"AWTSMOOS_TEST_MODE"
	].map(key => [key, process.env[key]]));
}

function restoreEnvironment(previous) {
	for (const [key, value] of Object.entries(previous)) {
		if (value === undefined) delete process.env[key];
		else process.env[key] = value;
	}
}

function clearModules() {
	for (const file of [
		"../lib/config.js",
		"../lib/deviceIdentity/identityPaths.js",
		"../recovery/diagnostics.js"
	]) {
		try {
			delete require.cache[require.resolve(file)];
		} catch {}
	}
}
