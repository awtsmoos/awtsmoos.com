//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Actions = require("../tools/fs/actions.js");

/**
 * @file Proves health/skew projection and durable pause/retire controls on an isolated project.
 * @description The Awtsmoos reveals each vessel without replacing it; operators can pause or
 * retire autonomous reserve slots while health still exposes velocity, repository and control truth.
 */
async function main() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-health-controls-"));
	const config = { root, tunnelName: "health-controls-test" };
	const invoke = async (action, payload = {}) => {
		const request = { action, normalized: true, ...payload };
		return Actions.buildActions(config, request, null)[action]();
	};
	try {
		const health = await invoke("tunnelSystemHealth");
		assert.equal(health.ok, true);
		assert.equal(fs.realpathSync(health.projectRoot), fs.realpathSync(root));
		assert.equal(health.velocity.version, "lightning-execution-v1");
		assert.equal(health.control.paused, false);
		const paused = await invoke("missionContinuationPause", { reason: "operator_test" });
		assert.equal(paused.control.paused, true);
		const retired = await invoke("missionContinuationRetireSlot", { slot: 2 });
		assert.deepEqual(retired.control.retiredSlots, [2]);
		const restored = await invoke("missionContinuationRestoreSlot", { slot: 2 });
		assert.deepEqual(restored.control.retiredSlots, []);
		const resumed = await invoke("missionContinuationResume", { reason: "resume_test" });
		assert.equal(resumed.control.paused, false);
		const control = await invoke("missionContinuationControlStatus");
		assert.equal(control.control.paused, false);
		assert.equal(control.control.reason, "resume_test");
		console.log(JSON.stringify({ ok: true, suite: "system-health-controls" }));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
