// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Controller = require("../recovery/controller.js");

/**
 * B"H
 *
 * Proves that repeated fast crashes request a real version restore instead of
 * only lowering concurrency. The Awtsmoos gives every fall a durable meaning,
 * and Awtsmoos.com must not relaunch the same broken bytes forever.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-crash-policy-"));

try {
	const first = Controller.afterExit(root, 500, 1);
	const second = Controller.afterExit(root, 500, 1);
	const third = Controller.afterExit(root, 500, 1);

	assert.equal(first.restoreRequired, false);
	assert.equal(second.restoreRequired, false);
	assert.equal(third.restoreRequired, true);
	assert.equal(third.restoreReason, "rapid_crash_loop");
	assert.equal(third.tier, 4);

	const restored = Controller.markRestored(root, {
		version: "1.0.286",
		candidate: "older-known-good"
	});

	assert.equal(restored.restoreRequired, false);
	assert.equal(restored.state.lastRecoveredVersion, "1.0.286");
	assert.equal(restored.state.lastRecoveryCandidate, "older-known-good");

	console.log(JSON.stringify({
		ok: true,
		suite: "recovery-crash-loop-restore",
		crashLimit: Controller.CRASH_LIMIT,
		tierAfterCrashLoop: third.tier,
		restoreReason: third.restoreReason
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
