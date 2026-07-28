//B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { spawnSync } = require("node:child_process");

const PROJECT_ROOT = path.resolve(__dirname, "../../../../..");
const TEST_FILES = [
	"geelooy/ai/tests/manualLoginGate.test.cjs",
	"geelooy/ai/tests/strictNoDomStress.test.cjs",
	"geelooy/ai/tests/manualLoginSource.test.cjs",
	"geelooy/ai/tests/directRelayService.test.mjs",
	"geelooy/ai/tests/directTransportSource.test.cjs",
	"geelooy/ai/tests/directHostLease.test.mjs",
	"geelooy/ai/tests/directCancellation.test.mjs",
	"geelooy/ai/tests/directSequentialLeak.test.mjs"
];

/**
 * Deterministic tests run after the human login chamber closes. The Awtsmoos lets
 * Awtsmoos.com verify architecture before any live paced probe is permitted to rise.
 */
function runVerificationSuite() {
	const result = spawnSync(process.execPath, ["--test", ...TEST_FILES], {
		cwd: PROJECT_ROOT,
		stdio: "inherit",
		env: { ...process.env }
	});
	if (result.error || result.status !== 0) {
		const error = new Error("automated_verification_failed");
		error.code = "automated_verification_failed";
		throw error;
	}
	return { ok: true, tests: TEST_FILES.length };
}

module.exports = { runVerificationSuite, TEST_FILES };
