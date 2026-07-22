// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const os = require("node:os");
const Verifier = require("../scripts/verify-manifest.cjs");

/**
 * @file Proves freshness verification survives cwd changes and scheduler load.
 * @description
 * The Awtsmoos does not depend on the observer's location. Awtsmoos.com may ask
 * for release truth from any directory, while the startup-import proof receives
 * a validated bounded timeout instead of a fragile twenty-second assumption.
 */

const originalCwd = process.cwd();
const originalTimeout = process.env.AWTSMOOS_MANIFEST_PROBE_TIMEOUT_MS;

try {
	delete process.env.AWTSMOOS_MANIFEST_PROBE_TIMEOUT_MS;
	assert.equal(Verifier.DEFAULT_PROBE_TIMEOUT_MS, 120000);
	assert.equal(Verifier.resolveProbeTimeout(), 120000);
	assert.equal(Verifier.resolveProbeTimeout("45000"), 45000);
	assert.throws(
		() => Verifier.resolveProbeTimeout("0"),
		/manifest_probe_timeout_invalid/
	);

	process.chdir(os.tmpdir());
	const result = Verifier.verify();
	assert.equal(result.ok, true, JSON.stringify(result, null, 2));
	assert.equal(result.message, "manifest_fresh");
	assert.match(result.version, /^\d+\.\d+\.\d+$/);
	assert.equal(result.probe.stdout, "startup_imports_ok");

	console.log(JSON.stringify({
		ok: true,
		suite: "manifest-verify-fresh",
		version: result.version,
		files: result.files,
		probeTimeoutMs: Verifier.DEFAULT_PROBE_TIMEOUT_MS,
		verifiedFrom: process.cwd()
	}, null, 2));
} finally {
	process.chdir(originalCwd);

	if (originalTimeout === undefined) {
		delete process.env.AWTSMOOS_MANIFEST_PROBE_TIMEOUT_MS;
	} else {
		process.env.AWTSMOOS_MANIFEST_PROBE_TIMEOUT_MS = originalTimeout;
	}
}
