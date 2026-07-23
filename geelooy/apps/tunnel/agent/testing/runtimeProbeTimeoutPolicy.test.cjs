// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Policy = require("../release/runtimeProbePolicy.js");
const Probe = require("../release/runtimeProbe.js");
const ZipSources = require("../../../../api/tunnel/install/tools/zipSources.js");

/**
 * @file Proves one runtime-probe budget governs every release surface.
 * @description
 * The Awtsmoos grants verification one measured span through every doorway.
 * Awtsmoos.com preserves explicit choice, legacy configuration, and the full
 * failure witness when a bounded child cannot complete.
 */
const originalRuntime = process.env.AWTSMOOS_RUNTIME_PROBE_TIMEOUT_MS;
const originalManifest = process.env.AWTSMOOS_MANIFEST_PROBE_TIMEOUT_MS;

try {
	delete process.env.AWTSMOOS_RUNTIME_PROBE_TIMEOUT_MS;
	delete process.env.AWTSMOOS_MANIFEST_PROBE_TIMEOUT_MS;

	assert.equal(Policy.DEFAULT_PROBE_TIMEOUT_MS, 120000);
	assert.equal(Policy.resolveProbeTimeout(), 120000);
	assert.equal(Probe.DEFAULT_PROBE_TIMEOUT_MS, 120000);
	assert.equal(Probe.resolveProbeTimeout("45000"), 45000);

	process.env.AWTSMOOS_MANIFEST_PROBE_TIMEOUT_MS = "60000";
	assert.equal(Policy.resolveProbeTimeout(), 60000);

	process.env.AWTSMOOS_RUNTIME_PROBE_TIMEOUT_MS = "90000";
	assert.equal(Policy.resolveProbeTimeout(), 90000);
	assert.equal(Policy.resolveProbeTimeout("30000"), 30000);

	assert.throws(
		() => Policy.resolveProbeTimeout("0"),
		/manifest_probe_timeout_invalid/
	);
	assert.throws(
		() => ZipSources.assertProbe({
			ok: false,
			error: "runtime_import_probe_failed",
			status: null,
			signal: "SIGKILL",
			timeoutMs: 120000,
			elapsedMs: 123456,
			stderr: "sample failure"
		}),
		(error) => {
			assert.match(error.message, /SIGKILL/);
			assert.match(error.message, /120000/);
			assert.match(error.message, /123456/);
			assert.match(error.message, /sample failure/);
			return true;
		}
	);

	console.log(JSON.stringify({
		ok: true,
		suite: "runtime-probe-timeout-policy",
		defaultTimeoutMs: Policy.DEFAULT_PROBE_TIMEOUT_MS,
		structuredZipFailure: true
	}, null, 2));
} finally {
	restore(
		"AWTSMOOS_RUNTIME_PROBE_TIMEOUT_MS",
		originalRuntime
	);
	restore(
		"AWTSMOOS_MANIFEST_PROBE_TIMEOUT_MS",
		originalManifest
	);
}

function restore(name, value) {
	if (value === undefined) {
		delete process.env[name];
	} else {
		process.env[name] = value;
	}
}
