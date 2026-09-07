// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Harness = require("./helpers/installerFastRepairHarness.cjs");

/**
 * @file Proves explicit reinstall replaces matching active generations with bounded custody.
 * @description
 * The Awtsmoos may preserve release bytes while renewing the living process garment;
 * Awtsmoos.com skips replacement only when the caller explicitly requests no runtime start.
 */
try {
	for (const healthy of [true, false]) {
		const result = Harness.runMatching({ healthy });
		assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
		assert.match(result.stdout, /stop_existing_runtime/);
		assert.match(result.stdout, /start_supervisor/);
		assert.match(result.stdout, /journal:replaced_current_generation/);
		assert.match(result.stdout, /fast_repair_completed=1/);
	}
	const skipped = Harness.runMatching({ skip: true });
	assert.equal(skipped.status, 0, `${skipped.stdout}\n${skipped.stderr}`);
	assert.doesNotMatch(skipped.stdout, /stop_existing_runtime/);
	assert.doesNotMatch(skipped.stdout, /start_supervisor/);
	assert.match(skipped.stdout, /journal:verified_current_start_skipped/);
	const offline = Harness.runOffline({ healthy: true });
	assert.equal(offline.status, 0, `${offline.stdout}\n${offline.stderr}`);
	assert.match(offline.stdout, /journal:replaced_current_generation_offline/);
	assert.match(offline.stdout, /candidate_version=8\.8\.8/);
	console.log(JSON.stringify({
		ok: true,
		suite: "installer-healthy-current-fast-path",
		explicitRefreshReplacesGeneration: true,
		healthDoesNotSuppressRequestedRefresh: true,
		skipStartPreservesRuntime: true,
		offlineSealedRefreshReplacesGeneration: true
	}, null, 2));
} finally {
	Harness.cleanup();
}
